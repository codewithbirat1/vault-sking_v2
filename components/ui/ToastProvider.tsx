"use client";

import { Toaster, useToasterStore, toast } from "react-hot-toast";
import { useEffect } from "react";

const MAX_TOASTS = 1;

export function ToastProvider() {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const visibleToasts = toasts.filter((t) => t.visible);
    if (visibleToasts.length > MAX_TOASTS) {
      // Dismiss the oldest toasts
      visibleToasts.slice(MAX_TOASTS).forEach((t) => toast.dismiss(t.id));
    }
  }, [toasts]);

  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 800,
        style: {
          background: "#000000",
          color: "#fff",
          maxWidth: "400px",
          width: "90vw",
          padding: "12px 16px",
          fontSize: "14px",
          wordBreak: "break-word",
          textAlign: "center",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    />
  );
}
