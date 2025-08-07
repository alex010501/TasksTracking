import { completeTask } from "../../api";
import type { Task, Employee } from "../../types";
import {formatDate} from "../../utils"

type Props = {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onUpdated: () => void;
  onEdit: () => void;
  employees?: Employee[];
};

export default function TaskCard({
  task,
  selected,
  onSelect,
  onUpdated,
  onEdit,
  employees = [],
}: Props) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "в работе":
        return "status in-progress";
      case "выполнено":
        return "status completed";
      case "просрочено":
        return "status overdue";
      default:
        return "status";
    }
  };

  const handleComplete = async () => {
    const today = new Date().toISOString().split("T")[0];
    await completeTask(task.id, today);
    onUpdated();
  };

  const difficulty = task.difficulty;
  const score = task.status === "выполнено" ? difficulty : 0;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          backgroundColor: "#f4f4f4",
          padding: "1rem",
          border: "2px solid #ddd",
          borderRadius: selected ? "8px 8px 0 0" : "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: "40%", fontWeight: "bold" }}>{task.name}</div>
        <div style={{ width: "15%" }}>
          <span className={getStatusClass(task.status)}>{task.status}</span>
        </div>
        <div style={{ width: "15%" }}>{formatDate(task.deadline)}</div>
        <div style={{ width: "10%" }}>
          {score} / {difficulty}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={onSelect}
            style={{
              fontSize: "1.2rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#FDE100", // ← черный цвет стрелок
            }}
            title={selected ? "Свернуть" : "Развернуть"}
          >
            {selected ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {selected && (
        <div
          style={{
            backgroundColor: "white",
            padding: "1rem",
            border: "2px solid #ddd",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Описание:</strong> {task.description || "–"}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>С:</strong> {formatDate(task.created_date)} &nbsp; <strong>До:</strong>{" "}
            {formatDate(task.deadline)}
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Исполнители:</strong>{" "}
            {Array.isArray(task.executor_ids) && task.executor_ids.length > 0
              ? task.executor_ids
                  .map(
                    (id) =>
                      employees.find((e) => e.id === id)?.name || `ID ${id}`
                  )
                  .join(", ")
              : "–"}
          </p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="button blue" onClick={onEdit}>
              Изменить задачу
            </button>
            {task.status !== "выполнено" && (
              <button className="button green" onClick={handleComplete}>
                Завершить
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}