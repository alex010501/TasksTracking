import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllEmployees, getProjectLinkedTasks, getUnassignedTasks } from "../api";
import AddTaskModal from "../components/modals/AddTaskModal";
import EditTaskModal from "../components/modals/EditTaskModal";
import TaskCard from "../components/tasks/TaskCard";
import type { Employee, Task } from "../types";

function toIntArray(input: number[] | string): number[] {
  if (Array.isArray(input)) return Array.from(new Set(input.map(Number))).filter(Number.isFinite);
  if (!input) return [];
  return Array.from(new Set(String(input).split(",").map((x) => Number(x)).filter(Number.isFinite)));
}

export default function TasksPage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const weekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }, []);

  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [showLinked, setShowLinked] = useState(false); // false — вне проектов

  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeesById = useMemo(() => {
    const m: Record<number, string> = {};
    employees.forEach((e) => (m[e.id] = e.name));
    return m;
  }, [employees]);

  // ВАЖНО: состояние строго в типе Task (executor_ids: number[])
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const [emps, rawList] = await Promise.all([
        getAllEmployees(),
        showLinked
          ? getProjectLinkedTasks({ from_date: fromDate, to_date: toDate })
          : getUnassignedTasks({ from_date: fromDate, to_date: toDate }),
      ]);

      setEmployees(emps || []);

      // Нормализуем в канонический Task
      const list: Task[] = (rawList || []).map((t: any) => ({
        id: Number(t.id),
        name: String(t.name || ""),
        description: String(t?.description ?? ""),
        created_date: String(t.created_date || ""),
        deadline: String(t.deadline || ""),
        status: String(t.status || "в работе"),
        difficulty: Number(t.difficulty) as 1 | 2 | 4,
        executor_ids: toIntArray(t.executor_ids as any),
        project_id: t.project_id ?? null,
        stage_id: t.stage_id ?? null,
      }));

      setTasks(list);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Не удалось загрузить задачи");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, showLinked]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="filters card">
        <div className="card-header" style={{ fontWeight: 700 }}>Фильтры</div>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label>С{" "}
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label>По{" "}
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>

          <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={showLinked} onChange={(e) => setShowLinked(e.target.checked)} />
            Показывать задачи в проектах
          </label>

          <button className="button" onClick={loadData}>Применить</button>

          <div style={{ flex: 1 }} />
          <button className="button green" onClick={() => setShowAddModal(true)}>+ Задача</button>
        </div>
      </div>

      {error && <div style={{ color: "#c0392b" }}>{error}</div>}
      {loading && <div style={{ color: "#6b7280" }}>Загрузка…</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {tasks.length === 0 && <div style={{ color: "#6b7280" }}>Задач нет</div>}
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            employeesById={employeesById}
            onEdit={() => setTaskToEdit(t)}
            onUpdated={loadData}
          />
        ))}
      </div>

      {showAddModal && (
        <AddTaskModal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); loadData(); }}
        />
      )}

      {taskToEdit && (
        <EditTaskModal
          isOpen={true}
          onClose={() => setTaskToEdit(null)}
          onUpdated={() => { setTaskToEdit(null); loadData(); }}
          task={taskToEdit}     // ← теперь строго types.Task
        />
      )}
    </div>
  );
}