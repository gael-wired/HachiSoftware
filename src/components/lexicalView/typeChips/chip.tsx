import { TOKEN_CHIP_COLORS } from "@/constants/TOKEN_COLORS";
import type { Token } from "@/utils/tokenizer";
import { useRef, useState } from "react";
import { ChipDetails } from "./chipDetails";

interface ChipProps {
  token: Token;
}

const WhiteSpaceChip = () => {
  return <div className="text-[#75715E] px-3 text-xs inline">·</div>;
};
const NewLineChip = () => {
  return <div className="text-[#75715E] my-3"></div>;
};

export const Chip = ({ token }: ChipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [placeBelow, setPlaceBelow] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      console.debug(rect.top);
      if (rect.top < 115) {
        setPlaceBelow(true);
      } else {
        setPlaceBelow(false);
      }
    }
    setIsHovered(true);
  };

  if (token.type === "COMMENT") return null;
  if (token.type === "WHITESPACE") return <WhiteSpaceChip />;
  if (token.type === "NEWLINE") return <NewLineChip />;

  const color = TOKEN_CHIP_COLORS[token.type];
  return (
    <div
      className="relative inline-block mx-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ChipDetails display={isHovered} token={token} placeBelow={placeBelow} />
      <div
        className={`px-3 py-0.5 rounded outline-2 outline-black transition-all duration-200 cursor-pointer
          ${color}
          ${isHovered ? "brightness-110 shadow-2xl scale-150 z-50" : ""}`}
        ref={chipRef}
      >
        {token.value}
      </div>
    </div>
  );
};
