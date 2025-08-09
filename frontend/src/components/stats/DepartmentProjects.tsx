import { useEffect, useState } from "react";
import { getProjects, getProjectScore } from "../../api";
import type { Project } from "../../types";
import { getScoreColor, formatDate } from "../../utils";

type Props = {
  from: string;
  to: string;
};

type ProjectWithScore = Project & { score: number };

export default function DepartmentProjects({ from, to }: Props) {
  const [projects, setProjects] = useState<ProjectWithScore[]>([]);

  useEffect(() => {
    if (!from || !to) return;

    getProjects({ from_date: from, to_date: to }).then(async (projects: Project[]) => {
      const scoredProjects: ProjectWithScore[] = await Promise.all(
        projects.map(async (proj) => {
          const { score } = await getProjectScore(proj.id, from, to);
          return { ...proj, score };
        })
      );
      setProjects(scoredProjects);
    });
  }, [from, to]);

  return (
    <div className="left">
      <h3 style={{ marginBottom: "1rem" }}>Проекты отдела</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "1rem",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h4 style={{ margin: 0 }}>{project.name}</h4>
              <p style={{ margin: 0 }}>Статус: {project.status}</p>
              <p style={{ margin: 0 }}>Срок: {formatDate(project.deadline) || "—"}</p>
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                color: getScoreColor(project.score, 30),
              }}
            >
              {project.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}