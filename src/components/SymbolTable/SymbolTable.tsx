import type { SymbolEntry } from "@/utils/analyzer";

type SymbolTableProps = {
  elements?: SymbolEntry[];
};

const COLUMNS: { key: keyof SymbolEntry; label: string }[] = [
  { key: "symbol", label: "Símbolo" },
  { key: "type", label: "Tipo" },
  { key: "value", label: "Valor" },
  { key: "size", label: "Tamaño" },
];

const SymbolTableHeader = () => (
  <thead className="sticky top-0 bg-gray-100">
    <tr>
      {COLUMNS.map(({ key, label }) => (
        <th className="border border-gray-200 px-3 py-2" key={key}>
          {label}
        </th>
      ))}
    </tr>
  </thead>
);

const SymbolTableRow = ({ symbol }: { symbol: SymbolEntry }) => (
  <tr>
    {COLUMNS.map(({ key }) => (
      <td className="border border-gray-200 px-3 py-2" key={key}>
        {symbol[key]}
      </td>
    ))}
  </tr>
);

const EmptySymbolTable = () => (
  <tr>
    <td
      className="border border-gray-200 px-3 py-4 text-center text-gray-500"
      colSpan={COLUMNS.length}
    >
      No se encontraron símbolos en las secciones .data.
    </td>
  </tr>
);

const SymbolTableBody = ({ elements }: { elements: SymbolEntry[] }) => (
  <tbody>
    {elements.length === 0 ? (
      <EmptySymbolTable />
    ) : (
      elements.map((symbol, index) => (
        <SymbolTableRow
          key={`${symbol.symbol}-${index}`}
          symbol={symbol}
        />
      ))
    )}
  </tbody>
);

export const SymbolTable = ({ elements = [] }: SymbolTableProps) => (
  <div className="max-h-96 overflow-auto">
    <table className="w-full border-collapse text-left text-sm text-gray-900">
      <SymbolTableHeader />
      <SymbolTableBody elements={elements} />
    </table>
  </div>
);
