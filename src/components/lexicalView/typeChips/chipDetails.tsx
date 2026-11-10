import { Token } from "@/utils/tokenizer";
import { ReactNode } from "react";

interface ChipDetailsProps {
  token: Token;
  display: boolean;
  placeBelow: boolean;
}

interface KeyTypeProps {
  className?: string;
  children: ReactNode;
}

const KeyType = ({ className = "", children }: KeyTypeProps) => {
  return (
    <span className={`${className} font-normal text-blue-200`}>{children}</span>
  );
};
export const ChipDetails = ({
  token,
  display,
  placeBelow,
}: ChipDetailsProps) => {
  if (!display) return null;
  return (
    <>
      <div
        className={`absolute bg-[#1e1f1c] z-50 min-w-50 max-w-60 outline left-1/2 -translate-x-1/2 rounded-md p-2 shadow-2xl justify-between select-none
        ${placeBelow ? "translate-y-4 top-full" : "-translate-y-4 bottom-full"}
        `}
      >
        <span className="text-[12px] inline">
          <KeyType>type:</KeyType> {token.type}
        </span>
        <div className="mx-2 border-b border-[#fff3]" />
        <span className="text-[10px] inline">
          <KeyType>start:</KeyType> {token.start},<KeyType>end: </KeyType>
          {token.end}
        </span>
        {token.numberType && (
          <>
            <div className="mx-2 border-b border-[#fff3]" />
            <span className="text-[10px] inline">
              <KeyType>number type:</KeyType> {token.numberType}
            </span>
          </>
        )}
      </div>
    </>
  );
};
