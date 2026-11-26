import {
  dataDirective,
  dataType,
  assemblyDirectives,
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

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: string;
  numberType?: NumberType;
}

const TOKEN_PATTERN =
  /(;.*)|([a-zA-Z_]\w*:)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b[0-9]\w*\b)|(%include\b)|(\.?[a-zA-Z_]\w*)|(\r?\n)+|(\t| )+|(.)/gi;
const CAPTURE = {
  COMMENT: 1,
  LABEL: 2,
  STRING: 3,
  NUMBER: 4,
  INCLUDE: 5,
  WORD: 6,
  NEWLINE: 7,
  WHITESPACE: 8,
} as const;
const RESERVED_WORDS = new Set(reserved);

const WORD_TYPES: [Set<string>, TokenType][] = [
  [new Set(dataDirective), "DIRECTIVE"],
  [new Set(mnemonics), "MNEMONIC"],
  [new Set(registers), "REGISTER"],
  [new Set(dataType), "TYPE"],
  [RESERVED_WORDS, "RESERVED"],
  [new Set(assemblyDirectives), "DIRECTIVE"],
];

const classifyWord = (word: string): TokenType => {
  const upperWord = word.toUpperCase();
  if (word.startsWith(".")) {
    if (dotDirective.includes(upperWord)) return "DIRECTIVE";
    if (sections.includes(upperWord)) return "SECTION";
    return "UNKNOWN";
  }

  return WORD_TYPES.find(([words]) => words.has(upperWord))?.[1] ?? "VARIABLE";
};

const getPreviousToken = (tokens: Token[]) => {
  for (let index = tokens.length - 1; index >= 0; index--) {
    if (tokens[index].type !== "WHITESPACE") return tokens[index];
  }
};

const classifyNumber = (value: string, tokens: Token[]) => {
  const numberType = getNumberType(value) ?? undefined;
  const followsSection = getPreviousToken(tokens)?.type === "SECTION";
  if (followsSection && RESERVED_WORDS.has(value.toUpperCase())) {
    return { type: "RESERVED" as const, numberType: undefined };
  }
  return {
    type: numberType ? "NUMBER" as const : "UNKNOWN" as const,
    numberType,
  };
};

const classifyMatch = (
  match: RegExpExecArray,
  tokens: Token[],
): { type: TokenType; numberType?: NumberType } => {
  const value = match[0];
  if (match[CAPTURE.COMMENT]) return { type: "COMMENT" };
  if (match[CAPTURE.LABEL]) return { type: "LABEL" };
  if (match[CAPTURE.STRING]) return { type: "STRING" };
  if (match[CAPTURE.NUMBER]) return classifyNumber(value, tokens);
  if (match[CAPTURE.INCLUDE]) return { type: "DIRECTIVE" };
  if (match[CAPTURE.WORD]) return { type: classifyWord(value) };
  if (match[CAPTURE.NEWLINE]) return { type: "NEWLINE" };
  if (match[CAPTURE.WHITESPACE]) return { type: "WHITESPACE" };
  return { type: "UNKNOWN" };
};

export const tokenizer = (code: string): Token[] => {
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;

  while ((match = TOKEN_PATTERN.exec(code)) !== null) {
    const { type, numberType } = classifyMatch(match, tokens);
    tokens.push({
      type,
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      numberType,
    });
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