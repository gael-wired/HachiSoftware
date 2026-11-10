import { TokenType } from "@/utils/tokenizer";

export const TOKEN_TEXT_COLORS: Record<TokenType, string> = {
  RESERVED: "text-[#ffa6c7]",
  DIRECTIVE: "text-[#c9e6ff]",
  LABEL: "text-[#e0ffd1]",
  NUMBER: "text-[#dcc7ff]",
  STRING: "text-[#a8e6a3]",
  UNKNOWN: "text-[#f8f8f2]",
  COMMENT: "text-[#88846f]",
  NEWLINE: "text-[#88846f] opacity-80",
  WHITESPACE: "text-[#3f413d]",
  REGISTER: "text-[#ffcc5c]",
  TYPE: "text-[#c04080]",
  MNEMONIC: "text-[#c04080]",
  VARIABLE: "text-[#f8f8f2]",
  SECTION: "text-[#c04080]",
};

export const TOKEN_CHIP_COLORS: Record<TokenType, string> = {
  RESERVED: "bg-[#ffa6c7] text-[#1b1c19]",
  DIRECTIVE: "bg-[#c9e6ff] text-[#1b1c19]",
  LABEL: "bg-[#e0ffd1] text-[#1b1c19]",
  NUMBER: "bg-[#dcc7ff] text-[#1b1c19]",
  STRING: "bg-[#a8e6a3] text-[#1b1c19]",
  UNKNOWN: "bg-[#f8f8f2] text-[#1b1c19]",
  VARIABLE: "bg-[#f8f8f2] text-[#1b1c19]",
  REGISTER: "bg-[#ffcc5c] text-[#1b1c19]",
  TYPE: "bg-[#c04080] text-[#1b1c19]",
  MNEMONIC: "bg-[#c04080] text-[#1b1c19]",
  SECTION: "bg-[#c04080] text-[#1b1c19]",
  COMMENT: "bg-[#88846f] text-[#1b1c19]",
  WHITESPACE: "bg-[#3f413d] text-[#f8f8f2]",
  NEWLINE: "bg-[#88846f] text-[#1b1c19]",
};
