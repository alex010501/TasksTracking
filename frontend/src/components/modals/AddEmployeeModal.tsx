import React, { useState } from "react";
import { addEmployee } from "../../api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddEmployeeModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !position.trim() || !startDate) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    await addEmployee({
      name,
      position,
      date_started: startDate,
    });

    onCreated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "500px",
        }}
      >
        <h2>Добавление сотрудника</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>ФИО:</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flexGrow: 1 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>Должность:</div>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{ flexGrow: 1 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "140px", fontWeight: "bold" }}>Дата начала:</div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ flexGrow: 1 }}
            />
          </div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button className="button red" onClick={onClose}>
            Отмена
          </button>
          <button
            className="button green"
            onClick={handleCreate}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}