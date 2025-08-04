import React, { useEffect, useState } from "react";
import { getDepartmentStats, getProjects, getProjectStats, getEmployees } from "../api";
import { ScoreBadge } from "../components/ScoreBadge";
import { StatusLabel } from "../components/StatusLabel";
import DepartmentHeader from "../components/DepHeader";

export default function DepartmentStats() {
  const [start, setStart] = useState("2025-06-06");
  const [end, setEnd] = useState("2025-07-06");
  const [total, setTotal] = useState(0);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, [start, end]);

  async function loadStats() {
    const { total, by_employee } = await getDepartmentStats(start, end);
    setTotal(total);

    const projects = await getProjects();
    const projData = await Promise.all(
      projects.map(async (proj: any) => {
        const stat = await getProjectStats(proj.id, start, end);
        return {
          name: proj.name,
          status: proj.deadline && new Date(proj.deadline) < new Date() ? "Выполнен" : "В работе",
          score: stat.efficiency,
        };
      })
    );
    setProjectStats(projData);

    const employees = await getEmployees();
    const empData = employees.map((e: any) => ({
      name: e.name,
      score: by_employee[e.id] || 0,
    }));
    setEmployeeStats(empData.sort((a, b) => b.score - a.score));
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 <DepartmentHeader/></h2>

      <div style={{ marginBottom: "1rem" }}>
        С{" "}
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        По{" "}
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>

      <h3>
        Статистика отдела:    <ScoreBadge value={total} />
      </h3>

      <hr />

      <div style={{ display: "flex", gap: "3rem" }}>
        {/* Projects */}
        <div style={{ flex: 1 }}>
          <h4>Проекты в этот период</h4>
          {projectStats.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{p.name}</span>
              <strong>{p.score}</strong>
              <StatusLabel status={p.status} />
            </div>
          ))}
        </div>

        {/* Employees */}
        <div style={{ flex: 1 }}>
          <h4>Лучшие работники</h4>
          {employeeStats.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{e.name}</span>
              <ScoreBadge value={e.score} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
