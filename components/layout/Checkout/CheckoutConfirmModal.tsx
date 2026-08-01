import React, { useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Wallet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  orderTotal: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    district: string;
  };
}

export default function CheckoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  orderTotal,
  paymentMethod,
  shippingAddress,
}: CheckoutConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
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
  }, [isOpen, onClose, isSubmitting]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Manual QR Payment";
  const addressLine = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.district}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-labelledby="checkout-confirm-title"
        >
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <m.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:w-[440px] bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5.5 h-5.5" strokeWidth={2} />
              </div>
              <h2 id="checkout-confirm-title" className="text-lg font-semibold text-slate-900 tracking-tight">
                Confirm your order
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review the details below before you place it.
              </p>
            </div>

            {/* Summary */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Payment method</p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{paymentLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    NPR {orderTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Shipping to</p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                    {shippingAddress.fullName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{addressLine}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-1">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={onConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing order
                    </span>
                  ) : (
                    "Place order"
                  )}
                </Button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                Double-check your shipping address — it can&apos;t be changed after this step.
              </p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}