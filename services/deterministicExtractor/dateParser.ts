import { DateField } from "./types";

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12"
};

export function parseDateString(rawDateStr: string): DateField {
  const raw = rawDateStr.trim();
  if (!raw) {
    return {
      raw: "",
      start_normalized: null,
      end_normalized: null,
      is_current: false
    };
  }

  const isCurrent = /present|current|till date|now/i.test(raw);

  // Split date by delimiters like -, –, to, till
  const parts = raw.split(/[-–—]|(?:\s+to\s+)|(?:\s+till\s+)/i).map((p) => p.trim());

  let startNormalized: string | null = null;
  let endNormalized: string | null = null;

  if (parts.length >= 1 && parts[0]) {
    startNormalized = normalizeSingleDatePart(parts[0]);
  }

  if (parts.length >= 2 && parts[1]) {
    if (/present|current|till date|now/i.test(parts[1])) {
      endNormalized = null;
    } else {
      endNormalized = normalizeSingleDatePart(parts[1]);
    }
  } else if (isCurrent) {
    endNormalized = null;
  }

  return {
    raw,
    start_normalized: startNormalized,
    end_normalized: endNormalized,
    is_current: isCurrent
  };
}

function normalizeSingleDatePart(part: string): string | null {
  const cleaned = part.trim();

  // Pattern: "Jan 2025" or "January 2025"
  const monthYearMatch = cleaned.match(/^([a-zA-Z]{3,9})\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthStr = monthYearMatch[1].toLowerCase();
    const yearStr = monthYearMatch[2];
    const monthNum = MONTH_MAP[monthStr];
    if (monthNum) {
      return `${yearStr}-${monthNum}`;
    }
  }

  // Pattern: "01/2025" or "1/2025"
  const numMonthYearMatch = cleaned.match(/^(\d{1,2})[\/\.-](\d{4})$/);
  if (numMonthYearMatch) {
    const monthNum = numMonthYearMatch[1].padStart(2, "0");
    const yearStr = numMonthYearMatch[2];
    if (parseInt(monthNum, 10) >= 1 && parseInt(monthNum, 10) <= 12) {
      return `${yearStr}-${monthNum}`;
    }
  }

  // Pattern: "2025"
  const yearOnlyMatch = cleaned.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return yearOnlyMatch[1];
  }

  return null;
}
