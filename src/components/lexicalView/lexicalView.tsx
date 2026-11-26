"use client";
import { optimizedTokenizer, Token } from "@/utils/tokenizer";
import { analyze } from "@/utils/analyzer";
import { useMemo } from "react";
import { Chip } from "./typeChips/chip";
import { LineTable } from "./lineTable";
import { SymbolTable } from "./symbolTable";
import { useCodeContext } from "../contexts/codeContext";

interface Block {
  units: Token[][]; // cada unidad se mantiene junta al saltar de renglón
  spaced: boolean; // hubo una línea en blanco justo antes
}

// Agrupa los tokens por línea del código. Dentro de cada línea, la coma se pega
// al chip anterior (10 , 20 , 30) para que un salto de renglón nunca empiece con coma.
const buildBlocks = (tokens: Token[]): Block[] => {
  const blocks: Block[] = [];
  let units: Token[][] = [];
  let blankBefore = false;

  const closeLine = (newlines: number) => {
    const hasContent = units.some((u) =>
      u.some((t) => t.type !== "WHITESPACE"),
    );
    if (hasContent) {
      blocks.push({ units, spaced: blankBefore });
      blankBefore = false;
    } else {
      blankBefore = true;
    }
    if (newlines > 1) blankBefore = true;
    units = [];
  };

  for (const token of tokens) {
    if (token.type === "NEWLINE") {
      closeLine(token.value.split("\n").length - 1);
      continue;
    }

    const prev = units[units.length - 1];
    if (token.type === "UNKNOWN" && token.value === "," && prev) {
      prev.push(token);
    } else {
      units.push([token]);
    }
  }
  closeLine(1);

  return blocks;
};

export const LexicalView = () => {
  const { rawCode } = useCodeContext();
  const tokens: Token[] = useMemo(() => optimizedTokenizer(rawCode), [rawCode]);
  const blocks = useMemo(() => buildBlocks(tokens), [tokens]);
  const { lines, symbols } = useMemo(() => analyze(rawCode), [rawCode]);

  return (
    <div className="flex w-full h-full min-h-0 bg-stone-800 text-amber-50 font-mono">
      {/* Panel 2: chips, un bloque por línea de código (overflow visible para que los detalles al pasar el mouse no se recorten) */}
      <div className="w-1/2 min-w-0 h-full p-5 overflow-y-visible z-50">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`flex flex-wrap items-center gap-y-3 border-l-2 border-stone-600 py-1 pl-3 first:mt-0 ${
              block.spaced ? "mt-8" : "mt-4"
            }`}
          >
            {block.units.map((unit, j) => (
              <div key={j} className="inline-flex items-center">
                {unit.map((token, k) => (
                  <Chip token={token} key={k} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Panel 3: tablas, con su propio scroll */}
      <div className="w-1/2 min-w-0 h-full overflow-y-auto border-l border-stone-600 p-5 [&>section:first-child]:mt-0">
        <LineTable lines={lines} />
        <SymbolTable symbols={symbols} />
      </div>
    </div>
  );
};
