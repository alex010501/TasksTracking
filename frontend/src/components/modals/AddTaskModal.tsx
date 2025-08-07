import React, { useEffect, useState } from "react";
import { getAllEmployees, createTask } from "../../api";
import type { Employee } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId?: number | null;
  stageId?: number | null;
};

export default function AddTaskModal({
  isOpen,
  onClose,
  onCreated,
  projectId = null,
  stageId = null,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 4>(1);
  const [executorIds, setExecutorIds] = useState<number[]>([]);
  const [selectedExecutorId, setSelectedExecutorId] = useState<number | "">("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      getAllEmployees().then(setEmployees);
      setName("");
      setDescription("");
      setDeadline("");
      setDifficulty(1);
      setExecutorIds([]);
      setSelectedExecutorId("");
    }
  }, [isOpen]);

  const addExecutor = () => {
    if (
      selectedExecutorId !== "" &&
      typeof selectedExecutorId === "number" &&
      !executorIds.includes(selectedExecutorId)
    ) {
      setExecutorIds((prev) => [...prev, selectedExecutorId]);
      setSelectedExecutorId("");
    }
  };

  const removeExecutor = (id: number) => {
    setExecutorIds((prev) => prev.filter((eid) => eid !== id));
  };

  const handleCreate = async () => {
    if (!deadline) {
      alert("Укажите дедлайн.");
      return;
    }

    const today = new Date(todayStr);
    const deadlineDate = new Date(deadline);

    if (deadlineDate < today) {
      alert("Дедлайн не может быть раньше сегодняшней даты.");
      return;
    }

    if (executorIds.length === 0) {
      alert("Выберите хотя бы одного исполнителя.");
      return;
    }

    const uniqueExecutorIds = Array.from(new Set(executorIds)).filter(
      (id): id is number => typeof id === "number"
    );

    await createTask({
      name,
      description,
      deadline,
      difficulty,
      executor_ids: uniqueExecutorIds,
      project_id: projectId ?? null,
      stage_id: stageId ?? null,
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
          width: "700px",
        }}
      >
        <h2>Создание задачи</h2>

        {(projectId || stageId) && (
          <div style={{ marginBottom: "1rem", fontStyle: "italic", color: "#555" }}>
            {projectId && <div>Проект ID: {projectId}</div>}
            {stageId && <div>Этап ID: {stageId}</div>}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {[["Название:", (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          )],
          ["Описание:", (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%" }}
              rows={3}
            />
          )],
          ["Дедлайн:", (
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={todayStr}
              style={{ width: "100%" }}
            />
          )],
          ["Сложность:", (
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(Number(e.target.value) as 1 | 2 | 4)
              }
              style={{ width: "100%" }}
            >
              <option value={1}>1 – лёгкая</option>
              <option value={2}>2 – средняя</option>
              <option value={4}>4 – высокая</option>
            </select>
          )],
          ["Исполнители:", (
            <div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={selectedExecutorId}
                  onChange={(e) =>
                    setSelectedExecutorId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  style={{ flexGrow: 1 }}
                >
                  <option value="">Выберите исполнителя</option>
                  {employees
                    .filter((emp) => !executorIds.includes(emp.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
                <button onClick={addExecutor}>+</button>
              </div>
              <ul>
                {executorIds.map((id) => {
                  const emp = employees.find((e) => e.id === id);
                  return (
                    <li
                      key={id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      • {emp?.name}
                      <button
                        onClick={() => removeExecutor(id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "red",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )]].map(([label, field], idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "140px", fontWeight: "bold" }}>{label}</div>
              <div style={{ flexGrow: 1 }}>{field}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose} className="button red">
            Отмена
          </button>
          <button onClick={handleCreate} className="button green">
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}