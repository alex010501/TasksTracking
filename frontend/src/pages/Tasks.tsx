import { useEffect, useState } from "react";
import { searchTasks } from "../api";
import type{ Task } from "../types";
import { ScoreBadge } from "../components/common/ScoreBadge";
import { StatusLabel } from "../components/common/StatusLabel";

export default function TasksPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("все");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2).toISOString().split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(startOfMonth);
  const [toDate, setToDate] = useState(endOfMonth);

  const loadTasks = async () => {
    const allTasks: Task[] = await searchTasks(query);
    const filtered = allTasks.filter((task) => {
      const inPeriod =
        (!fromDate || new Date(task.created_date) >= new Date(fromDate)) &&
        (!toDate || new Date(task.created_date) <= new Date(toDate));

      const statusMatch =
        statusFilter === "все" ||
        (statusFilter === "Выполнено" && task.status === "Выполнено") ||
        (statusFilter === "В работе" && task.status === "В работе") ||
        (statusFilter === "Просрочено" && task.status === "Просрочено");

      return inPeriod && statusMatch && task.project_id === null;
    });

    setTasks(filtered);
  };

  useEffect(() => {
    loadTasks();
  }, [query, statusFilter, fromDate, toDate]);

  const toggleExpand = (id: number) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCurrentMonth = () => {
    setFromDate(startOfMonth);
    setToDate(endOfMonth);
  };

  const handleCurrentWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const lastDay = new Date(now.setDate(firstDay.getDate() + 4)); // Friday

    setFromDate(firstDay.toISOString().split("T")[0]);
    setToDate(lastDay.toISOString().split("T")[0]);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧩 Задачи</h2>

      {/* Фильтры */}
      <div className="w-full flex justify-center">
        <div>
          <label>Поиск:</label>
          &#160;&#160;&#160;
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название задачи"
            className="border px-2 py-1 rounded"
            style={{ width: "59vw" }}
          />
        </div>
      </div>
      <h3></h3>
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-end", marginBottom: "1rem" }}>
        <div>
          <label>Статус:</label>
          &#160;&#160;
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="все">Все</option>
            <option value="в работе">В работе</option>
            <option value="выполнено">Выполнено</option>
            <option value="просрочено">Просрочено</option>
          </select>
        </div>

        <div>
          <label>С:</label>&#160;&#160;
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label>По:</label>&#160;&#160;
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>

        <div>
          <button onClick={handleCurrentWeek} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущая неделя
          </button>{" "}
          &#160;&#160;&#160;&#160;
          <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущий месяц
          </button>
        </div>
      </div>

      {/* Список задач */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const expanded = expandedTaskIds.has(task.id);
          const executors = task.executor_ids.split(",").map((e) => e.trim()).filter(Boolean);
          const score = task.status === "Выполнено" ? task.difficulty : 0;

          return (
            <div key={task.id} className="border rounded p-3 shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold">{task.name}</h4>
                  <div className="text-sm text-gray-500">Дедлайн: {task.deadline}</div>
                  <div className="text-sm text-gray-500">Исполнители: {executors.join(", ") || "–"}</div>
                  <div className="text-sm text-gray-500">Баллы: <ScoreBadge value={score} refValue={task.difficulty}/></div>
                  <div className="text-sm text-gray-500">Сложность: {task.difficulty}</div>
                  <div className="mt-1">
                    <StatusLabel status={task.status} />
                  </div>
                </div>
                <button onClick={() => toggleExpand(task.id)} className="text-2xl text-gray-400 hover:text-gray-600">
                  {expanded ? "▲" : "▼"}
                </button>
              </div>

              {expanded && (
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <div><strong>Описание:</strong> {task.name}</div>
                  <div><strong>Дата постановки:</strong> {new Date(task.created_date).toLocaleDateString()}</div>
                  {/* Здесь можно добавить кнопки */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">Редактировать</button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded">Завершить</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
