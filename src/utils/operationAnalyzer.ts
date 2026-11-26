import { toPieces } from "@/utils/analysisSyntax";
import { checkOperation } from "@/utils/operationChecks";
import {
  createSymbolSizes,
  splitOperands,
  type SymbolSize,
} from "@/utils/operationOperands";
import type { OperationResult } from "@/utils/operationTypes";
import type { Token } from "@/utils/tokenizer";

export type { OperationResult, OperationStatus } from "@/utils/operationTypes";

export const analyzeOperationLines = (
  tokenLines: Token[][],
  symbols: SymbolSize[],
): OperationResult[] => {
  const symbolSizes = createSymbolSizes(symbols);

  return tokenLines.flatMap((lineTokens, index) => {
    const text = lineTokens
      .filter((token) => token.type !== "COMMENT")
      .map((token) => token.value)
      .join("")
      .trim();
    const pieces = toPieces(text);
    let instructionIndex = 0;
    while (pieces[instructionIndex]?.type === "LABEL") instructionIndex++;
    if (pieces[instructionIndex]?.type !== "MNEMONIC") return [];

    const mnemonic = pieces[instructionIndex].value.toUpperCase();
    const result = checkOperation(
      mnemonic,
      splitOperands(pieces.slice(instructionIndex + 1)),
      symbolSizes,
    );
    return [{ line: index + 1, text, mnemonic, ...result }];
  });
};
