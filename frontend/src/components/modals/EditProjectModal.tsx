import { useEffect, useState } from "react";
import { updateProject, closeProject } from "../../api";
import type { Project } from "../../types";

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

  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setDescription(project.description || "");
      setCreatedDate(project.created_date || "");
      setDeadline(project.deadline || "");
    }
  }, [isOpen, project]);

  const handleUpdate = async () => {
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

    await updateProject(project.id, {
      name,
      description,
      created_date: createdDate,
      deadline,
    });

    onUpdated();
    onClose();
  };

  const handleCloseProject = async () => {
    const today = new Date().toISOString().split("T")[0];
    if (confirm("Вы уверены, что хотите закрыть проект?")) {
      await closeProject(project.id, today);
      onUpdated();
      onClose();
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
          <button onClick={onClose} className="button red">Отмена</button>
          <div style={{ display: "flex", gap: "1rem" }}>
            {project.status !== "завершен" && (
              <button onClick={handleCloseProject} className="button blue">Закрыть проект</button>
            )}
            <button onClick={handleUpdate} className="button green">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}