import "@testing-library/jest-dom";
import { Token, TokenType, tokenizer } from "@/utils/tokenizer";

import { render } from "@testing-library/react";

describe("Tokenizador", () => {
  it("debería retornar un arreglo vacío con una cadena vacía", () => {
    const result = tokenizer("");
    expect(result).toEqual([]);
  });

  it("debería de reconocer espacios en blanco y saltos de línea", () => {
    const code = "  \n  ";
    const tokens = tokenizer(code);

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some((token) => token.type === "WHITESPACE")).toBe(true);
    expect(tokens.some((token) => token.type === "NEWLINE")).toBe(true);
  });

  it("debería de reconocer posiciones y valores", () => {
    const code = "MOV ax,val1";
    const tokens = tokenizer(code);

    expect(tokens).toEqual([
      {
        type: "MNEMONIC",
        start: 0,
        end: 3,
        value: "MOV",
      },
      {
        type: "WHITESPACE",
        start: 3,
        end: 4,
        value: " ",
      },
      {
        type: "VARIABLE",
        start: 4,
        end: 6,
        value: "ax",
      },
      {
        type: "UNKNOWN",
        start: 6,
        end: 7,
        value: ",",
      },
      {
        type: "VARIABLE",
        start: 7,
        end: 11,
        value: "val1",
      },
    ]);
  });

  it("debería identificar etiquetas", () => {
    const code = "inicio:";
    const tokens = tokenizer(code);

    expect(tokens[0]).toEqual({
      type: "LABEL",
      start: 0,
      end: 7,
      value: "inicio:",
    });
  });

  it("debería manejar comentarios", () => {
    const code = "; Hello world";
    const tokens = tokenizer(code);

    expect(tokens[0].type).toBe("COMMENT");
    expect(tokens[0].value).toBe("; Hello world");
  });

  it("reconoce instrucciones y directivas NASM usadas con io.inc", () => {
    const tokens = tokenizer(
      '%include "io.inc"\nsection .data\nsection .text\nglobal CMAIN\ncmp ecx, 1\njle fin\nimul eax, ecx\ndec ecx\njg ciclo\nxor eax, eax\nret\nGET_DEC 4, ebx\nPRINT_DEC 4, eax\nPRINT_STRING tFact\nNEWLINE',
    );

    expect(
      tokens
        .filter((token) =>
          [
            "DIRECTIVE",
            "SECTION",
            "MNEMONIC",
            "RESERVED",
          ].includes(token.type),
        )
        .map(({ value, type }) => [value.toUpperCase(), type]),
    ).toEqual([
      ["%INCLUDE", "DIRECTIVE"],
      ["SECTION", "RESERVED"],
      [".DATA", "SECTION"],
      ["SECTION", "RESERVED"],
      [".TEXT", "SECTION"],
      ["GLOBAL", "RESERVED"],
      ["CMP", "MNEMONIC"],
      ["JLE", "MNEMONIC"],
      ["IMUL", "MNEMONIC"],
      ["DEC", "MNEMONIC"],
      ["JG", "MNEMONIC"],
      ["XOR", "MNEMONIC"],
      ["RET", "MNEMONIC"],
      ["GET_DEC", "RESERVED"],
      ["PRINT_DEC", "RESERVED"],
      ["PRINT_STRING", "RESERVED"],
      ["NEWLINE", "RESERVED"],
    ]);
  });
});
