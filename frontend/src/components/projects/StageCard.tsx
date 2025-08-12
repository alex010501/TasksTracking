import TaskCard from "../tasks/TaskCard";
import type { Task } from "../../types";

type Stage = { id: number; name: string };

type Props = {
  stage: Stage;
  tasks: Task[];                                 // <- теперь точно тот же Task
  employeesById: Record<number, string>;
  onAddTaskClick: () => void;
  onEditTaskClick: (task: Task) => void;
  onStageChanged: () => void;   // обновить задачи этапа (после изменений)
};

export default function StageCard({
  stage,
  tasks,
  employeesById,
  onAddTaskClick,
  onEditTaskClick,
  onStageChanged,
}: Props) {
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div
        className="card-header"
        title={`Этап: ${stage.name}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ fontWeight: 600 }}>{stage.name}</div>
        <button className="button green" onClick={onAddTaskClick}>+ Задача</button>
      </div>

      <div className="card-body" style={{ display: "grid", gap: 8 }}>
        {tasks.length === 0 && <div style={{ color: "#6b7280" }}>Задач пока нет</div>}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            employeesById={employeesById}
            onEdit={() => onEditTaskClick(task)}
            onUpdated={onStageChanged}
          />
        ))}
      </div>
    </div>
  );
}