import type { AnalysisResult } from "@/utils/analyzer";
import { LineTable } from "./lineTable";
import { OperationTable } from "./operationTable";
import { SymbolTable } from "./symbolTable";

export type AnalysisView = "symbols" | "codeStatus" | "operations";

interface AnalysisContentProps {
  view: AnalysisView | null;
  analysis: AnalysisResult;
}

export const AnalysisContent = ({ view, analysis }: AnalysisContentProps) => {
  switch (view) {
    case "symbols":
      return <SymbolTable symbols={analysis.symbols} />;
    case "codeStatus":
      return <LineTable lines={analysis.lines} />;
    case "operations":
      return <OperationTable operations={analysis.operations} />;
    default:
      return null;
  }
};
