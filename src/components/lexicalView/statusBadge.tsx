import type { OperationStatus } from "@/utils/analyzer";

const STATUS_COLORS: Record<OperationStatus, string> = {
  Correcta: "bg-sky-950 text-sky-300",
  Aviso: "bg-amber-950 text-amber-300",
  Incorrecta: "bg-red-950 text-red-300",
  "No implementado": "bg-stone-800 text-stone-300",
};

export const StatusBadge = ({ status }: { status: OperationStatus }) => (
  <span
    className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
  >
    {status}
  </span>
);
