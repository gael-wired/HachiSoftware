import { analyze } from "@/utils/analyzer";

describe("Analizador", () => {
  const code = [
    ".data segment",
    ";add your data here!",
    "var1 dw 10000",
    "var2 dw 10000",
    "var3 dw 10000",
    "var4 10000 dw ;instruccion incorrecta",
    "varFinal dw ?",
    "lista BYTE 10,20,30,40",
    "lista byte 0ah,20h,22h",
    "ends",
  ].join("\n");

  it("marca cada línea como Correcta o Incorrecta", () => {
    const { lines } = analyze(code);

    expect(lines.map((l) => l.status)).toEqual([
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
  });

  it("construye la tabla de símbolos con valor y tamaño", () => {
    const { symbols } = analyze(code);

    expect(symbols.map(({ name, value, size }) => ({ name, value, size }))).toEqual([
      { name: "var1", value: "10000", size: "WORD" },
      { name: "var2", value: "10000", size: "WORD" },
      { name: "var3", value: "10000", size: "WORD" },
      { name: "varFinal", value: "?", size: "WORD" },
      { name: "lista", value: "10,20,30,40", size: "BYTE" },
      { name: "lista", value: "0ah,20h,22h", size: "BYTE" },
    ]);
  });

  it("no agrega a la tabla las líneas incorrectas", () => {
    const { symbols } = analyze("var4 10000 dw");
    expect(symbols).toEqual([]);
  });

  it("acepta dup sin nombre y reconoce instrucciones", () => {
    const { lines } = analyze("dw 128 dup(0)\nMOV ax,val1");
    expect(lines.every((l) => l.status === "Correcta")).toBe(true);
  });

  it("acepta las instrucciones de dos operandos", () => {
    const programa = [
      "sub ax,bx",
      "shr ax,1",
      "or ax,bx",
      "xor ax,ax",
      "cmp ax,bx",
    ].join("\n");

    const { lines } = analyze(programa);
    expect(lines).toHaveLength(5);
    expect(lines.every((l) => l.status === "Correcta")).toBe(true);
  });

  it("rechaza instrucciones con operandos de más o de menos", () => {
    const { lines } = analyze("mov ax\nsub ax,bx,cx\nor ax,");

    expect(lines.map((l) => l.status)).toEqual([
      "Incorrecta",
      "Incorrecta",
      "Incorrecta",
    ]);
    expect(lines[0].reason).toBe("MOV requiere 2 operandos, pero tiene 1");
    expect(lines[1].reason).toBe("SUB requiere 2 operandos, pero tiene 3");
  });

  it("no reconoce instrucciones que no están en la lista", () => {
    const { lines } = analyze("ret\npush ax");
    expect(lines.every((l) => l.status === "Incorrecta")).toBe(true);
  });

  it("usa las reglas del tokenizador para validar números y nombres", () => {
    const { lines, symbols } = analyze(
      [
        "a db 0FFh",
        "b dw 12zz",
        "1var dw 5",
        "c db 'Hola'",
        "d dw -5",
        "mov ax,12zz",
      ].join("\n")
    );

    expect(lines.map((l) => l.status)).toEqual([
      "Correcta",
      "Incorrecta",
      "Incorrecta",
      "Correcta",
      "Correcta",
      "Incorrecta",
    ]);
    expect(lines[1].reason).toBe('Valor inválido: "12zz"');
    expect(lines[2].reason).toBe('Nombre inválido: "1var"');
    expect(lines[5].reason).toBe('Operando inválido: "12zz"');
    expect(symbols.map((s) => s.value)).toEqual(["0FFh", "'Hola'", "-5"]);
  });
});
