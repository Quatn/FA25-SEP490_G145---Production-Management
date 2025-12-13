// /components/common/ConfirmModal.tsx
"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import ReactDOM from "react-dom";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean; // when true, style confirm as destructive
};

type ConfirmContextType = {
  showConfirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx.showConfirm;
};

const defaultOpts: ConfirmOptions = {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  confirmText: "Yes",
  cancelText: "Cancel",
  destructive: false,
};

const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>(defaultOpts);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  const showConfirm = useCallback((options?: ConfirmOptions) => {
    setOpts({ ...defaultOpts, ...(options || {}) });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // clear resolver on close after a short tick to avoid memory leaks
    setTimeout(() => (resolverRef.current = null), 300);
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolverRef.current) resolverRef.current(true);
    close();
  }, [close]);

  const handleCancel = useCallback(() => {
    if (resolverRef.current) resolverRef.current(false);
    close();
  }, [close]);

  // keyboard handling (Esc to cancel, Enter to confirm)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if (e.key === "Enter") {
        // Only trigger enter when focus is inside modal (safer to always trigger)
        e.preventDefault();
        handleConfirm();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleCancel, handleConfirm]);

  // focus confirm button when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmBtnRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {open &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="confirm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20,
            }}
            onMouseDown={handleCancel}
          >
            <div
              className="confirm-modal-card"
              role="document"
              onMouseDown={(e) => e.stopPropagation()} // prevent backdrop click from closing if clicking inside
              style={{
                width: "100%",
                maxWidth: 520,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                padding: 20,
                // small fallback border in case global CSS was removed
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#111",
                    lineHeight: 1.2,
                  }}
                >
                  {opts.title}
                </div>
                {opts.description && (
                  <div style={{ marginTop: 6, color: "#444", fontSize: 14 }}>
                    {opts.description}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {/* Cancel button: keep bootstrap class but provide inline fallback */}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                  style={{
                    // fallback styling if .btn is not available
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid rgba(108,117,125,0.6)",
                    background: "transparent",
                    fontSize: 14,
                    cursor: "pointer",
                    // allow bootstrap to override if present
                    ...(typeof window !== "undefined" ? {} : {}),
                  }}
                >
                  {opts.cancelText}
                </button>

                {/* Confirm button: keep bootstrap class but provide inline fallback */}
                <button
                  ref={confirmBtnRef}
                  type="button"
                  className={
                    opts.destructive ? "btn btn-danger" : "btn btn-primary"
                  }
                  onClick={handleConfirm}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer",
                    // destructive fallback vs primary fallback
                    background: opts.destructive ? "#dc3545" : "#0d6efd",
                    color: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {opts.confirmText}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
