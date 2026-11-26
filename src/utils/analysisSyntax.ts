import { tokenizer, type Token, type TokenType } from "@/utils/tokenizer";

const IGNORED_TOKENS: TokenType[] = ["WHITESPACE", "COMMENT", "NEWLINE"];

export interface Piece {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export const splitLines = (tokens: Token[]): Token[][] => {
  const lines: Token[][] = [[]];

  for (const token of tokens) {
    if (token.type !== "NEWLINE") {
      lines[lines.length - 1].push(token);
      continue;
    }

    const lineBreaks = token.value.match(/\n/g)?.length ?? 1;
    for (let index = 0; index < lineBreaks; index++) lines.push([]);
  }

  return lines;
};

export const toPieces = (line: string): Piece[] => {
  const tokens = tokenizer(line).filter(
    (token) => !IGNORED_TOKENS.includes(token.type),
  );
  const pieces: Piece[] = [];
  let memoryDepth = 0;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const next = tokens[index + 1];

    if (token.value === "[") memoryDepth++;
    if (token.value === "]") memoryDepth = Math.max(0, memoryDepth - 1);

    if (
      token.type === "UNKNOWN" &&
      (token.value === "-" || token.value === "+") &&
      memoryDepth === 0 &&
      next?.type === "NUMBER" &&
      next.start === token.end
    ) {
      pieces.push({
        type: "NUMBER",
        value: line.slice(token.start, next.end),
        start: token.start,
        end: next.end,
      });
      index++;
      continue;
    }

    pieces.push({
      type: token.type,
      value: token.value,
      start: token.start,
      end: token.end,
    });
  }

  return pieces;
};
