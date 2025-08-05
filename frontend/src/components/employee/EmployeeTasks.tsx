import { useEffect, useState } from "react";
import { getEmployeeTasks } from "../../api";
import { StatusLabel } from "../common/StatusLabel";

interface Props {
  employeeId: number;
  period: { from: string; to: string };
}

interface Task {
  id: number;
  name: string;
  description: string;
  weight: number;
  is_completed: boolean;
  completion_date: string | null;
  created_at: string;
  project: { id: number; name: string } | null;
}

export default function EmployeeTasks({ employeeId, period }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);

  useEffect(() => {
    loadTasks();
  }, [employeeId, from, to]);

  const loadTasks = async () => {
    const data = await getEmployeeTasks(employeeId, from, to);
    setTasks(data);
  };

  const setCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay(); // Sunday = 0
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    setFrom(monday.toISOString().split("T")[0]);
    setTo(friday.toISOString().split("T")[0]);
  };

  const setCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const start = new Date(year, month, 2);
    const end = new Date(year, month + 1, 1); // last day of month

    setFrom(start.toISOString().split("T")[0]);
    setTo(end.toISOString().split("T")[0]);
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <hr />
      <h4 className="mb-2">Задачи сотрудника</h4>
      <div className="flex items-center gap-4 mb-3">
        <label>
          С{" "}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        &#160;&#160;&#160;
        <label>
          По{" "}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        &#160;&#160;&#160;
        <button
          onClick={setCurrentWeek}
          className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          Текущая неделя
        </button>
        &#160;&#160;&#160;
        <button
          onClick={setCurrentMonth}
          className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          Текущий месяц
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between border-b py-1">
            <span>{task.name}</span>
            <span>{task.project?.name ?? "Без проекта"}</span>
            <StatusLabel status={task.is_completed ? "Выполнено" : "В работе"} />
          </li>
        ))}
      </ul>
    </div>
  );
}
