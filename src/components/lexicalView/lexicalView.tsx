"use client";
import { optimizedTokenizer, Token } from "@/utils/tokenizer";
import { useMemo } from "react";
import { Chip } from "./typeChips/chip";
import { useCodeContext } from "../contexts/codeContext";

interface LineBlock {
  tokenGroups: Token[][];
  hasBlankLineBefore: boolean;
}

const buildLineBlocks = (tokens: Token[]): LineBlock[] => {
  const blocks: LineBlock[] = [];
  let tokenGroups: Token[][] = [];
  let hasBlankLineBefore = false;

  const finishLine = (lineBreaks: number) => {
    const hasContent = tokenGroups.some((group) =>
      group.some((token) => token.type !== "WHITESPACE"),
    );
    if (hasContent) {
      blocks.push({ tokenGroups, hasBlankLineBefore });
      hasBlankLineBefore = false;
    } else {
      hasBlankLineBefore = true;
    }
    if (lineBreaks > 1) hasBlankLineBefore = true;
    tokenGroups = [];
  };

  for (const token of tokens) {
    if (token.type === "NEWLINE") {
      finishLine(token.value.split("\n").length - 1);
      continue;
    }

    const previousGroup = tokenGroups[tokenGroups.length - 1];
    // Keep commas attached to the preceding token when lines wrap.
    if (token.type === "UNKNOWN" && token.value === "," && previousGroup) {
      previousGroup.push(token);
    } else {
      tokenGroups.push([token]);
    }
  }
  finishLine(1);

  return blocks;
};

export const LexicalView = () => {
  const { rawCode } = useCodeContext();
  const tokens: Token[] = useMemo(() => optimizedTokenizer(rawCode), [rawCode]);
  const blocks = useMemo(() => buildLineBlocks(tokens), [tokens]);

  return (
    <div className="flex w-full h-full min-h-0 bg-stone-800 text-amber-50 font-mono">
      {/* Chips, un bloque por línea de código (overflow visible para que los detalles al pasar el mouse no se recorten) */}
      <div className="w-full min-w-0 h-full p-5 overflow-y-visible z-50">
        {blocks.map((block, lineIndex) => (
          <div
            key={lineIndex}
            className={`flex flex-wrap items-center gap-y-3 border-l-2 border-stone-600 py-1 pl-3 first:mt-0 ${
              block.hasBlankLineBefore ? "mt-8" : "mt-4"
            }`}
          >
            {block.tokenGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="inline-flex items-center">
                {group.map((token, tokenIndex) => (
                  <Chip token={token} key={tokenIndex} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
