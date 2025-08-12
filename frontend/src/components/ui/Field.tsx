import type { ReactNode } from "react";

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 160, fontWeight: 600 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", ...props.style }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", ...props.style }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", ...props.style }}
    />
  );
}

export function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return <div style={{ color: "#c0392b", marginBottom: 8 }}>{text}</div>;
}