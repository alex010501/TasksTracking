import React, { useState } from "react";
import { createProject } from "../../api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddProjectModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Название проекта не может быть пустым.");
      return;
    }

    if (!deadline) {
      alert("Укажите срок проекта.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (deadline < today) {
      alert("Срок проекта не может быть в прошлом.");
      return;
    }

    await createProject({ name, description, deadline });
    onCreated();
    onClose();
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
        width: "500px"
      }}>
        <h2>Создание проекта</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>Название:</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>Описание:</div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>Срок до:</div>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ flexGrow: 1 }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button className="button red" onClick={onClose}>Отмена</button>
          <button className="button green" onClick={handleCreate}>Создать</button>
        </div>
      </div>
    </div>
  );
}