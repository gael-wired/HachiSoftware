import { analyze, type OperationStatus } from "@/utils/analyzer";

const DATA_SOURCE = `.data
var1 dw 0xFFFF
var2 db 255
var3 dd 123456
var4 10000 dw
varFinal dw ?
lista dw 128 dup(0)
lista db 128 dup(0)
ends`;

const OPERATION_CONTEXT = `.data
byteValue db 1
wordValue dw 1
dwordValue dd 1
.text`;

const VALID_OPERATIONS = [
  "MOVZX EAX, byte [byteValue]",
  "SUB EAX, 50",
  "XOR EAX, 1",
  "PUSH EAX",
  "PUSH DWORD [dwordValue]",
  "RET",
];

const INVALID_OPERATIONS = [
  "MOVZX EAX, EBX",
  "MOVZX AL, BL",
  "MOVZX EAX, [byteValue]",
  "SUB EAX, BL",
  "SUB [byteValue], [wordValue]",
  "SUB [unknownValue], 5",
  "XOR EAX, [EBX-ECX]",
  "PUSH AL",
  "PUSH EAX, EBX",
  "PUSH [byteValue]",
  "PUSH DWORD [byteValue",
  "RET EAX",
];

const analyzeOperations = (instructions: string[]) =>
  analyze(`${OPERATION_CONTEXT}\n${instructions.join("\n")}`).operations;

const expectAllOperationsToHaveStatus = (
  instructions: string[],
  status: OperationStatus,
) => {
  const results = analyzeOperations(instructions);

  expect(results).toHaveLength(instructions.length);
  expect(results.every((result) => result.status === status)).toBe(true);
};

describe("analyze", () => {
  it("validates declarations and records their symbols", () => {
    const result = analyze(DATA_SOURCE);

    expect(result.lines.map(({ status }) => status)).toEqual([
      "Correcta",
      "Correcta",
      "Correcta",
      "Correcta",
      "Incorrecta",
      "Correcta",
      "Correcta",
      "Correcta",
      "Correcta",
    ]);
    expect(
      result.symbols.map(({ name, value, size }) => ({ name, value, size })),
    ).toEqual([
      { name: "var1", value: "0xFFFF", size: "WORD" },
      { name: "var2", value: "255", size: "BYTE" },
      { name: "var3", value: "123456", size: "DWORD" },
      { name: "varFinal", value: "?", size: "WORD" },
      { name: "lista", value: "128dup(0)", size: "WORD" },
      { name: "lista", value: "128dup(0)", size: "BYTE" },
    ]);
  });

  it.each([
    ['mensaje db "texto de prueba"', '"texto de prueba"'],
    ["datos dw 128 dup(0)", "128dup(0)"],
  ])("accepts data values in declaration %s", (declaration, value) => {
    const result = analyze(`.data\n${declaration}\nends`);

    expect(result.lines.map(({ status }) => status)).toEqual([
      "Correcta",
      "Correcta",
      "Correcta",
    ]);
    expect(result.symbols[0].value).toBe(value);
  });

  it("rejects malformed declarations without adding symbols", () => {
    const result = analyze(
      ".data\na db 0FFh\nbad dw 12zz\n1invalid db 1\nc db 'Hola'\nd dw -5\nends",
    );

    expect(result.lines.map(({ status }) => status)).toEqual([
      "Correcta",
      "Correcta",
      "Incorrecta",
      "Incorrecta",
      "Correcta",
      "Correcta",
      "Correcta",
    ]);
    expect(result.symbols.map(({ value }) => value)).toEqual([
      "0FFh",
      "'Hola'",
      "-5",
    ]);
  });

  it("only analyzes declarations inside the data section", () => {
    const result = analyze(
      ".model flat,stdcall\n.data\nvar1 dw 1\n.code\nmain proc\nmov ax\nmain endp",
    );

    expect(result.lines.map(({ text }) => text)).toEqual([".data", "var1 dw 1"]);
  });

  it("removes comments and repeated spacing from displayed lines", () => {
    const result = analyze(
      ".data\n  mensaje    db    'dos  espacios'    ; comentario\nends",
    );

    expect(result.lines.map(({ text }) => text)).toEqual([
      ".data",
      "mensaje db 'dos  espacios'",
      "ends",
    ]);
  });

  it("accepts all valid operations", () => {
    expectAllOperationsToHaveStatus(VALID_OPERATIONS, "Correcta");
  });

  it("rejects all invalid operations", () => {
    expectAllOperationsToHaveStatus(INVALID_OPERATIONS, "Incorrecta");
  });

  it("reports warnings and leaves other mnemonics unimplemented", () => {
    const warnings = analyzeOperations(["SUB AL, 300", "RET 70000"]);
    const unimplemented = analyzeOperations(["ADD EAX, EBX"]);

    expect(warnings).toHaveLength(2);
    expect(warnings.every(({ status }) => status === "Aviso")).toBe(true);
    expect(unimplemented).toHaveLength(1);
    expect(unimplemented[0].status).toBe("No implementado");
  });

  it("ignores comments when analyzing operations", () => {
    const result = analyzeOperations(["SUB EAX, EBX ; comentario"]);

    expect(result[0]).toMatchObject({
      text: "SUB EAX, EBX",
      status: "Correcta",
    });
  });

});
