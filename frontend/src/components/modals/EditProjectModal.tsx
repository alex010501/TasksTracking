import { useEffect, useState } from "react";
import { updateProject, closeProject } from "../../api";
import type { Project } from "../../types";
import { deleteProject } from "../../api";
import PasswordPromptModal from "./PasswordPromptModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  project: Project;
};

export default function EditProjectModal({ isOpen, onClose, onUpdated, project }: Props) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [createdDate, setCreatedDate] = useState(project.created_date || "");
  const [deadline, setDeadline] = useState(project.deadline || "");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [askPass, setAskPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setDescription(project.description || "");
      setCreatedDate(project.created_date || "");
      setDeadline(project.deadline || "");
      setError("");
      setSaving(false);
    }
  }, [isOpen, project]);

  const handleUpdate = async () => {
    setError("");
    if (!name.trim()) {
      alert("Название проекта не может быть пустым.");
      return;
    }
    if (!createdDate || !deadline) {
      alert("Укажите обе даты: постановки и дедлайна.");
      return;
    }
    if (deadline < createdDate) {
      alert("Дедлайн не может быть раньше даты постановки.");
      return;
    }

    try {
      setSaving(true);
      await updateProject(project.id, { name, description, created_date: createdDate, deadline });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось обновить проект");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseProject = async () => {
    setError("");
    const today = new Date().toISOString().split("T")[0];
    if (!confirm("Вы уверены, что хотите закрыть проект?")) return;
    try {
      setSaving(true);
      await closeProject(project.id, today);
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось закрыть проект");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        background: "white", padding: "2rem", borderRadius: "8px",
        width: "600px"
      }}>
        <h2>Редактирование проекта</h2>

        {error && (
          <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Название:</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Описание:</div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Дата постановки:</div>
            <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Срок до:</div>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ flexGrow: 1 }} min={createdDate} />
          </div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} className="button red" disabled={saving}>Отмена</button>
          <button className="button yellow" onClick={() => setAskPass(true)}>Удалить проект</button>
          <div style={{ display: "flex", gap: "1rem" }}>
            {project.status !== "завершен" && (
              <button onClick={handleCloseProject} className="button blue" disabled={saving}>Закрыть проект</button>
            )}
            <button onClick={handleUpdate} className="button green" disabled={saving}>
              {saving ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </div>

        <PasswordPromptModal
          isOpen={askPass}
          title="Удалить проект?"
          confirmLabel="Удалить"
          onClose={() => setAskPass(false)}
          onConfirm={async (pwd) => {
            await deleteProject(project.id, pwd);
            onUpdated();
            onClose();
          }}
        />

      </div>
    </div>
  );
}