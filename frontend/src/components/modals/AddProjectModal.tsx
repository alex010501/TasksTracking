import { useState } from "react";
import { createProject } from "../../api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddProjectModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSave = name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    try {
      // Преобразуем пустые строки в undefined (не null),
      // т.к. api.createProject ожидает string | undefined
      const payload = {
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined,
        deadline: deadline ? deadline : undefined, // YYYY-MM-DD или undefined
      };
      await createProject(payload);
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Не удалось создать проект");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Новый проект</h3>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: "grid", gap: 12 }}>
          {error && <div style={{ color: "#c0392b" }}>{error}</div>}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Название*</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Проект А"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Описание</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткое описание проекта"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Дедлайн</span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>

          <div className="modal-footer" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="button" onClick={onClose} disabled={saving}>
              Отмена
            </button>
            <button type="submit" className="button green" disabled={!canSave || saving}>
              {saving ? "Сохраняю…" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}