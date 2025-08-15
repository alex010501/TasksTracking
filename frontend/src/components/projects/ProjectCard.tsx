import { useEffect, useState } from "react";
import type { Project, ProjectStage, Task, Employee } from "../../types";
import { getProjectStages, getProjectScore, getStageTasks, getAllEmployees } from "../../api";
import StageCard from "./StageCard";
import AddTaskModal from "../modals/AddTaskModal";
import { safeDateISO } from "../../utils";

type Props = {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onUpdated: () => void;
};

export default function ProjectCard({
  project,
  expanded,
  onToggle,
  onEdit,
  onUpdated,
}: Props) {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<number, Task[]>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModalForStage, setShowAddModalForStage] = useState<number | null>(null);
  const [openStageId, setOpenStageId] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (expanded) await loadData(mounted);
      await loadScore(mounted);
    };

    run();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, project.id]);

  const loadScore = async (mounted = true) => {
    try {
      setLoadingScore(true);
      const { score } = await getProjectScore(project.id, "2000-01-01", "3000-12-31");
      if (mounted) setScore(score);
    } catch {
      if (mounted) setScore(null);
    } finally {
      if (mounted) setLoadingScore(false);
    }
  };

  const loadData = async (mounted = true) => {
    try {
      setLoadingData(true);

      // 1) Сначала этапы
      const stageData = await getProjectStages(project.id);
      if (!mounted) return;

      // 2) Параллельно тянем задачи по всем этапам И список сотрудников
      const [pairs, employeeData] = await Promise.all([
        Promise.all(
          stageData.map(async (s: any) => {
            const tasks = await getStageTasks(project.id, s.id); // важно: project_id + stage_id
            return [s.id, tasks] as const;
          })
        ),
        getAllEmployees(),
      ]);
      if (!mounted) return;

      // 3) Собираем карту задач по этапам
      const taskMap: Record<number, Task[]> = {};
      for (const [sid, tasks] of pairs) taskMap[sid] = tasks;

      // 4) Коммитим в состояние
      setStages(stageData);
      setTasksByStage(taskMap);
      setEmployees(employeeData);
    } finally {
      if (mounted) setLoadingData(false);
    }
  };

  const refresh = async () => {
    await Promise.all([loadData(), loadScore()]);
  };

  const handleStageToggle = (stageId: number) => {
    setOpenStageId((prev) => (prev === stageId ? null : stageId));
  };

  return (
    <div style={{ border: "2px solid #ddd", borderRadius: "8px", marginBottom: "1rem" }}>
      <div
        style={{
          background: "#eee",
          display: "flex",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <div style={{ width: "50%", fontWeight: "bold" }}>{project.name}</div>
        <div style={{ width: "15%" }}>{project.status}</div>
        <div style={{ width: "15%" }}>
          {project.deadline ? safeDateISO(project.deadline) : "—"}
        </div>
        <div style={{ width: "15%" }}>
          {score !== null ? `Баллы: ${score}` : (loadingScore ? "Загрузка..." : "—")}
        </div>
        <button
          onClick={onToggle}
          style={{
            marginLeft: "auto",
            fontSize: "1.2rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "black",
          }}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div style={{ background: "white", padding: "1rem" }}>
          <p>
            <strong>Описание:</strong> {project.description || "—"}
          </p>
          <p>
            <strong>Сроки:</strong>{" "}
            {safeDateISO(project.created_date)} —{" "}
            {project.deadline ? safeDateISO(project.deadline) : "—"}
          </p>

          {project.status !== "завершен" && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button className="button blue" onClick={onEdit} disabled={loadingData || loadingScore}>
                Изменить проект
              </button>
            </div>
          )}

          {stages.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              tasks={tasksByStage[stage.id] || []}
              employees={employees}
              expanded={openStageId === stage.id}
              onToggle={() => handleStageToggle(stage.id)}
              onAddTask={() => setShowAddModalForStage(stage.id)}
              onUpdated={refresh}
            />
          ))}

          {showAddModalForStage !== null && (
            <AddTaskModal
              isOpen={true}
              onClose={() => setShowAddModalForStage(null)}
              onCreated={async () => {
                setShowAddModalForStage(null);
                // Сразу обновим текущий проект (этапы/задачи/баллы), затем уведомим родителя
                await refresh();
                onUpdated();
              }}
              projectId={project.id}
              stageId={showAddModalForStage}
            />
          )}
        </div>
      )}
    </div>
  );
}