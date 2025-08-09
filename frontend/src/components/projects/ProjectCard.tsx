import { useEffect, useState } from "react";
import type { Project, ProjectStage, Task, Employee } from "../../types";
import { getProjectStages, getProjectScore, getStageTasks, getAllEmployees } from "../../api";
import StageCard from "./StageCard";
import AddTaskModal from "../modals/AddTaskModal";
import { formatDate } from "../../utils";

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

  useEffect(() => {
    if (expanded) {
      loadData();
    }
    loadScore();
  }, [expanded]);

  const loadScore = async () => {
    // const fromS = project.created_date;
    // const toE = project.deadline || new Date().toISOString().split("T")[0];
    const { score } = await getProjectScore(project.id, "2000-01-01", "3000-12-31");
    setScore(score);
    };

  const loadData = async () => {
    const stageData = await getProjectStages(project.id);
    const taskMap: Record<number, Task[]> = {};
    for (const stage of stageData) {
      taskMap[stage.id] = await getStageTasks(project.id, stage.id);
    }
    const employeeData = await getAllEmployees();

    setStages(stageData);
    setTasksByStage(taskMap);
    setEmployees(employeeData);
  };

  const refresh = async () => {
    await loadData();
    await loadScore();
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
            {project.deadline ? formatDate(project.deadline) : "—"}
        </div>
        <div style={{ width: "15%" }}>
            {score !== null ? `Баллы: ${score}` : "Загрузка..."}
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
            {formatDate(project.created_date)} —{" "}
            {project.deadline ? formatDate(project.deadline) : "—"}
          </p>

          {project.status !== "завершен" && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button className="button blue" onClick={onEdit}>
                Изменить проект
              </button>
            </div>
          )}

          {stages.map((stage) => (
            <StageCard
              key={stage.id}
              projectId={project.id}
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
              onCreated={() => {
                setShowAddModalForStage(null);
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