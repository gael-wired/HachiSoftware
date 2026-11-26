"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Brand } from "./atoms/brand";
import { NavDropdown } from "./atoms/navDropdown";
import { NavItem } from "./atoms/navItem";
import { useCodeContext } from "@/components/contexts/codeContext";
import { Modal } from "@/components/global/modal";
import { analyze } from "@/utils/analyzer";
import {
  AnalysisContent,
  type AnalysisView,
} from "@/components/lexicalView/analysisContent";

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("El archivo no contiene texto legible."));
        return;
      }
      resolve(reader.result);
    };

    reader.onerror = () =>
      reject(reader.error ?? new Error("No se pudo leer el archivo."));

    reader.readAsText(file);
  });
};

export const Navbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisView | null>(
    null,
  );

  const { rawCode, setCode } = useCodeContext();
  const analysis = useMemo(() => analyze(rawCode), [rawCode]);

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
          <NavItem
            className="block w-full"
            onClick={() => setActiveAnalysis("operations")}
          >
            Análisis de operaciones
          </NavItem>
        </NavDropdown>

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
        size={activeAnalysis === "operations" ? "wide" : "default"}
      >
        <AnalysisContent view={activeAnalysis} analysis={analysis} />
      </Modal>
    </div>
  );
};
