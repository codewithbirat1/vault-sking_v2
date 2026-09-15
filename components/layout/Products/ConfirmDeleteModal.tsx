"use client";

import React, { useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <m.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:w-[400px] bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Content */}
            <div className="flex flex-col items-center text-center px-6 pt-7 pb-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3.5">
                <Trash2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-3 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 font-medium cursor-pointer"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl h-10 font-medium bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
