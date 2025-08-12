import { useMemo, useState } from "react";
import { completeTask } from "../../api";
import type { Task, Employee } from "../../types";

type Props = {
  task: Task;
  // основной вариант
  employeesById?: Record<number, string>;
  // опционально (если где-то ещё передают массив сотрудников)
  employees?: Employee[];
  onEdit: () => void;
  onUpdated: () => void;
};

function normalizeIds(input: number[] | string): number[] {
  if (Array.isArray(input)) return Array.from(new Set(input.map(Number))).filter(Number.isFinite);
  if (!input) return [];
  return Array.from(new Set(String(input).split(",").map((x) => Number(x)).filter(Number.isFinite)));
}

export default function TaskCard({ task, employeesById, employees, onEdit, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const mapById = useMemo(() => {
    if (employeesById) return employeesById;
    const m: Record<number, string> = {};
    (employees || []).forEach(e => { m[e.id] = e.name; });
    return m;
  }, [employeesById, employees]);

  const execNames = useMemo(() => {
    const ids = normalizeIds(task.executor_ids as any);
    const names = ids.map((id) => mapById[id]).filter(Boolean);
    return names.length ? names.join(", ") : "—";
  }, [task.executor_ids, mapById]);

  const overdue =
    task.status !== "выполнено" &&
    task.deadline < (task.created_date || new Date().toISOString().split("T")[0]);

  const handleComplete = async () => {
    setClosing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await completeTask(task.id, today);
      onUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="card" style={{ borderColor: overdue ? "#f59e0b" : undefined }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="button"
          title={open ? "Свернуть" : "Развернуть"}
          onClick={() => setOpen((v) => !v)}
          style={{ minWidth: 32 }}
        >
          {open ? "▾" : "▸"}
        </button>
        <div style={{ fontWeight: 600, flex: 1 }}>{task.name}</div>
        <div style={{ width: 110, textAlign: "right" }}>
          {task.status === "выполнено" ? "Выполнено" : overdue ? "Просрочено" : "В работе"}
        </div>
        {task.status !== "выполнено" && (
          <button className="button green" onClick={handleComplete} disabled={closing}>
            {closing ? "Завершаем…" : "Завершить"}
          </button>
        )}
        <button className="button" onClick={onEdit}>Изменить</button>
      </div>

      {open && (
        <div className="card-body" style={{ display: "grid", gap: 6 }}>
          <div><b>Исполнители:</b> {execNames}</div>
          <div><b>Сложность:</b> {task.difficulty}</div>
          <div><b>Дата постановки:</b> {task.created_date || "—"}</div>
          <div><b>Дедлайн:</b> {task.deadline || "—"}</div>
          {task.description && <div><b>Описание:</b> {task.description}</div>}
        </div>
      )}
    </div>
  );
}