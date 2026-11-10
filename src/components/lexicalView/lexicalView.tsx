"use client";

import { useMemo } from "react";
import { optimizedTokenizer, type Token } from "@/utils/tokenizer";
import { Chip } from "./typeChips/chip";
import { useCodeContext } from "../contexts/codeContext";

export const LexicalView = () => {
  const { rawCode } = useCodeContext();
  const tokens: Token[] = useMemo(
    () => optimizedTokenizer(rawCode),
    [rawCode],
  );

  return (
    <div className="bg-stone-800 p-5 text-amber-50 font-mono w-full h-full resize-none overflow-y-visible z-50">
      {tokens.map((token, index) => (
        <Chip token={token} key={`${token.start}-${index}`} />
      ))}
    </div>
  );
};
