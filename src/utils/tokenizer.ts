import {
  dataDirective,
  dataType,
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
  | "WHITESPACE"
  | "NEWLINE"
  | "VARIABLE"
  | "SECTION"
  | "UNKNOWN";

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: string;
  numberType?: NumberType;
}

export const tokenizer = (code: string): Token[] => {
  const tokens: Token[] = [];

  // 1: COMMENTS, 2: LABELS, 3: NUMBERS (lexema completo que empieza con dígito),
  // 4: WORDS, 5: NEWLINE, 6: WHITESPACES, 7: UNKNOWN
  const regex =
    /(;.*)|([a-zA-Z_]\w*:)|(\b[0-9]\w*\b)|(\.?[a-zA-Z_]\w*)|(\r?\n)+|(\t| )+|(.)/g;

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
      numberType = getNumberType(value) ?? undefined;
      type = numberType ? "NUMBER" : "UNKNOWN";

      let i = tokens.length - 1;
      while (i >= 0 && tokens[i].type === "WHITESPACE") i--;
      const prev = i >= 0 ? tokens[i] : undefined;

      if (prev?.type === "SECTION" && reserved.includes(value_upper)) {
        type = "RESERVED";
        numberType = undefined;
      }
    } else if (match[4]) {
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
    } else if (match[5]) {
      type = "NEWLINE";
    } else if (match[6]) {
      type = "WHITESPACE";
    }

    tokens.push({ type, value, start, end, numberType });
  }
  return tokens;
};

export const optimizedTokenizer = (code: string): Token[] => {
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