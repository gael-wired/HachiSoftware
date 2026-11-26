export type OperationStatus =
  | "Correcta"
  | "Aviso"
  | "Incorrecta"
  | "No implementado";

export interface OperationResult {
  line: number;
  text: string;
  mnemonic: string;
  status: OperationStatus;
  message: string;
}

export type OperationCheck = Pick<OperationResult, "status" | "message">;
