import type { SymbolEntry } from "@/utils/analyzer";
import { AnalysisTableFrame } from "./analysisTableFrame";

export const SymbolTable = ({ symbols }: { symbols: SymbolEntry[] }) => (
  <AnalysisTableFrame title="Análisis de símbolos">
    <table className="w-full table-fixed border-collapse text-left text-sm text-stone-200">
      <colgroup>
        <col className="w-[24%]" />
        <col className="w-[15%]" />
        <col className="w-[43%]" />
        <col className="w-[18%]" />
      </colgroup>
      <thead className="border-b border-sky-900/70 bg-stone-800 text-stone-300">
        <tr>
          <th scope="col" className="px-3 py-2.5 font-medium tracking-wide">
            Símbolo
          </th>
          <th scope="col" className="px-3 py-2.5 font-medium tracking-wide">
            Tipo
          </th>
          <th scope="col" className="px-3 py-2.5 font-medium tracking-wide">
            Valor
          </th>
          <th scope="col" className="px-3 py-2.5 text-right font-medium tracking-wide">
            Tamaño
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-stone-800/80">
        {symbols.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="bg-stone-800/20 px-3 py-5 text-center text-stone-400"
            >
              <code className="font-mono text-sky-300">var1 dw 10000</code>
            </td>
          </tr>
        ) : (
          symbols.map((symbol) => (
            <tr
              key={`${symbol.name}-${symbol.line}`}
              className="transition-colors odd:bg-stone-800/15 hover:bg-sky-950/35"
            >
              <td className="break-words px-3 py-2 font-medium text-sky-100">
                {symbol.name}
              </td>
              <td className="break-words px-3 py-2 text-stone-400">
                {symbol.kind}
              </td>
              <td className="px-3 py-2 align-middle">
                <span className="inline-block max-w-full break-all rounded-sm border border-sky-900/70 bg-sky-950/60 px-2 py-0.5 font-mono text-xs text-sky-300">
                  {symbol.value}
                </span>
              </td>
              <td className="px-3 py-2 text-right align-middle">
                <span className="inline-block rounded-sm border border-sky-900/70 bg-sky-950/60 px-2 py-0.5 tabular-nums text-sky-300">
                  {symbol.size}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </AnalysisTableFrame>
);
