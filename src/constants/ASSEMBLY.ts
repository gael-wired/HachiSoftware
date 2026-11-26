export const registers32b = [
  "EAX",
  "EBX",
  "ECX",
  "EDX",
  "EBP",
  "ESP",
  "ESI",
  "EDI",
];
export const registers16b = [
  "EFLAGS",
  "EIP",
  "CS",
  "SS",
  "DS",
  "ES",
  "FS",
  "GS",
];
export const reserved = [
  "FLAT",
  "STDCALL",
  "4096",
  "EXITPROCESS",
  "PROTO",
  "DWEXITCODE",
  "MAIN",
  "PROC",
  "INVOKE",
  "ENDP",
  "END",
];

export const dataType = [
  "BYTE",
  "SBYTE",
  "WORD",
  "SWORD",
  "DWORD",
  "SDWORD",
  "FWORD",
  "QWORD",
  "TBYTE",
  "REAL4",
  "REAL8",
  "REAL10",
];

export const sections = [".CODE", ".DATA"];
export const dotDirective = [".MODEL"];

export const dataDirective = ["DB", "DW", "DD", "DQ", "DT"];

// Instrucciones soportadas y cuántos operandos lleva cada una
export const mnemonicOperands: Record<string, number> = {
  MOV: 2,
  ADD: 2,
  SUB: 2,
  SHR: 2,
  OR: 2,
  XOR: 2,
  CMP: 2,
};

export const mnemonics = Object.keys(mnemonicOperands);

export const registers = registers16b.concat(registers32b);
