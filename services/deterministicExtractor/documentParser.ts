import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { RawPage, TextBlock } from "./types";

export interface ParsedDocument {
  full_text: string;
  pages: RawPage[];
  page_count: number;
  isScannedOrImageOnly: boolean;
  char_count: number;
}

export async function parseDocument(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<ParsedDocument> {
  if (fileType === "docx") {
    return parseDocxDocument(buffer);
  } else {
    return parsePdfDocument(buffer);
  }
}

async function parseDocxDocument(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || "";

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
  const pages: RawPage[] = [];

  try {
    const pdfData = await pdfParse(buffer);
    fullText = pdfData.text || "";
    pageCount = pdfData.numpages || 1;

    // Split text by form feed character (\f) if page boundaries present
    const rawPagesText = fullText.split(/\f/);

    let globalLineCounter = 1;

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

    if (pages.length === 0) {
      const lines = fullText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      pages.push({
        page: 1,
        text: fullText,
        blocks: lines.map((text, idx) => ({
          id: `block_p1_l${idx + 1}`,
          text,
          line: idx + 1
        }))
      });
    }
  } catch (err: any) {
    console.error("[DeterministicParser] PDF extraction error:", err.message);
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }

  const charCount = fullText.replace(/\s/g, "").length;
  const isScannedOrImageOnly = charCount < 80;

  return {
    full_text: fullText,
    pages,
    page_count: pageCount,
    isScannedOrImageOnly,
    char_count: charCount
  };
}
