import {
  dataDirective,
  dataDirectiveLabels,
  dataType,
} from "@/constants/ASSEMBLY";
import {
  splitLines,
  toPieces,
  type Piece,
} from "@/utils/analysisSyntax";
import {
  analyzeOperationLines,
  type OperationResult,
} from "@/utils/operationAnalyzer";
import { tokenizer } from "@/utils/tokenizer";

export type { OperationResult, OperationStatus } from "@/utils/operationAnalyzer";

export type LineStatus = "Correcta" | "Incorrecta";

export interface LineResult {
  line: number;
  text: string;
  status: LineStatus;
}

export interface SymbolEntry {
  name: string;
  kind: "variable";
  value: string;
  size: string;
  line: number;
}

export interface AnalysisResult {
  lines: LineResult[];
  symbols: SymbolEntry[];
  operations: OperationResult[];
}

const SECTION_NAMES = new Set([".CODE", ".DATA", ".STACK", ".TEXT"]);
const DECLARATION_TYPES = new Set([...dataDirective, ...dataType]);
const DECLARATION_VALUES = new Set(["NUMBER", "VARIABLE", "REGISTER", "STRING"]);
const DECLARATION_PUNCTUATION = new Set([",", "?", "(", ")", "+", "-"]);

const getSectionName = (pieces: Piece[]): string | undefined => {
  const [first, second, ...rest] = pieces;
  const firstValue = first?.value.toUpperCase();

  if (first?.type === "SECTION" || SECTION_NAMES.has(firstValue ?? "")) {
    return firstValue;
  }
  if (
    firstValue === "SECTION" &&
    second?.value.startsWith(".") &&
    rest.length === 0
  ) {
    return second.value.toUpperCase();
  }
};

const isDataSection = (pieces: Piece[]) =>
  getSectionName(pieces) === ".DATA";

const isDataEnd = (pieces: Piece[]) =>
  pieces.length === 1 && pieces[0].value.toUpperCase() === "ENDS";

const isDeclarationValue = (piece: Piece) =>
  DECLARATION_VALUES.has(piece.type) ||
  (piece.type === "RESERVED" && piece.value.toUpperCase() === "DUP") ||
  (piece.type === "UNKNOWN" &&
    DECLARATION_PUNCTUATION.has(piece.value));

const getDisplayText = (tokens: ReturnType<typeof splitLines>[number]) => {
  let text = "";
  let pendingSpace = false;

  for (const token of tokens) {
    if (token.type === "COMMENT") continue;
    if (token.type === "WHITESPACE") {
      pendingSpace = text.length > 0;
      continue;
    }

    if (pendingSpace) text += " ";
    text += token.value;
    pendingSpace = false;
  }

  return text;
};

const getSymbol = (
  pieces: Piece[],
  line: number,
): SymbolEntry | undefined => {
  const [name, type, ...values] = pieces;
  const typeName = type?.value.toUpperCase();

  if (
    name?.type !== "VARIABLE" ||
    !typeName ||
    !DECLARATION_TYPES.has(typeName) ||
    values.length === 0 ||
    !values.every(isDeclarationValue)
  ) {
    return undefined;
  }

  return {
    name: name.value,
    kind: "variable",
    value: values.map((piece) => piece.value).join("").trim(),
    size: dataDirectiveLabels[typeName] ?? typeName,
    line,
  };
};

const analyzeDataLines = (tokenLines: ReturnType<typeof splitLines>) => {
  const lines: LineResult[] = [];
  const symbols: SymbolEntry[] = [];
  let inDataSection = false;

  for (const [index, lineTokens] of tokenLines.entries()) {
    const text = lineTokens.map((token) => token.value).join("");
    const displayText = getDisplayText(lineTokens);
    const pieces = toPieces(text);
    if (pieces.length === 0) continue;

    if (isDataSection(pieces)) {
      inDataSection = true;
      lines.push({ line: index + 1, text: displayText, status: "Correcta" });
      continue;
    }
    if (!inDataSection) continue;
    if (getSectionName(pieces)) {
      inDataSection = false;
      continue;
    }

    const symbol = getSymbol(pieces, index + 1);
    const isEnd = isDataEnd(pieces);
    lines.push({
      line: index + 1,
      text: displayText,
      status: symbol || isEnd ? "Correcta" : "Incorrecta",
    });
    if (symbol) symbols.push(symbol);
    if (isEnd) inDataSection = false;
  }

  return { lines, symbols };
};

export const analyze = (source: string): AnalysisResult => {
  const tokenLines = splitLines(tokenizer(source));
  const { lines, symbols } = analyzeDataLines(tokenLines);

  return {
    lines,
    symbols,
    operations: analyzeOperationLines(tokenLines, symbols),
  };
};
