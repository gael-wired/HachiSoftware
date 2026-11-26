"use client";

import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "default" | "wide";
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = "default",
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex h-full w-full items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Modal"
        className={`relative max-h-[85vh] w-full ${
          size === "wide" ? "max-w-6xl" : "max-w-3xl"
        } overflow-y-auto rounded-sm border border-stone-700 bg-stone-900 p-6 text-stone-100 shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 text-2xl leading-none text-stone-400 transition-colors hover:text-white"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
