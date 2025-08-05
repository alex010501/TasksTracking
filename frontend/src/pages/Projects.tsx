import React, { useEffect, useState } from "react";
import { getProjectsByPeriod } from "../api"; // предполагается, что такой вызов есть
import type { Project } from "../types";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const from = "2025-01-01";
      const to = "2025-12-31";
      const data = await getProjectsByPeriod(from, to);
      setProjects(data);
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📁 Проекты</h2>
      <p>Здесь отображаются проекты и отнесенные к ним задачи</p>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> — {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
