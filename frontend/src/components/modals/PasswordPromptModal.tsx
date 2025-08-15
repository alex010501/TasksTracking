import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  title?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void> | void;
};

export default function PasswordPromptModal({
  isOpen,
  title = "Подтвердите действие",
  confirmLabel = "Подтвердить",
  onClose,
  onConfirm,
}: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { setPassword(""); setError(""); setLoading(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    setError("");
    if (!password) { setError("Введите пароль"); return; }
    try {
      setLoading(true);
      await onConfirm(password);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось выполнить действие");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0 as any, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: "1.5rem", width: 420 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>

        {error && <div style={{ color: "#c0392b", marginBottom: 8 }}>{error}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120, fontWeight: 600 }}>Пароль:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
          <button className="button red" onClick={onClose} disabled={loading}>Отмена</button>
          <button className="button green" onClick={submit} disabled={loading}>
            {loading ? "Проверяю…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}