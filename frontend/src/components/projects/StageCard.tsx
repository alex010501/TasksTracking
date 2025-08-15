import { useEffect, useMemo, useState, useCallback } from "react";
import type { ProjectStage, Task, Employee } from "../../types";
import TaskCard from "../tasks/TaskCard";
import EditTaskModal from "../modals/EditTaskModal";
import { getAllEmployees } from "../../api";
import { toExecutorIds } from "../../utils";

type Props = {
  stage: ProjectStage;
  tasks: Task[];
  employees?: Employee[];
  expanded: boolean;
  onToggle: () => void;
  onAddTask: () => void;
  onUpdated: () => void;
};

export default function StageCard({
  stage,
  tasks,
  employees: propEmployees = [],
  expanded,
  onToggle,
  onAddTask,
  onUpdated,
}: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Подтягиваем сотрудников только если их не передали пропсом
  useEffect(() => {
    let mounted = true;
    if (propEmployees.length > 0) {
      setEmployees(propEmployees);
    } else {
      getAllEmployees()
        .then((list) => { if (mounted) setEmployees(list); })
        .catch(() => { /* оповещения об ошибках уже централизованы, тут без UI-изменений молча игнорируем */ });
    }
    return () => { mounted = false; };
  }, [propEmployees]);

  // Единая безопасная нормализация executor_ids
  const fixTask = useCallback((t: Task): Task => {
    const ids =
      typeof t.executor_ids === "string"
        ? toExecutorIds(t.executor_ids)
        : t.executor_ids;
    return { ...t, executor_ids: ids };
  }, []);

  const fixedTasks = useMemo(() => tasks.map(fixTask), [tasks, fixTask]);

  const handleTaskSelect = (id: number) => {
    setSelectedTaskId((prev) => (prev === id ? null : id));
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(fixTask(task));
  };

  const closeEditModal = () => setTaskToEdit(null);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          backgroundColor: "#eee",
          padding: "0.75rem",
          borderRadius: expanded ? "8px 8px 0 0" : "8px",
          border: "2px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        {stage.name}
        <span>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            border: "2px solid #ccc",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <button className="button green" onClick={onAddTask}>
            + Создать задачу
          </button>

          {fixedTasks.length === 0 ? (
            <p style={{ marginTop: "1rem" }}>Нет задач на этом этапе.</p>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {fixedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  employees={employees}
                  selected={selectedTaskId === task.id}
                  onSelect={() => handleTaskSelect(task.id)}
                  onUpdated={onUpdated}
                  onEdit={() => handleEditTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {taskToEdit && (
        <EditTaskModal
          isOpen={true}
          onClose={closeEditModal}
          onUpdated={() => {
            closeEditModal();
            onUpdated(); // Обновить список задач у родителя
          }}
          task={taskToEdit}
        />
      )}
    </div>
  );
}