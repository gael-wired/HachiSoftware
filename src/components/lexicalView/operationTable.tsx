import type { OperationResult } from "@/utils/analyzer";
import { AnalysisTableFrame } from "./analysisTableFrame";
import { StatusBadge } from "./statusBadge";

interface OperationTableProps {
  operations: OperationResult[];
}

export const OperationTable = ({ operations }: OperationTableProps) => (
  <AnalysisTableFrame title="Análisis de operaciones">
    <table className="w-full table-fixed border-collapse text-left text-sm text-stone-200">
      <colgroup>
        <col className="w-[7%]" />
        <col className="w-[34%]" />
        <col className="w-[17%]" />
        <col className="w-[42%]" />
      </colgroup>
      <thead className="bg-stone-800 text-stone-300">
        <tr>
          <th scope="col" className="px-2 py-2.5 font-medium">
            N.º
          </th>
          <th scope="col" className="px-2 py-2.5 font-medium">
            Instrucción
          </th>
          <th scope="col" className="px-2 py-2.5 font-medium">
            Estado
          </th>
          <th scope="col" className="px-2 py-2.5 font-medium">
            Análisis
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-800">
        {operations.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-3 py-4 text-center text-stone-400">
              No se encontraron instrucciones.
            </td>
          </tr>
        ) : (
          operations.map((operation) => (
            <tr
              key={`${operation.line}-${operation.mnemonic}`}
              className="transition-colors hover:bg-stone-800/60"
            >
              <td className="break-words px-2 py-2 align-top text-stone-400">
                {operation.line}
              </td>
              <td className="break-words px-2 py-2 align-top">
                <code className="whitespace-pre-wrap break-words">
                  {operation.text}
                </code>
              </td>
              <td className="break-words px-2 py-2 align-top">
                <StatusBadge status={operation.status} />
              </td>
              <td className="break-words px-2 py-2 align-top">
                {operation.message}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </AnalysisTableFrame>
);
