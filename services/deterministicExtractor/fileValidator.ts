import crypto from "crypto";

export interface FileValidationResult {
  isValid: boolean;
  detectedType: "pdf" | "docx" | "unsupported";
  fileHash: string;
  fileSizeBytes: number;
  error?: string;
  isScannedOrImageOnly?: boolean;
}

export function validateResumeFile(buffer: Buffer, fileName: string): FileValidationResult {
  const fileSizeBytes = buffer.length;
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

  if (!buffer || fileSizeBytes === 0) {
    return {
      isValid: false,
      detectedType: "unsupported",
      fileHash: "",
      fileSizeBytes: 0,
      error: "File is empty (0 bytes)."
    };
  }

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      detectedType: "unsupported",
      fileHash: crypto.createHash("sha256").update(buffer).digest("hex"),
      fileSizeBytes,
      error: `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds 10MB maximum limit.`
    };
  }

  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Magic bytes inspection
  // PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
  const isPdfMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  // DOCX (Zip archive): PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  const isDocxMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  let detectedType: "pdf" | "docx" | "unsupported" = "unsupported";

  if (isPdfMagic || ext === "pdf") {
    detectedType = "pdf";
  } else if (isDocxMagic || ext === "docx") {
    detectedType = "docx";
  }

  if (detectedType === "unsupported") {
    return {
      isValid: false,
      detectedType: "unsupported",
      fileHash,
      fileSizeBytes,
      error: `Unsupported file type for "${fileName}". Only PDF (.pdf) and Word (.docx) files are supported.`
    };
  }

  return {
    isValid: true,
    detectedType,
    fileHash,
    fileSizeBytes
  };
}
