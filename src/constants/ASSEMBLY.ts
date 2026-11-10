export const registers32b = [
  "EAX",
  "EBX",
  "ECX",
  "EDX",
  "EBP",
  "ESP",
  "ESI",
  "EDI",
  "AX",
  "BX",
  "CX",
  "DX",
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
  "SEGMENT",
  "ENDS",
  "DUP",
  "SECTION",
  "GLOBAL",
  "INCLUDE",
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

export const sections = [".CODE", ".DATA", ".STACK", ".TEXT"];
export const dotDirective = [".MODEL"];

export const dataDirective = ["DB", "DW", "DD", "DQ", "DT"];

export const mnemonics = [
  "MOV",
  "ADD",
  "SUB",
  "CMP",
  "JLE",
  "IMUL",
  "DEC",
  "JG",
  "XOR",
  "RET",
];

export const ioMacros = ["GET_DEC", "PRINT_DEC", "PRINT_STRING", "NEWLINE"];

export const registers = registers16b.concat(registers32b);
