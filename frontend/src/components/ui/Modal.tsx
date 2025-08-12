import type { ReactNode } from "react";
import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: number | string;
};

export default function Modal({ isOpen, title, children, footer, onClose, width = 640 }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "95vw", background: "#fff", borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.2)", padding: "20px 20px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button
            aria-label="Закрыть"
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 16 }}>{children}</div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
          <button className="button red" onClick={onClose}>Отмена</button>
          <div>{footer}</div>
        </div>
      </div>
    </div>
  );
}