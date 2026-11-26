import {
  dataDirective,
  dataType,
  mnemonicOperands,
} from "@/constants/ASSEMBLY";
import { tokenizer, type TokenType } from "@/utils/tokenizer";

export type LineStatus = "Correcta" | "Incorrecta";

export interface LineResult {
  line: number; // número de línea (empieza en 1)
  text: string; // texto original de la línea
  status: LineStatus;
  reason?: string; // por qué es incorrecta
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
}

// Un token del tokenizador, o una pieza que armamos juntando varios (cadenas, números con signo)
type PieceType = TokenType | "STRING";
interface Piece {
  type: PieceType;
  value: string;
  start: number;
  end: number;
}

interface Outcome {
  ok: boolean;
  reason?: string;
  symbol?: Omit<SymbolEntry, "line">;
}

// DB/DW/DD... -> tamaño que se muestra en la tabla
const DIRECTIVE_TO_SIZE: Record<string, string> = {
  DB: "BYTE",
  DW: "WORD",
  DD: "DWORD",
  DQ: "QWORD",
  DT: "TBYTE",
};

// Devuelve el tamaño si la palabra es un tipo/directiva de datos, o null si no lo es
const toSize = (word: string): string | null => {
  const up = word.toUpperCase();
  if (dataDirective.includes(up)) return DIRECTIVE_TO_SIZE[up] ?? null;
  if (dataType.includes(up)) return up;
  return null;
};

const IGNORED: TokenType[] = ["WHITESPACE", "COMMENT", "NEWLINE"];
const SECTION = /^\.(data|code|stack)$/i;
const OPERAND_TYPES: PieceType[] = ["REGISTER", "NUMBER", "VARIABLE"];

// Tokeniza la línea con el tokenizador del proyecto, quita espacios y comentarios
// y junta lo que el tokenizador deja partido: 'Hola' y -5.
const toPieces = (line: string): Piece[] => {
  const raw = tokenizer(line).filter((t) => !IGNORED.includes(t.type));
  const pieces: Piece[] = [];

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    const next = raw[i + 1];

    // Cadena entre comillas
    if (t.type === "UNKNOWN" && (t.value === "'" || t.value === '"')) {
      const close = raw.findIndex(
        (r, j) => j > i && r.type === "UNKNOWN" && r.value === t.value,
      );
      if (close !== -1) {
        const end = raw[close].end;
        pieces.push({
          type: "STRING",
          value: line.slice(t.start, end),
          start: t.start,
          end,
        });
        i = close;
        continue;
      }
    }

    // Número con signo pegado: -5, +10
    if (
      t.type === "UNKNOWN" &&
      (t.value === "-" || t.value === "+") &&
      next?.type === "NUMBER" &&
      next.start === t.end
    ) {
      pieces.push({
        type: "NUMBER",
        value: line.slice(t.start, next.end),
        start: t.start,
        end: next.end,
      });
      i++;
      continue;
    }

    pieces.push({ type: t.type, value: t.value, start: t.start, end: t.end });
  }

  return pieces;
};

// Separa por comas que no estén dentro de paréntesis: 10,20 -> [[10],[20]]
const splitTopLevel = (pieces: Piece[]): Piece[][] => {
  if (pieces.length === 0) return [];

  const groups: Piece[][] = [[]];
  let depth = 0;

  for (const p of pieces) {
    if (p.type === "UNKNOWN" && p.value === "(") depth++;
    if (p.type === "UNKNOWN" && p.value === ")") depth--;

    if (p.type === "UNKNOWN" && p.value === "," && depth === 0) {
      groups.push([]);
    } else {
      groups[groups.length - 1].push(p);
    }
  }
  return groups;
};

const textOf = (line: string, group: Piece[]): string =>
  line.slice(group[0].start, group[group.length - 1].end);

// Valor válido en una definición de datos: número, ?, cadena o N dup(valor)
const isValue = (g: Piece[]): boolean => {
  if (g.length === 1) {
    return (
      g[0].type === "NUMBER" || g[0].type === "STRING" || g[0].value === "?"
    );
  }
  if (
    g.length >= 5 &&
    g[0].type === "NUMBER" &&
    g[1].value.toLowerCase() === "dup" &&
    g[2].value === "(" &&
    g[g.length - 1].value === ")"
  ) {
    return splitTopLevel(g.slice(3, -1)).every(isValue);
  }
  return false;
};

const check = (line: string, pieces: Piece[]): Outcome => {
  const [first, second] = pieces;

  // Etiqueta, sola o seguida de una instrucción
  if (first.type === "LABEL") {
    return pieces.length === 1 ? { ok: true } : check(line, pieces.slice(1));
  }

  // .data / .code / .stack [segment]
  if (SECTION.test(first.value)) {
    const rest = pieces.slice(1);
    const ok =
      rest.length === 0 ||
      (rest.length === 1 && rest[0].value.toLowerCase() === "segment");
    return ok
      ? { ok: true }
      : {
          ok: false,
          reason: `Después de ${first.value} solo se permite "segment"`,
        };
  }

  const word = first.value.toLowerCase();

  if (word === "ends" && pieces.length === 1) return { ok: true };

  if (
    word === "end" &&
    (pieces.length === 1 || (pieces.length === 2 && second.type === "VARIABLE"))
  ) {
    return { ok: true };
  }

  // .model flat,stdcall
  if (word === ".model") {
    const groups = splitTopLevel(pieces.slice(1));
    const ok =
      groups.length > 0 &&
      groups.every((g) => g.length === 1 && g[0].type !== "UNKNOWN");
    return ok
      ? { ok: true }
      : {
          ok: false,
          reason:
            ".model necesita al menos un parámetro (por ejemplo, flat,stdcall)",
        };
  }

  // Instrucciones: el número de operandos depende del mnemónico
  if (first.type === "MNEMONIC") {
    const name = first.value.toUpperCase();
    const expected = mnemonicOperands[name];
    const groups = splitTopLevel(pieces.slice(1));

    if (groups.some((g) => g.length === 0)) {
      return { ok: false, reason: `Operando vacío en ${name}` };
    }
    if (groups.length !== expected) {
      return {
        ok: false,
        reason:
          expected === 0
            ? `${name} no lleva operandos`
            : `${name} requiere ${expected} operando${expected > 1 ? "s" : ""}, pero tiene ${groups.length}`,
      };
    }

    // Un operando de una sola pieza debe ser registro, número o nombre
    const bad = groups.find(
      (g) => g.length === 1 && !OPERAND_TYPES.includes(g[0].type),
    );
    if (bad) {
      return { ok: false, reason: `Operando inválido: "${bad[0].value}"` };
    }
    return { ok: true };
  }

  // Definición de datos: [nombre] tipo valor[,valor...]
  const hasName = toSize(first.value) === null;
  const sizePiece = hasName ? second : first;
  const size = sizePiece ? toSize(sizePiece.value) : null;

  if (!size) {
    return {
      ok: false,
      reason:
        hasName && second
          ? `Se esperaba un tipo de dato (DB, DW, BYTE...) después de "${first.value}", pero se encontró "${second.value}"`
          : "Instrucción no reconocida",
    };
  }

  if (hasName && first.type !== "VARIABLE") {
    return { ok: false, reason: `Nombre inválido: "${first.value}"` };
  }

  const values = splitTopLevel(pieces.slice(hasName ? 2 : 1));
  if (values.length === 0) {
    return { ok: false, reason: "Falta el valor de la variable" };
  }

  const bad = values.find((g) => !isValue(g));
  if (bad) {
    return {
      ok: false,
      reason:
        bad.length === 0
          ? "Valor vacío"
          : `Valor inválido: "${textOf(line, bad)}"`,
    };
  }

  return {
    ok: true,
    symbol: hasName
      ? {
          name: first.value,
          kind: "variable",
          value: values.map((g) => textOf(line, g)).join(","),
          size,
        }
      : undefined,
  };
};

export const analyze = (source: string): AnalysisResult => {
  const lines: LineResult[] = [];
  const symbols: SymbolEntry[] = [];

  source.split(/\r?\n/).forEach((text, i) => {
    const pieces = toPieces(text);
    if (pieces.length === 0) return; // línea vacía o solo comentario

    const result = check(text, pieces);
    lines.push({
      line: i + 1,
      text: text.trim(),
      status: result.ok ? "Correcta" : "Incorrecta",
      reason: result.reason,
    });

    if (result.ok && result.symbol) {
      symbols.push({ ...result.symbol, line: i + 1 });
    }
  });

  return { lines, symbols };
};
