const REGISTER_GROUPS = [
  {
    bits: 8,
    kind: "general",
    names: ["AL", "AH", "BL", "BH", "CL", "CH", "DL", "DH"],
  },
  {
    bits: 16,
    kind: "general",
    names: ["AX", "BX", "CX", "DX", "BP", "SP", "SI", "DI"],
  },
  { bits: 32, kind: "special", names: ["EFLAGS", "EIP"] },
  { bits: 16, kind: "segment", names: ["CS", "SS", "DS", "ES", "FS", "GS"] },
  {
    bits: 32,
    kind: "general",
    names: ["EAX", "EBX", "ECX", "EDX", "EBP", "ESP", "ESI", "EDI"],
  },
] as const;
type RegisterGroup = (typeof REGISTER_GROUPS)[number];

const registerNames = (
  matches: (group: RegisterGroup) => boolean,
): string[] =>
  REGISTER_GROUPS.filter(matches).flatMap(({ names }) => names);

export const registers = REGISTER_GROUPS.flatMap(({ names }) => names);
export const generalPurposeRegisters = registerNames(
  ({ kind }) => kind === "general",
);
export const segmentRegisters = registerNames(
  ({ kind }) => kind === "segment",
);
export const registerSizes: Record<string, number> = Object.fromEntries(
  REGISTER_GROUPS.flatMap(({ names, bits }) =>
    names.map((name) => [name, bits]),
  ),
);
export const generalPurposeRegisterSet = new Set(generalPurposeRegisters);
export const segmentRegisterSet = new Set(segmentRegisters);

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

const DATA_TYPE_GROUPS = [
  { bits: 8, names: ["BYTE", "SBYTE"] },
  { bits: 16, names: ["WORD", "SWORD"] },
  { bits: 32, names: ["DWORD", "SDWORD", "REAL4"] },
  { bits: 48, names: ["FWORD"] },
  { bits: 64, names: ["QWORD", "REAL8"] },
  { bits: 80, names: ["TBYTE", "REAL10"] },
] as const;

export const dataDirectiveLabels: Record<string, string> = {
  DB: "BYTE",
  DW: "WORD",
  DD: "DWORD",
  DQ: "QWORD",
  DT: "TBYTE",
};
const DATA_TYPE_SIZES: Record<string, number> = {};
for (const { bits, names } of DATA_TYPE_GROUPS) {
  for (const name of names) DATA_TYPE_SIZES[name] = bits;
}

export const dataType: string[] = DATA_TYPE_GROUPS.flatMap(
  ({ names }) => names,
);
export const dataDirective = Object.keys(dataDirectiveLabels);
export const dataSizeBits: Record<string, number> = { ...DATA_TYPE_SIZES };

for (const [directive, type] of Object.entries(dataDirectiveLabels)) {
  dataSizeBits[directive] = DATA_TYPE_SIZES[type];
}

export const sections = [".CODE", ".DATA", ".TEXT"];
export const dotDirective = [".MODEL"];
export const assemblyDirectives = ["SECTION", "GLOBAL"];

export const mnemonics = [
  "MOV",
  "ADD",
  "SUB",
  "SHR",
  "OR",
  "XOR",
  "CMP",
  "DIV",
  "JZ",
  "SHL",
  "NOT",
  "MUL",
  "INC",
  "POP",
  "JNE",
  "JMP",
  "AND",
  "RET",
  "MOVZX",
  "JE",
  "DEC",
  "NOP",
  "PUSH",
  "PRINT_DEC",
  "GET_DEC",
  "JG",
  "LOOP",
  "PRINT_STRING",
  "NEWLINE",
];
