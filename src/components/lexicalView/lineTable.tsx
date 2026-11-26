import type { LineResult } from "@/utils/analyzer";

export const LineTable = ({ lines }: { lines: LineResult[] }) => (
  <section aria-labelledby="line-table-title" className="mt-6">
    <h2 id="line-table-title" className="mb-2 text-base font-semibold">
      Verificación de líneas
    </h2>

    <div className="overflow-x-auto rounded-md border border-stone-600">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-stone-700/60 text-stone-300">
          <tr>
            <th scope="col" className="w-14 px-3 py-2 font-medium">
              N.º
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Línea
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Verificación
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-stone-700">
          {lines.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-stone-400"></td>
            </tr>
          ) : (
            lines.map((l) => {
              const ok = l.status === "Correcta";
              return (
                <tr key={l.line} className={ok ? "" : "bg-red-950/30"}>
                  <td className="px-3 py-2 align-top text-stone-400">
                    {l.line}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <code className="whitespace-pre">{l.text}</code>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
                        (ok
                          ? "bg-emerald-900/60 text-emerald-300"
                          : "bg-red-900/60 text-red-200")
                      }
                    >
                      {l.status}
                    </span>
                    {l.reason && (
                      <p className="mt-1 max-w-xs text-xs text-red-300/90">
                        {l.reason}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
);
