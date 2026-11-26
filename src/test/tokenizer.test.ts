import "@testing-library/jest-dom";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { tokenizer } from "@/utils/tokenizer";
import { Chip } from "@/components/lexicalView/typeChips/chip";
import { ChipDetails } from "@/components/lexicalView/typeChips/chipDetails";

describe("Tokenizador", () => {
  it("handles empty input and whitespace", () => {
    expect(tokenizer("")).toEqual([]);
    expect(tokenizer("  \n  ").map(({ type }) => type)).toEqual([
      "WHITESPACE",
      "NEWLINE",
      "WHITESPACE",
    ]);
  });

  it("retains token values and source positions", () => {
    expect(
      tokenizer("MOV ax,val1").map(({ type, value, start, end }) => [
        type,
        value,
        start,
        end,
      ]),
    ).toEqual([
      ["MNEMONIC", "MOV", 0, 3],
      ["WHITESPACE", " ", 3, 4],
      ["REGISTER", "ax", 4, 6],
      ["UNKNOWN", ",", 6, 7],
      ["VARIABLE", "val1", 7, 11],
    ]);
  });

  it("recognizes labels", () => {
    expect(tokenizer("inicio:")[0]).toMatchObject({
      type: "LABEL",
      value: "inicio:",
    });
  });

  it("recognizes assembly mnemonics", () => {
    const instructions =
      "DIV JZ SHL NOT MUL INC POP JNE JMP AND RET MOVZX JE DEC NOP PUSH PRINT_DEC GET_DEC jg loop PRINT_STRING NEWLINE";
    const tokens = tokenizer(instructions);

    expect(
      tokens.filter(({ type }) => type === "MNEMONIC").map(({ value }) => value),
    ).toEqual(instructions.split(" "));
  });

  it("recognizes NASM directives, sections, and operands", () => {
    const tokens = tokenizer(
      [
        '%include "io.inc"',
        "section .data",
        "texto db 'La suma de 1 a N es : ', 0",
        "section .text",
        "global CMAIN",
        "CMAIN:",
        "mov ebp, esp",
        "GET_DEC 4, ecx",
        "PRINT_STRING texto",
        "PRINT_DEC 4, eax",
        "NEWLINE",
      ].join("\n"),
    );
    const typesByValue = Object.fromEntries(
      tokens.map(({ value, type }) => [value, type]),
    );

    expect(typesByValue).toMatchObject({
      "%include": "DIRECTIVE",
      '"io.inc"': "STRING",
      section: "DIRECTIVE",
      ".data": "SECTION",
      ".text": "SECTION",
      global: "DIRECTIVE",
      texto: "VARIABLE",
      "'La suma de 1 a N es : '": "STRING",
      "CMAIN:": "LABEL",
      ebp: "REGISTER",
      GET_DEC: "MNEMONIC",
    });
  });

  it("recognizes comments", () => {
    expect(tokenizer("; Hello world")[0]).toMatchObject({
      type: "COMMENT",
      value: "; Hello world",
    });
  });

  it("recognizes and colors quoted strings", () => {
    const [token] = tokenizer('"aqui va el texto"');

    expect(token).toMatchObject({
      type: "STRING",
      value: '"aqui va el texto"',
      start: 0,
      end: 18,
    });

    render(createElement(Chip, { token }));

    expect(screen.getByText('"aqui va el texto"')).toHaveClass(
      "bg-[#a8e6a3]",
    );
  });

  it("identifies numeric bases", () => {
    expect(
      tokenizer("0xFF 0b110 0o77 42 12345678r")
        .filter(({ type }) => type === "NUMBER")
        .map(({ numberType }) => numberType),
    ).toEqual([
      "HEXADECIMAL",
      "BINARY",
      "OCTAL",
      "DECIMAL",
      "REAL",
    ]);
  });

  it("shows numeric base in token details", () => {
    const [token] = tokenizer("0xFF");

    render(
      createElement(ChipDetails, {
        token,
        display: true,
        placeBelow: false,
      }),
    );

    expect(screen.getByText("Hexadecimal")).toBeInTheDocument();
  });
});
