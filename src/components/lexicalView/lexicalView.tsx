"use client";
<<<<<<< HEAD
import { optimizedTokenizer, Token, tokenizer } from "@/utils/tokenizer";
import { useMemo } from "react";
=======

import { useDeferredValue, useMemo, useState } from "react";
import { tokenizer, type Token } from "@/utils/tokenizer";
>>>>>>> 207a787 (ee)
import { Chip } from "./typeChips/chip";
import { useCodeContext } from "../contexts/codeContext";

<<<<<<< HEAD
export const LexicalView = () => {
  const { rawCode } = useCodeContext();
  const tokens: Token[] = useMemo(() => optimizedTokenizer(rawCode), [rawCode]);
=======
interface LexicalViewProps {
  code: string;
}

const position = (code: string, offset: number) => {
  const before = code.slice(0, offset);
  const line = before.split("\n").length;
  const column = offset - (before.lastIndexOf("\n") + 1) + 1;
  return { line, column };
};

export const LexicalView = ({ code }: LexicalViewProps) => {
  const [showComments, setShowComments] = useState(false);

  const deferredCode = useDeferredValue(code);
  const tokens: Token[] = useMemo(() => tokenizer(deferredCode), [deferredCode]);
  const errors = useMemo(() => tokens.filter((t) => t.error), [tokens]);
>>>>>>> 207a787 (ee)

  return (
<<<<<<< HEAD
    <>
      <div className="bg-stone-800 p-5 text-amber-50 font-mono w-full h-full resize-none overflow-y-visible z-50 ">
        {tokens.map((token, index) => {
          return <Chip token={token} key={index} />;
        })}
=======
    <div className="flex h-full w-full flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input
          type="checkbox"
          checked={showComments}
          onChange={(e) => setShowComments(e.target.checked)}
        />
        Mostrar comentarios
      </label>

      <div className="flex-1 overflow-auto bg-stone-800 p-5 font-mono text-amber-50">
        {tokens.map((token) => (
          <Chip key={token.start} token={token} showComments={showComments} />
        ))}
>>>>>>> 207a787 (ee)
      </div>

      {errors.length > 0 && (
        <ul
          aria-label="Errores léxicos"
          className="max-h-32 overflow-auto bg-stone-900 p-3 font-mono text-sm text-red-400"
        >
          {errors.map((t) => {
            const { line, column } = position(deferredCode, t.start);
            return (
              <li key={t.start}>
                {line}:{column} — {t.error}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
