import type { Token } from "@/utils/tokenizer";

export type Status = {
    line: number;
    start: number;
    code: string;
    status: "OK" | "ERROR";
};

export type SymbolEntry = {
    symbol: string;
    type: "variable";
    value: string;
    size: string;
};

const isSignificant = (token: Token) =>
    token.type !== "WHITESPACE" &&
    token.type !== "COMMENT" &&
    token.value !== "\r";

const splitLines = (tokens: Token[]): Token[][] => {
    const lines: Token[][] = [[]];

    for (const token of tokens) {
        if (token.type === "NEWLINE") {
            for (let i = 0; i < token.value.length; i++) lines.push([]);
        } else {
            lines[lines.length - 1].push(token);
        }
    }

    return lines;
};

const getSectionName = (tokens: Token[]) => {
    const significantTokens = tokens.filter(isSignificant);
    const [first, second, ...rest] = significantTokens;

    if (first?.type === "SECTION") return first.value.toUpperCase();

    if (
        first?.value.toUpperCase() === "SECTION" &&
        second?.value.startsWith(".") &&
        rest.length === 0
    ) {
        return second.value.toUpperCase();
    }

    return undefined;
};

const isDataSection = (tokens: Token[]) =>
    getSectionName(tokens) === ".DATA";

const isDataEnd = (tokens: Token[]) =>
    tokens.length === 1 &&
    tokens[0].type === "RESERVED" &&
    tokens[0].value.toUpperCase() === "ENDS";

const isValidDeclaration = (tokens: Token[]) => {
    const [name, type, ...values] = tokens;
    const allowedValueTypes = ["NUMBER", "VARIABLE", "REGISTER", "STRING"];
    const allowedPunctuation = [",", "?", "(", ")", "+", "-"];

    return (
        name?.type === "VARIABLE" &&
        (type?.type === "TYPE" || type?.type === "DIRECTIVE") &&
        values.length > 0 &&
        values.every((token) =>
            token.type === "RESERVED"
                ? token.value.toUpperCase() === "DUP"
                : allowedValueTypes.includes(token.type) ||
                (token.type === "UNKNOWN" && allowedPunctuation.includes(token.value)),
        )
    );
};

const getSymbol = (tokens: Token[]): SymbolEntry | undefined => {
    const [name, size, ...values] = tokens;

    if (
        name?.type !== "VARIABLE" ||
        (size?.type !== "TYPE" && size?.type !== "DIRECTIVE") ||
        values.length === 0
    ) {
        return undefined;
    }

    return {
        symbol: name.value,
        type: "variable",
        value: values.map((token) => token.value).join("").trim(),
        size: size.value,
    };
};

const createStatus = (tokens: Token[], line: number): Status => {
    const significantTokens = tokens.filter(isSignificant);
    const code = tokens.map((token) => token.value).join("").trim();
    const firstToken = significantTokens[0];

    return {
        line,
        start: firstToken ? firstToken.start - (tokens[0]?.start ?? 0) : 0,
        code,
        status:
            isDataSection(significantTokens) ||
                isDataEnd(significantTokens) ||
                isValidDeclaration(significantTokens)
                ? "OK"
                : "ERROR",
    };
};

export const analyzeDataSection = (tokens: Token[]): Status[] => {
    const results: Status[] = [];
    let inDataSection = false;

    splitLines(tokens).forEach((lineTokens, index) => {
        const significantTokens = lineTokens.filter(isSignificant);
        if (significantTokens.length === 0) return;

        if (isDataSection(significantTokens)) {
            inDataSection = true;
            results.push(createStatus(lineTokens, index + 1));
            return;
        }

        if (!inDataSection) return;

        if (getSectionName(significantTokens)) {
            inDataSection = false;
            return;
        }

        results.push(createStatus(lineTokens, index + 1));
        if (isDataEnd(significantTokens)) inDataSection = false;
    });

    return results;
};

export const analyzeSymbols = (tokens: Token[]): SymbolEntry[] => {
    const symbols: SymbolEntry[] = [];
    let inDataSection = false;

    for (const line of splitLines(tokens)) {
        const significantTokens = line.filter(isSignificant);

        if (isDataSection(significantTokens)) {
            inDataSection = true;
            continue;
        }

        if (!inDataSection || significantTokens.length === 0) continue;

        if (getSectionName(significantTokens) || isDataEnd(significantTokens)) {
            inDataSection = false;
            continue;
        }

        if (!isValidDeclaration(significantTokens)) continue;

        const symbol = getSymbol(significantTokens);
        if (symbol) symbols.push(symbol);
    }

    return symbols;
};
