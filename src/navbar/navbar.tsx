"use client";

import { useMemo, useRef, useState, ChangeEvent } from "react";
import { Brand } from "./atoms/brand";
import { NavDropdown } from "./atoms/navDropdown";
import { NavItem } from "./atoms/navItem";
import { useCodeContext } from "@/components/contexts/codeContext";
import { Modal } from "@/components/global/modal";
import { CodeStatus } from "@/components/CodeStatus/CodeStatus";
import { SymbolTable } from "@/components/SymbolTable/SymbolTable";
import { analyzeDataSection, analyzeSymbols } from "@/utils/analyzer";
import { tokenizer } from "@/utils/tokenizer";

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve((event.target?.result as string) ?? "");
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

export const Navbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<
    "symbols" | "codeStatus" | null
  >(null);

  const { rawCode, setCode } = useCodeContext();
  const codeStatuses = useMemo(
    () => analyzeDataSection(tokenizer(rawCode)),
    [rawCode],
  );
  const symbols = useMemo(() => analyzeSymbols(tokenizer(rawCode)), [rawCode]);

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFile(file);
      setCode(content);
    } catch (error) {
      console.error("Error al leer el archivo:", error);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="h-10 p-2 bg-sky-600 text-white flex items-center">
      <Brand />

      <div>
        <NavDropdown label="Archivo">
          <NavItem className="block w-full" onClick={handleOpenClick}>
            Abrir archivo
          </NavItem>
        </NavDropdown>


        <NavDropdown label="Análisis">
          <NavItem
            className="block w-full"
            onClick={() => setActiveAnalysis("symbols")}
          >
            Análisis de símbolos
          </NavItem>
          <NavItem
            className="block w-full"
            onClick={() => setActiveAnalysis("codeStatus")}
          >
            Verificación de código
          </NavItem>
        </NavDropdown>

        {/* Input invisible para abrir el selector de archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt, .asm"
          className="hidden"
        />
      </div>
      <Modal
        isOpen={activeAnalysis !== null}
        onClose={() => setActiveAnalysis(null)}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {activeAnalysis === "symbols"
            ? "Tabla de símbolos"
            : "Verificación de código"}
        </h2>
        {activeAnalysis === "symbols" ? (
          <SymbolTable elements={symbols} />
        ) : (
          <CodeStatus elements={codeStatuses} />
        )}
      </Modal>
    </div>
  );
};
