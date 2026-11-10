"use client";

import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4 w-full h-full">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Modal"
        className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 text-2xl leading-none text-gray-500 hover:text-gray-900"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
