const POSTAL_CODE_PATTERN = /\b(0[1-9]\d{3}|[1-4]\d{4}|5[0-2]\d{3})\b/;
const AREA_PATTERN = /(\d{1,4}(?:[.,]\d{1,2})?)\s*(m2|m\u00b2|metros cuadrados|metro cuadrado)/i;

export function parseEuropeanPrice(rawValue: string): number | null {
  const amount = parseLocalizedNumber(rawValue);
  if (amount === null) {
    return null;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
}

export function parseAreaSqm(rawValue: string): number | null {
  const match = rawValue.match(AREA_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  const area = parseLocalizedNumber(match[1]);
  if (!Number.isFinite(area)) {
    return null;
  }

  return area;
}

export function parseSpanishPostalCode(rawValue: string): string | null {
  const match = rawValue.match(POSTAL_CODE_PATTERN);
  return match?.[1] ?? null;
}

function parseLocalizedNumber(rawValue: string): number | null {
  const sanitized = rawValue.replace(/\s+/g, '').replace(/[^\d.,]/g, '');
  if (!sanitized) {
    return null;
  }

  const decimalSeparator = detectDecimalSeparator(sanitized);
  const normalized = decimalSeparator
    ? sanitizeWithDecimalSeparator(sanitized, decimalSeparator)
    : sanitized.replace(/[.,]/g, '');

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function detectDecimalSeparator(value: string): '.' | ',' | null {
  const dotCount = countOccurrences(value, '.');
  const commaCount = countOccurrences(value, ',');

  if (dotCount > 0 && commaCount > 0) {
    return value.lastIndexOf('.') > value.lastIndexOf(',') ? '.' : ',';
  }

  if (dotCount === 1) {
    const decimalLength = value.length - value.lastIndexOf('.') - 1;
    return decimalLength === 3 ? null : '.';
  }

  if (commaCount === 1) {
    const decimalLength = value.length - value.lastIndexOf(',') - 1;
    return decimalLength === 3 ? null : ',';
  }

  return null;
}

function sanitizeWithDecimalSeparator(
  value: string,
  decimalSeparator: '.' | ','
): string {
  const groupingSeparator = decimalSeparator === '.' ? ',' : '.';
  const withoutGrouping = value.replaceAll(groupingSeparator, '');

  if (decimalSeparator === '.') {
    return withoutGrouping;
  }

  return withoutGrouping.replace(',', '.');
}

function countOccurrences(value: string, target: string): number {
  return value.split(target).length - 1;
}
