import { useEffect, useMemo, useState } from "react";
import { getEmployeeTasks, getProjectName, getAllEmployees } from "../../api";
import type { Task, Employee } from "../../types";
import TaskCard from "../tasks/TaskCard";
import EditTaskModal from "../modals/EditTaskModal";

type Props = { employeeId: number };

function toIntArray(input: any): number[] {
  if (Array.isArray(input)) return Array.from(new Set(input.map((n) => Number(n)))).filter(Number.isFinite);
  if (!input) return [];
  return Array.from(new Set(String(input).split(",").map((x) => Number(x)).filter(Number.isFinite)));
}

export default function EmployeeTasksSection({ employeeId }: Props) {
  const d = new Date();
  const initialFrom = new Date(d.getFullYear(), d.getMonth(), 2).toISOString().split("T")[0];
  const initialTo   = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const employeesById = useMemo(() => {
    const m: Record<number, string> = {};
    employees.forEach((e) => (m[e.id] = e.name));
    return m;
  }, [employees]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  async function loadTasks() {
    setLoading(true);
    setErr(undefined);
    try {
      const fetched = await getEmployeeTasks(employeeId, fromDate, toDate);
      const list: Task[] = (Array.isArray(fetched) ? fetched : []).map((t: any) => ({
        id: Number(t.id),
        name: String(t.name || ""),
        description: String(t?.description ?? ""),
        created_date: String(t.created_date || ""),
        deadline: String(t.deadline || ""),
        status: String(t.status || "в работе"),
        difficulty: Number(t.difficulty) as 1 | 2 | 4,
        executor_ids: toIntArray(t?.executor_ids),
        project_id: t.project_id ?? null,
        stage_id: t.stage_id ?? null,
      }));
      setTasks(list);

      const idsToFetch = Array.from(
        new Set(list.map((t) => t.project_id).filter((x): x is number => typeof x === "number"))
      ).filter((id) => !(id in projectNames));

      if (idsToFetch.length) {
        const names = await Promise.all(idsToFetch.map(async (id) => {
          try {
            const { name } = await getProjectName(id);
            return [id, name] as const;
          } catch {
            return [id, `Проект #${id}`] as const;
          }
        }));
        setProjectNames((prev) => ({ ...prev, ...Object.fromEntries(names) }));
      }
    } catch (e: any) {
      setErr(e?.message || "Не удалось загрузить задачи сотрудника");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [employeeId, fromDate, toDate]);

  useEffect(() => {
    getAllEmployees().then((list) => setEmployees(Array.isArray(list) ? list : []));
  }, []);

  const handleCurrentMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    setFromDate(new Date(y, m, 2).toISOString().split("T")[0]);
    setToDate(new Date(y, m + 1, 1).toISOString().split("T")[0]);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today); monday.setDate(today.getDate() - dayOfWeek);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    setFromDate(monday.toISOString().split("T")[0]);
    setToDate(sunday.toISOString().split("T")[0]);
  };

  const tasksWithoutProject = tasks.filter((t) => !t.project_id);
  const tasksByProject: Record<number, Task[]> = {};
  tasks.forEach((t) => {
    if (t.project_id) {
      if (!tasksByProject[t.project_id]) tasksByProject[t.project_id] = [];
      tasksByProject[t.project_id].push(t);
    }
  });

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Задачи сотрудника</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label>С{" "}
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>По{" "}
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button onClick={handleCurrentWeek} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущая неделя
        </button>
        <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущий месяц
        </button>
        <button className="button" onClick={loadTasks}>Применить</button>
      </div>

      {err && <div style={{ color: "#c0392b", marginBottom: 8 }}>{err}</div>}
      {loading && <div style={{ color: "#6b7280", marginBottom: 8 }}>Загрузка…</div>}

      {Object.entries(tasksByProject).map(([projectIdStr, list]) => {
        const pid = Number(projectIdStr);
        const pname = projectNames[pid] || `Проект #${pid}`;
        return (
          <div key={pid} style={{ marginBottom: "1.5rem" }}>
            <h5 style={{ margin: "0.5rem 0" }}>{pname}</h5>
            {list.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employeesById={employeesById}    // ← используем карту, а не массив
                onUpdated={loadTasks}
                onEdit={() => { setSelectedTaskId(task.id); setShowEditModal(true); }}
              />
            ))}
          </div>
        );
      })}

      {tasksWithoutProject.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Прочие задачи</h4>
          {tasksWithoutProject.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              employeesById={employeesById}
              onUpdated={loadTasks}
              onEdit={() => { setSelectedTaskId(task.id); setShowEditModal(true); }}
            />
          ))}
        </div>
      )}

      {selectedTask && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={selectedTask}
          onUpdated={() => { setShowEditModal(false); loadTasks(); }}
        />
      )}
    </div>
  );
}