import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllEmployees, getProjectScore, getProjectStages, getStageTasks } from "../../api";
import AddTaskModal from "../modals/AddTaskModal";
import EditTaskModal from "../modals/EditTaskModal";
import StageCard from "./StageCard";
import type { Task, Employee } from "../../types";

type Stage = { id: number; name: string };

type Props = {
  project: { id: number; name: string; deadline?: string | null };
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onUpdated: () => void;
  fromDate: string;
  toDate: string;
};

// Нормализация одной задачи к «каноническому» типу: description:string, executor_ids:number[]
function normalizeTask(t: any): Task {
  const ids =
    Array.isArray(t?.executor_ids)
      ? t.executor_ids
      : String(t?.executor_ids || "")
          .split(",")
          .map((x: string) => Number(x))
          .filter(Number.isFinite);

  // дедуп и числовой массив
  const uniqIds = Array.from(new Set(ids.map(Number))).filter(Number.isFinite) as number[];

  return {
    ...t,
    description: (t?.description ?? "") as string,
    executor_ids: uniqIds,
  } as Task;
}

export default function ProjectCard({
  project,
  expanded,
  onToggle,
  onEdit,
  onUpdated,
  fromDate,
  toDate,
}: Props) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<number, Task[]>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [score, setScore] = useState<number | null>(null);

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [showAddModalForStage, setShowAddModalForStage] = useState<number | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const employeesById = useMemo(() => {
    const m: Record<number, string> = {};
    employees.forEach((e) => (m[e.id] = e.name));
    return m;
  }, [employees]);

  const refresh = useCallback(async () => {
    if (!expanded) return;
    setError(undefined);
    setLoading(true);
    try {
      const stageData = await getProjectStages(project.id);

      // Параллельно тянем задачи всех этапов и сразу нормализуем
      const tasksArrays = await Promise.all(stageData.map((s: any) => getStageTasks(project.id, s.id)));
      const next: Record<number, Task[]> = {};
      stageData.forEach((s: any, i: any) => {
        next[s.id] = (tasksArrays[i] || []).map(normalizeTask);
      });

      const employeeData = await getAllEmployees();

      setStages(stageData);
      setTasksByStage(next);
      setEmployees(employeeData);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Не удалось загрузить проект");
    } finally {
      setLoading(false);
    }
  }, [expanded, project.id]);

  const loadScore = useCallback(async () => {
    if (!expanded) return;
    try {
      const { score } = await getProjectScore(project.id, fromDate, toDate);
      setScore(Number(score) || 0);
    } catch (e: any) {
      console.error(e);
      setScore(null);
    }
  }, [expanded, project.id, fromDate, toDate]);

  useEffect(() => {
    refresh();
    loadScore();
  }, [refresh, loadScore]);

  // Обновление конкретного этапа (после создания/редактирования/завершения)
  const reloadStage = async (stageId: number) => {
    try {
      const list = (await getStageTasks(project.id, stageId)).map(normalizeTask);
      setTasksByStage((prev) => ({ ...prev, [stageId]: list }));
      await loadScore();
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          title={expanded ? "Свернуть" : "Развернуть"}
          onClick={onToggle}
          className="button"
          style={{ minWidth: 32 }}
        >
          {expanded ? "▾" : "▸"}
        </button>
        <div style={{ fontWeight: 700, flex: 1 }}>{project.name}</div>
        {score !== null && <div title="Сумма баллов за выбранный период">Счёт: {score}</div>}
        <button className="button" onClick={onEdit}>Редактировать</button>
      </div>

      {expanded && (
        <div className="card-body" style={{ paddingTop: 12 }}>
          {error && <div style={{ color: "#c0392b", marginBottom: 8 }}>{error}</div>}
          {loading && <div style={{ color: "#6b7280", marginBottom: 8 }}>Загрузка…</div>}

          {stages.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              tasks={(tasksByStage[stage.id] || [])}   // уже Task[]
              employeesById={employeesById}
              onAddTaskClick={() => setShowAddModalForStage(stage.id)}
              onEditTaskClick={(task) => setTaskToEdit(task)}
              onStageChanged={() => reloadStage(stage.id)}
            />
          ))}

          {/* Создание задачи в этапе */}
          {showAddModalForStage !== null && (
            <AddTaskModal
              isOpen={true}
              onClose={() => setShowAddModalForStage(null)}
              onCreated={async () => {
                const sid = showAddModalForStage!;
                setShowAddModalForStage(null);
                await reloadStage(sid);  // локально обновим этап
                await refresh();         // и обновим карточку
                onUpdated();             // страница перезагрузит проекты
              }}
              projectId={project.id}
              stageId={showAddModalForStage}
            />
          )}

          {/* Редактирование задачи */}
          {taskToEdit && (
            <EditTaskModal
              isOpen={true}
              onClose={() => setTaskToEdit(null)}
              onUpdated={async () => {
                const sid = taskToEdit!.stage_id!;
                setTaskToEdit(null);
                await reloadStage(sid);
                onUpdated();
              }}
              task={taskToEdit}  // тип совпадает с ../types.Task
            />
          )}
        </div>
      )}
    </div>
  );
}