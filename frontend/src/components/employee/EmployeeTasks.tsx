import { useEffect, useState } from "react";
import { getEmployeeTasks, getProjectName, getAllEmployees } from "../../api";
import type { Task, Employee } from "../../types";
import TaskCard from "../tasks/TaskCard";
import EditTaskModal from "../modals/EditTaskModal";

type Props = {
  employeeId: number;
};

export default function EmployeeTasksSection({ employeeId }: Props) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const [fromDate, setFromDate] = useState(new Date(year, month, 2).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date(year, month + 1, 1).toISOString().split("T")[0]);
  
  const [tasks, setTasks] = useState<Task[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getEmployeeTasks(employeeId, fromDate, toDate);
      if (!Array.isArray(fetchedTasks)) {
        console.error("Некорректный формат ответа getEmployeeTasks:", fetchedTasks);
        setTasks([]);
        return;
      }

      const Tasks = fetchedTasks.map((task: any) => ({
        ...task,
        executor_ids: typeof task.executor_ids === "string"
          ? task.executor_ids.split(",").map((id: string) => Number(id.trim()))
          : Array.isArray(task.executor_ids)
          ? task.executor_ids
          : [],
      }));
      setTasks(Tasks);

      const projectIds = [
        ...new Set(fetchedTasks.map((t) => t.project_id).filter((id): id is number => id !== null)),
      ];

      const names: Record<number, string> = {};
      for (const id of projectIds) {
        if (!(id in projectNames)) {
          const nameObj = await getProjectName(id);
          names[id] = nameObj.name;
        }
      }

      setProjectNames((prev) => ({ ...prev, ...names }));
    } catch (err) {
      console.error("Ошибка загрузки задач сотрудника:", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [employeeId, fromDate, toDate]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
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
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setFromDate(monday.toISOString().split("T")[0]);
    setToDate(sunday.toISOString().split("T")[0]);
  };

  const tasksWithoutProject = tasks.filter((t) => !t.project_id);
  const tasksGroupedByProject: Record<number, Task[]> = {};
  tasks
    .filter((t) => t.project_id)
    .forEach((t) => {
      const pid = t.project_id!;
      if (!tasksGroupedByProject[pid]) tasksGroupedByProject[pid] = [];
      tasksGroupedByProject[pid].push(t);
    });

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Задачи сотрудника</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          С{" "}
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          По{" "}
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button onClick={handleCurrentWeek} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущая неделя
        </button>
        <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущий месяц
        </button>
      </div>

      {Object.entries(tasksGroupedByProject).map(([projectIdStr, taskList]) => {
        const projectId = Number(projectIdStr);
        const projectName = projectNames[projectId] || "Загрузка...";
        return (
          <div key={projectId} style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ margin: "0.5rem 0" }}>{projectName}</h4>
            {taskList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                selected={selectedTaskId === task.id}
                onSelect={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                // onSelect={() => handleSelect(task.id)}
                onUpdated={loadTasks}
                onEdit={() => {
                  setSelectedTaskId(task.id);
                  setShowEditModal(true);
                }}
                // onEdit={() => handleEdit(task)}
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
                employees={employees}
                selected={selectedTaskId === task.id}
                onSelect={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                // onSelect={() => handleSelect(task.id)}
                onUpdated={loadTasks}
                onEdit={() => {
                  setSelectedTaskId(task.id);
                  setShowEditModal(true);
                }}
                // onEdit={() => handleEdit(task)}
              />
            ))}
        </div>
      )}

      {selectedTask && (
                  <EditTaskModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    task={selectedTask}
                    onUpdated={() => {
                      setShowEditModal(false);
                      loadTasks();
                    }}
                  />
                )}
    </div>
  );
}