import mammoth from "mammoth";
import { createRequire } from "module";
import { RawPage, TextBlock } from "./types";

const require = createRequire(import.meta.url);

export interface ParsedDocument {
  full_text: string;
  pages: RawPage[];
  page_count: number;
  isScannedOrImageOnly: boolean;
  char_count: number;
}

const EXTRACTION_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function parseDocument(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<ParsedDocument> {
  return withTimeout(
    fileType === "docx" ? parseDocxDocument(buffer) : parsePdfDocument(buffer),
    EXTRACTION_TIMEOUT_MS,
    `Resume text extraction timed out after ${EXTRACTION_TIMEOUT_MS / 1000} seconds.`
  );
}

async function parseDocxDocument(buffer: Buffer): Promise<ParsedDocument> {
  let rawText = "";
  try {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value || "";
  } catch (err: any) {
    const textFallback = buffer.toString("utf8");
    if (textFallback.replace(/\s/g, "").length >= 30) {
      rawText = textFallback;
    } else {
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: TextBlock[] = lines.map((text, idx) => ({
    id: `block_p1_l${idx + 1}`,
    text,
    line: idx + 1
  }));

  const pages: RawPage[] = [
    {
      page: 1,
      text: rawText,
      blocks
    }
  ];

  const charCount = rawText.replace(/\s/g, "").length;
  const isScannedOrImageOnly = charCount < 80;

  return {
    full_text: rawText,
    pages,
    page_count: 1,
    isScannedOrImageOnly,
    char_count: charCount
  };
}

async function parsePdfDocument(buffer: Buffer): Promise<ParsedDocument> {
  let fullText = "";
  let pageCount = 1;
  let rawPagesText: string[] = [];

  try {
    const pdfParseMod = require("pdf-parse");
    const uint8 = new Uint8Array(buffer);

    // 1. Try pdf-parse v2 (PDFParse class)
    if (pdfParseMod && pdfParseMod.PDFParse) {
      try {
        const parser = new pdfParseMod.PDFParse(uint8);
        const textResult = await parser.getText();
        fullText = textResult.text || "";
        pageCount = textResult.total || (textResult.pages ? textResult.pages.length : 1);
        if (textResult.pages && Array.isArray(textResult.pages)) {
          rawPagesText = textResult.pages.map((p: any) => p.text || "");
        } else {
          rawPagesText = fullText.split(/\f/);
        }
      } catch (v2Err: any) {
        console.warn("[DeterministicParser] pdf-parse v2 class failed, trying fallback:", v2Err.message);
        const fn = typeof pdfParseMod === "function" ? pdfParseMod : (pdfParseMod.default || pdfParseMod);
        if (typeof fn === "function") {
          const legacyRes = await fn(buffer);
          fullText = legacyRes.text || "";
          pageCount = legacyRes.numpages || 1;
          rawPagesText = fullText.split(/\f/);
        } else {
          // Fallback text check if raw text buffer passed
          const textFallback = buffer.toString("utf8");
          if (textFallback.replace(/\s/g, "").length >= 30) {
            fullText = textFallback;
            pageCount = 1;
            rawPagesText = [fullText];
          } else {
            throw v2Err;
          }
        }
      }
    } else {
      // 2. Try legacy function export
      const fn = typeof pdfParseMod === "function" ? pdfParseMod : (pdfParseMod.default || pdfParseMod);
      if (typeof fn === "function") {
        const legacyRes = await fn(buffer);
        fullText = legacyRes.text || "";
        pageCount = legacyRes.numpages || 1;
        rawPagesText = fullText.split(/\f/);
      } else {
        const textFallback = buffer.toString("utf8");
        if (textFallback.replace(/\s/g, "").length >= 30) {
          fullText = textFallback;
          pageCount = 1;
          rawPagesText = [fullText];
        } else {
          throw new Error("PDF parser module does not export a supported parse function or class.");
        }
      }
    }
  } catch (err: any) {
    console.warn("[DeterministicParser] pdf-parse exception, trying binary stream extractor fallback:", err.message);
    const rawStr = buffer.toString("latin1");
    const tjMatches: string[] = [];
    const regex = /\(([^()]*)\)\s*T[jJ]/g;
    let m;
    while ((m = regex.exec(rawStr)) !== null) {
      if (m[1] && m[1].trim().length > 0) {
        tjMatches.push(m[1].trim());
      }
    }

    if (tjMatches.length > 5) {
      fullText = tjMatches.join(" ");
      pageCount = 1;
      rawPagesText = [fullText];
    } else {
      const asciiMatches = (rawStr.match(/[\x20-\x7E\t\r\n]{4,}/g) || [])
        .map(s => s.trim())
        .filter(s => !s.startsWith("%PDF") && !s.startsWith("endobj") && !s.startsWith("stream") && !s.includes("Font") && s.length > 3);
      
      if (asciiMatches.length > 3) {
        fullText = asciiMatches.join("\n");
        pageCount = 1;
        rawPagesText = [fullText];
      } else {
        const textFallback = buffer.toString("utf8");
        if (textFallback.replace(/\s/g, "").length >= 30 && !err.message.includes("timed out")) {
          fullText = textFallback;
          pageCount = 1;
          rawPagesText = [fullText];
        } else {
          console.error("[DeterministicParser] PDF extraction error:", err.message);
          throw new Error(`Failed to parse PDF document: ${err.message}`);
        }
      }
    }
  }

  const pages: RawPage[] = [];
  let globalLineCounter = 1;

  if (rawPagesText.length === 0) {
    rawPagesText = [fullText];
  }

  rawPagesText.forEach((pText, pIdx) => {
    const pageNum = pIdx + 1;
    const lines = pText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const pageBlocks: TextBlock[] = lines.map((text) => {
      const lineNum = globalLineCounter++;
      return {
        id: `block_p${pageNum}_l${lineNum}`,
        text,
        line: lineNum
      };
    });

    pages.push({
      page: pageNum,
      text: pText,
      blocks: pageBlocks
    });
  });

  const charCount = fullText.replace(/\s/g, "").length;
  const isScannedOrImageOnly = charCount < 80;

  return {
    full_text: fullText,
    pages,
    page_count: Math.max(pageCount, pages.length),
    isScannedOrImageOnly,
    char_count: charCount
  };
}
