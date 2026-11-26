import type { SymbolEntry } from "@/utils/analyzer";

export const SymbolTable = ({ symbols }: { symbols: SymbolEntry[] }) => (
  <section aria-labelledby="symbol-table-title" className="mt-6">
    <h2 id="symbol-table-title" className="mb-2 text-base font-semibold">
      Tabla de Símbolos
    </h2>

    <div className="overflow-x-auto rounded-md border border-stone-600">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-stone-700/60 text-stone-300">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Símbolo
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Tipo
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Valor
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Tamaño
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-stone-700">
          {symbols.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-stone-400">
                <code>var1 dw 10000</code>.
              </td>
            </tr>
          ) : (
            symbols.map((s) => (
              <tr key={`${s.name}-${s.line}`}>
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="px-3 py-2 text-stone-300">{s.kind}</td>
                <td className="px-3 py-2">
                  <span className="inline-block rounded px-3 py-0.5 outline-2 outline-black bg-violet-200 text-violet-950">
                    {s.value}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-block rounded px-3 py-0.5 outline-2 outline-black bg-sky-200 text-sky-950">
                    {s.size}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);
