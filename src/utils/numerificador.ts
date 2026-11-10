export type NumberType = "HEXADECIMAL" | "BINARY" | "OCTAL" | "DECIMAL" | "REAL";
 
export const NUMBER_TYPE_LABELS: Record<NumberType, string> = {
  HEXADECIMAL: "Hexadecimal",
  BINARY: "Binario",
  OCTAL: "Octal",
  DECIMAL: "Decimal",
  REAL: "Real codificado",
};
 
const HEX = /^[0-9][0-9a-f]*h$/;
const BINARY = /^[01]+[by]$/;
const OCTAL = /^[0-7]+[qo]$/;
const DECIMAL = /^[0-9]+[dt]?$/;
const REAL = /^[0-9][0-9a-f]*r$/;
 
const isEncodedReal = (digits: string): boolean =>
  [8, 16, 20].includes(digits.length) ||
  (digits.startsWith("0") && [9, 17, 21].includes(digits.length));
 
export const getNumberType = (raw: string): NumberType | null => {
  const s = raw.toLowerCase();

  if (/^0x[0-9a-f]+$/.test(s)) return "HEXADECIMAL";
  if (/^0b[01]+$/.test(s)) return "BINARY";
  if (/^0o[0-7]+$/.test(s)) return "OCTAL";
  if (HEX.test(s)) return "HEXADECIMAL";
  if (BINARY.test(s)) return "BINARY";
  if (OCTAL.test(s)) return "OCTAL";
  if (DECIMAL.test(s)) return "DECIMAL";
  if (REAL.test(s) && isEncodedReal(s.slice(0, -1))) return "REAL";
 
  return null;
};