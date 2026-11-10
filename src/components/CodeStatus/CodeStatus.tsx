import type { Status } from "@/utils/analyzer";

type CodeStatusProps = {
  elements?: Status[];
};

const COLUMNS: (keyof Status)[] = ["line", "start", "code", "status"];

const CodeStatusHeader = () => (
  <thead className="sticky top-0 bg-gray-100">
    <tr>
      {COLUMNS.map((column) => (
        <th className="border border-gray-200 px-3 py-2" key={column}>
          {column}
        </th>
      ))}
    </tr>
  </thead>
);

const CodeStatusRow = ({ status }: { status: Status }) => (
  <tr>
    {COLUMNS.map((column) => (
      <td className="border border-gray-200 px-3 py-2" key={column}>
        {status[column]}
      </td>
    ))}
  </tr>
);

const EmptyCodeStatus = () => (
  <tr>
    <td
      className="border border-gray-200 px-3 py-4 text-center text-gray-500"
      colSpan={COLUMNS.length}
    >
      No se encontraron líneas en las secciones .data.
    </td>
  </tr>
);

const CodeStatusBody = ({ elements }: { elements: Status[] }) => (
  <tbody>
    {elements.length === 0 ? (
      <EmptyCodeStatus />
    ) : (
      elements.map((status, index) => (
        <CodeStatusRow
          key={`${status.line}-${status.start}-${index}`}
          status={status}
        />
      ))
    )}
  </tbody>
);

export const CodeStatus = ({ elements = [] }: CodeStatusProps) => (
  <div className="max-h-96 overflow-auto">
    <table className="w-full border-collapse text-left text-sm text-gray-900">
      <CodeStatusHeader />
      <CodeStatusBody elements={elements} />
    </table>
  </div>
);
