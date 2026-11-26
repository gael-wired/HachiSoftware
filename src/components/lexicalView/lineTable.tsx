import type { LineResult } from "@/utils/analyzer";
import { AnalysisTableFrame } from "./analysisTableFrame";
import { StatusBadge } from "./statusBadge";

export const LineTable = ({ lines }: { lines: LineResult[] }) => (
  <AnalysisTableFrame title="Verificación de líneas">
    <table className="w-full table-fixed border-collapse text-left text-sm text-stone-200">
      <colgroup>
        <col className="w-[8%]" />
        <col className="w-[72%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead className="bg-stone-800 text-stone-300">
        <tr>
          <th scope="col" className="px-3 py-2.5 font-medium">
            N.º
          </th>
          <th scope="col" className="px-3 py-2.5 font-medium">
            Línea
          </th>
          <th scope="col" className="px-3 py-2.5 font-medium">
            Verificación
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-stone-800">
        {lines.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-3 py-4 text-center text-stone-400">
              No hay líneas para verificar.
            </td>
          </tr>
        ) : (
          lines.map((line) => (
            <tr
              key={line.line}
              className={
                line.status === "Correcta"
                  ? "transition-colors hover:bg-stone-800/60"
                  : "bg-red-950/30 transition-colors hover:bg-red-950/50"
              }
            >
              <td className="px-3 py-2 align-top text-stone-400">
                {line.line}
              </td>
              <td className="break-words px-3 py-2 align-top">
                <code className="whitespace-pre-wrap break-words">
                  {line.text}
                </code>
              </td>
              <td className="px-3 py-2 align-top">
                <StatusBadge status={line.status} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </AnalysisTableFrame>
);
