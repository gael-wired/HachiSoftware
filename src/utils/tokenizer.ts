import {
  dataDirective,
  dataType,
  ioMacros,
  mnemonics,
  registers,
  reserved,
  dotDirective,
  sections,
} from "@/constants/ASSEMBLY";
import { getNumberType, type NumberType } from "@/utils/numerificador";

export type TokenType =
  | "COMMENT"
  | "LABEL"
  | "NUMBER"
  | "RESERVED"
  | "REGISTER"
  | "TYPE"
  | "DIRECTIVE"
  | "MNEMONIC"
  | "STRING"
  | "WHITESPACE"
  | "NEWLINE"
  | "VARIABLE"
  | "SECTION"
  | "UNKNOWN";

export type NumberType = "decimal" | "binary" | "octal" | "hexadecimal";

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: string;
  numberType?: NumberType;
}

const getNumberType = (value: string): NumberType => {
  const number = value.toLowerCase();

  if (number.endsWith("h")) return "hexadecimal";
  if (number.endsWith("b")) return "binary";
  if (number.endsWith("o") || number.endsWith("q")) return "octal";

  return "decimal";
};

export const tokenizer = (code: string): Token[] => {
  const tokens: Token[] = [];
  const tokens: Token[] = [];

  // Captures: comment, label, string, number, word, newline, whitespace, unknown.
  const regex =
    /(;.*)|([a-zA-Z_]\w*:)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|[0-9][0-9a-fA-F]*[hqodbrtyHQODBRTY]?)\b)|(\.*[a-zA-Z_]\w*)|(\n)+|(\t| )+|(%include)|(.)/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    const value = match[0];
    const value_upper = value.toUpperCase();

    const start = match.index;
    const end = start + value.length;

    let type: TokenType = "UNKNOWN";
    let numberType: NumberType | undefined;

    if (match[1]) {
      type = "COMMENT";
    } else if (match[2]) {
      type = "LABEL";
    } else if (match[3]) {
      type = "STRING";
    } else if (match[4]) {
      type = "NUMBER";

      let i = tokens.length - 1;
      while (i >= 0 && tokens[i].type === "WHITESPACE") i--;
      const prev = i >= 0 ? tokens[i] : undefined;

      if (tokens[i]?.type === "SECTION") {
        if (reserved.includes(value)) {
          type = "RESERVED";
        }
      }
    } else if (match[5]) {
      type = "VARIABLE";

      if (value.startsWith(".")) {
        type = "UNKNOWN";

        if (dotDirective.includes(value_upper)) {
          type = "DIRECTIVE";
        } else if (sections.includes(value_upper.slice(1))) {
          type = "SECTION";
        }
      }
      // Directives
      else if (dataDirective.includes(value_upper)) {
        type = "DIRECTIVE";
      }
      // Mnemonics
      else if (mnemonics.includes(value_upper)) {
        type = "MNEMONIC";
      }
      // Registers
      else if (registers.includes(value_upper)) {
        type = "REGISTER";
      }
      // Data types
      else if (dataType.includes(value_upper)) {
        type = "TYPE";
      }
      // Reserved words
      else if (reserved.includes(value_upper)) {
        type = "RESERVED";
      }
    } else if (match[6]) {
      type = "NEWLINE";
    } else if (match[7]) {
      type = "WHITESPACE";
    } else if (match[8]) {
      type = "DIRECTIVE";
    } else if (match[9]) type = "UNKNOWN";

    if (type === "VARIABLE" && ioMacros.includes(value_upper)) {
      type = "RESERVED";
    }

    const token: Token = { type, value, start, end };
    if (type === "NUMBER") token.numberType = getNumberType(value);
    tokens.push(token);
  }
  return tokens;
};

export const optimizedTokenizer = (code: string): Token[] => {
  /**
   * Devuelve una lista de tokens optimizados eliminando espacios en blanco y saltos de línea
   */

  const tokens = tokenizer(code);

  const optimizedTokens: Token[] = [];

  for (const token of tokens) {
    if (token.type === "COMMENT") continue;

    if (token.type === "NEWLINE") {
      const lastToken = optimizedTokens[optimizedTokens.length - 1];

      if (lastToken && lastToken.type === "NEWLINE") {
        lastToken.value += token.value;
        lastToken.end = token.end;
        continue;
      }
    }

    optimizedTokens.push(token);
  }
  return optimizedTokens;
};