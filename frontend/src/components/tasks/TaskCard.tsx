import { ScoreBadge } from "../common/ScoreBadge";
import { StatusLabel } from "../common/StatusLabel";
import type { Task } from "../../types";

type Props = {
  task: Task;
  expanded: boolean;
  onToggleExpand: () => void;
};

export default function TaskCard({ task, expanded, onToggleExpand }: Props) {
  const executors = task.executor_ids.split(",").map((e) => e.trim()).filter(Boolean);
  const score = task.status === "Выполнено" ? task.difficulty : 0;

  return (
    <div className="border rounded p-3 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold">{task.name}</h4>
          <div className="text-sm text-gray-500">Дедлайн: {task.deadline}</div>
          <div className="text-sm text-gray-500">Исполнители: {executors.join(", ") || "–"}</div>
          <div className="text-sm text-gray-500">
            Баллы: <ScoreBadge value={score} refValue={task.difficulty} />
          </div>
          <div className="text-sm text-gray-500">Сложность: {task.difficulty}</div>
          <div className="mt-1">
            <StatusLabel status={task.status} />
          </div>
        </div>
        <button onClick={onToggleExpand} className="text-2xl text-gray-400 hover:text-gray-600">
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm text-gray-700 space-y-2">
          <div><strong>Описание:</strong> {task.name}</div>
          <div><strong>Дата постановки:</strong> {new Date(task.created_date).toLocaleDateString()}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Редактировать</button>
            <button className="px-3 py-1 bg-green-600 text-white rounded">Завершить</button>
          </div>
        </div>
      )}
    </div>
  );
}