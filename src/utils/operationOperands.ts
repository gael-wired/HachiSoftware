import {
  dataSizeBits,
  generalPurposeRegisterSet,
  registerSizes,
} from "@/constants/ASSEMBLY";
import { getNumberType } from "@/utils/numerificador";
import type { Piece } from "@/utils/analysisSyntax";

export interface SymbolSize {
  name: string;
  size: string;
}

export type OperandKind = "register" | "memory" | "immediate" | "invalid";

export interface Operand {
  kind: OperandKind;
  text: string;
  size?: number;
  explicitSize?: boolean;
  value?: number;
  error?: string;
}

export const splitOperands = (pieces: Piece[]): Piece[][] => {
  if (pieces.length === 0) return [];

  const operands: Piece[][] = [[]];
  let depth = 0;

  for (const piece of pieces) {
    if (piece.value === "[" || piece.value === "(") depth++;
    if (piece.value === "]" || piece.value === ")") {
      depth = Math.max(0, depth - 1);
    }

    if (piece.value === "," && depth === 0) {
      operands.push([]);
    } else {
      operands[operands.length - 1].push(piece);
    }
  }

  return operands;
};

const parseInteger = (raw: string): number | undefined => {
  const sign = raw.startsWith("-") ? -1 : 1;
  const unsigned = raw.replace(/^[+-]/, "").toLowerCase();
  const type = getNumberType(unsigned);
  if (!type || type === "REAL") return undefined;

  const base =
    type === "HEXADECIMAL"
      ? 16
      : type === "BINARY"
        ? 2
        : type === "OCTAL"
          ? 8
          : 10;
  const digits = unsigned.replace(/^0[xbo]/, "").replace(/[hbyoqdt]$/, "");
  return sign * Number.parseInt(digits, base);
};

const splitAddressTerms = (
  pieces: Piece[],
): { sign: 1 | -1; pieces: Piece[] }[] | undefined => {
  const terms: { sign: 1 | -1; pieces: Piece[] }[] = [];
  let current: Piece[] = [];
  let sign: 1 | -1 = 1;

  for (const piece of pieces) {
    if (piece.value !== "+" && piece.value !== "-") {
      current.push(piece);
      continue;
    }
    if (current.length === 0) return undefined;

    terms.push({ sign, pieces: current });
    current = [];
    sign = piece.value === "+" ? 1 : -1;
  }

  if (current.length === 0) return undefined;
  terms.push({ sign, pieces: current });
  return terms;
};

const validateMemoryAddress = (pieces: Piece[]): string | undefined => {
  const terms = splitAddressTerms(pieces.slice(1, -1));
  if (!terms) return "la expresión de memoria está incompleta";

  let registerCount = 0;
  let symbolCount = 0;

  for (const term of terms) {
    if (term.pieces.length !== 1) {
      return "la expresión de memoria no es válida";
    }

    const piece = term.pieces[0];
    if (piece.type === "REGISTER") {
      if (term.sign < 0) {
        return "no se puede restar un registro en la dirección";
      }
      if (registerSizes[piece.value.toUpperCase()] !== 32) {
        return "la dirección requiere registros de 32 bits";
      }
      if (!generalPurposeRegisterSet.has(piece.value.toUpperCase())) {
        return "la dirección requiere registros generales";
      }
      registerCount++;
    } else if (piece.type === "VARIABLE") {
      if (term.sign < 0) {
        return "no se puede restar un símbolo en la dirección";
      }
      symbolCount++;
    } else if (piece.type !== "NUMBER") {
      return "la expresión de memoria no es válida";
    }
  }

  if (registerCount > 2 || symbolCount > 1) {
    return "la dirección contiene demasiados registros o símbolos";
  }
};

const invalidOperand = (text: string, error: string): Operand => ({
  kind: "invalid",
  text,
  error,
});

const getExplicitSize = (pieces: Piece[]) => {
  const sizeName = pieces[0]?.value.toUpperCase();
  if (!sizeName || dataSizeBits[sizeName] === undefined) {
    return { pieces, size: undefined };
  }

  let remaining = pieces.slice(1);
  if (remaining[0]?.value.toUpperCase() === "PTR") {
    remaining = remaining.slice(1);
  }
  return { pieces: remaining, size: dataSizeBits[sizeName] };
};

const getBracketError = (pieces: Piece[]): string | undefined => {
  const opening = pieces.filter((piece) => piece.value === "[").length;
  const closing = pieces.filter((piece) => piece.value === "]").length;
  if (opening === 0 && closing === 0) return undefined;
  if (opening !== 1) return "la memoria debe tener un corchete de apertura";
  if (closing === 0) return "falta el corchete de cierre de la memoria";
  if (closing !== 1) return "la memoria tiene un corchete de cierre sobrante";
  if (pieces[0]?.value !== "[" || pieces.at(-1)?.value !== "]") {
    return "los corchetes de memoria no están balanceados";
  }
};

const getMemoryName = (pieces: Piece[], isBracketed: boolean) => {
  if (!isBracketed && pieces.length === 1 && pieces[0].type === "VARIABLE") {
    return pieces[0].value;
  }
  return isBracketed
    ? pieces.slice(1, -1).find((piece) => piece.type === "VARIABLE")?.value
    : undefined;
};

export const readOperand = (
  originalPieces: Piece[],
  symbolSizes: Map<string, number>,
): Operand => {
  const text = originalPieces.map((piece) => piece.value).join("");
  const { pieces, size } = getExplicitSize(originalPieces);

  if (pieces.length === 1 && pieces[0].type === "NUMBER") {
    return {
      kind: "immediate",
      text,
      size,
      explicitSize: size !== undefined,
      value: parseInteger(pieces[0].value),
    };
  }

  if (pieces.length === 1 && pieces[0].type === "REGISTER") {
    if (size !== undefined) {
      return invalidOperand(text, "el calificador de tamaño no se usa con registros");
    }
    return {
      kind: "register",
      text,
      size: registerSizes[pieces[0].value.toUpperCase()],
    };
  }

  const bracketError = getBracketError(pieces);
  if (bracketError) return invalidOperand(text, bracketError);

  const isBracketed =
    pieces[0]?.value === "[" && pieces.at(-1)?.value === "]";
  if (isBracketed) {
    const error = validateMemoryAddress(pieces);
    if (error) return invalidOperand(text, error);
  }

  const memoryName = getMemoryName(pieces, isBracketed);
  if (!isBracketed && !memoryName) {
    return invalidOperand(text, "el operando no es válido");
  }

  return {
    kind: "memory",
    text,
    size:
      size ??
      (memoryName ? symbolSizes.get(memoryName.toUpperCase()) : undefined),
    explicitSize: size !== undefined,
  };
};

export const createSymbolSizes = (symbols: SymbolSize[]) =>
  new Map(
    symbols.map(({ name, size }) => [
      name.toUpperCase(),
      dataSizeBits[size.toUpperCase()],
    ]),
  );
