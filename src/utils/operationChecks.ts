import {
  generalPurposeRegisterSet,
  segmentRegisterSet,
} from "@/constants/ASSEMBLY";
import {
  readOperand,
  type Operand,
} from "@/utils/operationOperands";
import type { Piece } from "@/utils/analysisSyntax";
import type { OperationCheck } from "@/utils/operationTypes";

const IMPLEMENTED_OPERATIONS = new Set(["MOVZX", "SUB", "XOR", "RET", "PUSH"]);
const fail = (mnemonic: string, reason: string): OperationCheck => ({
  status: "Incorrecta",
  message: `La operación ${mnemonic} falló: ${reason}.`,
});

const valid = (mnemonic: string): OperationCheck => ({
  status: "Correcta",
  message: `La operación ${mnemonic} es válida.`,
});

const warn = (mnemonic: string, reason: string): OperationCheck => ({
  status: "Aviso",
  message: `La operación ${mnemonic} tiene un aviso: ${reason}.`,
});

const isGeneralPurposeRegister = (operand: Operand) =>
  operand.kind === "register" &&
  generalPurposeRegisterSet.has(operand.text.toUpperCase());

const immediateFits = (value: number, bits: number) =>
  value >= -(2 ** (bits - 1)) && value <= 2 ** bits - 1;

const checkReturn = (
  mnemonic: string,
  operands: Piece[][],
  symbolSizes: Map<string, number>,
): OperationCheck => {
  if (operands.length === 0) return valid(mnemonic);
  if (operands.length !== 1) {
    return fail(mnemonic, "RET acepta como máximo un operando");
  }

  const operand = readOperand(operands[0], symbolSizes);
  if (operand.kind === "invalid") {
    return fail(mnemonic, operand.error ?? "el operando no es válido");
  }
  if (operand.kind !== "immediate" || operand.value === undefined) {
    return fail(
      mnemonic,
      "el único operando permitido es un valor inmediato entero",
    );
  }
  if (operand.size !== undefined && operand.size !== 16) {
    return fail(mnemonic, "el inmediato de RET debe ser de 16 bits");
  }
  if (operand.value < 0 || operand.value > 65535) {
    return warn(mnemonic, "el inmediato de RET está fuera del rango de 16 bits");
  }
  return valid(mnemonic);
};

const checkPush = (
  mnemonic: string,
  operands: Piece[][],
  symbolSizes: Map<string, number>,
): OperationCheck => {
  if (operands.length !== 1) {
    return fail(
      mnemonic,
      `se esperaba 1 operando y se recibieron ${operands.length}`,
    );
  }

  const operand = readOperand(operands[0], symbolSizes);
  if (operand.kind === "invalid") {
    return fail(mnemonic, operand.error ?? "el operando no es válido");
  }
  if (operand.kind === "immediate") {
    if (operand.value === undefined) {
      return fail(mnemonic, "el inmediato debe ser un número entero");
    }

    const size = operand.size ?? 32;
    if (size !== 16 && size !== 32) {
      return fail(mnemonic, "el inmediato de PUSH debe ser de 16 o 32 bits");
    }
    if (!immediateFits(operand.value, size)) {
      return warn(mnemonic, `el inmediato está fuera del rango de ${size} bits`);
    }
    return valid(mnemonic);
  }

  const isSegmentRegister =
    operand.kind === "register" &&
    segmentRegisterSet.has(operand.text.toUpperCase());
  if (
    (isGeneralPurposeRegister(operand) || isSegmentRegister) &&
    (operand.size === 16 || operand.size === 32)
  ) {
    return valid(mnemonic);
  }
  if (operand.kind === "memory" && operand.size === undefined) {
    return fail(mnemonic, `no se pudo determinar el tamaño de ${operand.text}`);
  }
  if (
    operand.kind === "memory" &&
    (operand.size === 16 || operand.size === 32)
  ) {
    return valid(mnemonic);
  }
  return fail(mnemonic, "el operando debe ser un registro o memoria de 16/32 bits");
};

const checkMovzx = (
  mnemonic: string,
  destination: Operand,
  source: Operand,
): OperationCheck => {
  if (
    !isGeneralPurposeRegister(destination) ||
    (destination.size !== 16 && destination.size !== 32)
  ) {
    return fail(mnemonic, "el destino debe ser un registro de 16 o 32 bits");
  }
  if (
    (source.kind !== "register" && source.kind !== "memory") ||
    (source.kind === "register" && !isGeneralPurposeRegister(source))
  ) {
    return fail(mnemonic, "la fuente debe ser un registro o memoria de 8/16 bits");
  }
  if (source.kind === "memory" && !source.explicitSize) {
    return fail(mnemonic, "la fuente de memoria debe indicar BYTE o WORD");
  }
  if (
    (source.size !== 8 && source.size !== 16) ||
    source.size >= destination.size
  ) {
    return fail(mnemonic, "la fuente debe ser menor que el registro destino");
  }
  return valid(mnemonic);
};

const getEffectiveSize = (operand: Operand, counterpart: Operand) =>
  operand.kind === "memory" &&
  operand.size === undefined &&
  counterpart.kind === "register"
    ? counterpart.size
    : operand.size;

const checkBinaryOperation = (
  mnemonic: string,
  destination: Operand,
  source: Operand,
): OperationCheck => {
  if (
    (destination.kind !== "register" && destination.kind !== "memory") ||
    (destination.kind === "register" &&
      !isGeneralPurposeRegister(destination))
  ) {
    return fail(mnemonic, "el destino debe ser un registro o memoria");
  }
  if (
    (source.kind !== "register" &&
      source.kind !== "memory" &&
      source.kind !== "immediate") ||
    (source.kind === "register" && !isGeneralPurposeRegister(source))
  ) {
    return fail(mnemonic, "la fuente debe ser un registro, memoria o valor inmediato");
  }
  if (destination.kind === "memory" && source.kind === "memory") {
    return fail(
      mnemonic,
      "la operación entre dos operandos de memoria no está permitida",
    );
  }

  const destinationSize = getEffectiveSize(destination, source);
  const sourceSize = getEffectiveSize(source, destination);
  if (destinationSize === undefined) {
    return fail(mnemonic, `no se pudo determinar el tamaño de ${destination.text}`);
  }
  if (source.kind === "memory" && sourceSize === undefined) {
    return fail(mnemonic, `no se pudo determinar el tamaño de ${source.text}`);
  }
  if (source.kind !== "immediate" && destinationSize !== sourceSize) {
    return fail(mnemonic, "los tamaños de los operandos no coinciden");
  }
  if (source.kind === "immediate") {
    if (source.value === undefined) {
      return fail(mnemonic, "el inmediato debe ser un número entero");
    }
    if (
      source.explicitSize &&
      source.size !== undefined &&
      source.size > destinationSize
    ) {
      return fail(mnemonic, "el inmediato excede el tamaño del destino");
    }
    if (!immediateFits(source.value, destinationSize)) {
      return warn(
        mnemonic,
        `el inmediato excede el rango del destino de ${destinationSize} bits`,
      );
    }
  }
  return valid(mnemonic);
};

export const checkOperation = (
  mnemonic: string,
  operands: Piece[][],
  symbolSizes: Map<string, number>,
): OperationCheck => {
  if (!IMPLEMENTED_OPERATIONS.has(mnemonic)) {
    return { status: "No implementado", message: "(No implementado)" };
  }
  if (operands.some((operand) => operand.length === 0)) {
    return fail(mnemonic, "hay un operando vacío");
  }
  if (mnemonic === "RET") return checkReturn(mnemonic, operands, symbolSizes);
  if (mnemonic === "PUSH") return checkPush(mnemonic, operands, symbolSizes);
  if (operands.length !== 2) {
    return fail(
      mnemonic,
      `se esperaban 2 operandos y se recibieron ${operands.length}`,
    );
  }

  const [destination, source] = operands.map((operand) =>
    readOperand(operand, symbolSizes),
  );
  if (destination.kind === "invalid") {
    return fail(mnemonic, destination.error ?? "el destino no es válido");
  }
  if (source.kind === "invalid") {
    return fail(mnemonic, source.error ?? "la fuente no es válida");
  }
  return mnemonic === "MOVZX"
    ? checkMovzx(mnemonic, destination, source)
    : checkBinaryOperation(mnemonic, destination, source);
};
