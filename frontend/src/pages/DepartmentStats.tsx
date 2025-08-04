import React, { useEffect, useState } from "react";
import { getDepartmentStats, getProjects, getProjectStats, getEmployees } from "../api";
import { ScoreBadge } from "../components/ScoreBadge";
import { StatusLabel } from "../components/StatusLabel";
import DepartmentHeader from "../components/DepHeader";
import VerticalProgress from "../components/VerticalProgress"

export default function DepartmentStats() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()  // 0-based: январь = 0

  // Первый день текущего месяца
  const firstDay = new Date(year, month, 2).toISOString().split("T")[0]

  // Последний день текущего месяца
  const lastDay = new Date(year, month + 1, 1).toISOString().split("T")[0]

  const [start, setStart] = useState(firstDay);
  const [end, setEnd] = useState(lastDay);
  const [score, setScore] = useState(0);
  const [refscore, setRefScore] = useState(60);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, [start, end]);

  const handleCurrentMonth = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    setStart(new Date(y, m, 2).toISOString().split("T")[0])
    setEnd(new Date(y, m + 1, 1).toISOString().split("T")[0])
    setRefScore(60)
  }

  const handleCurrentQuarter = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    const qStartMonth = Math.floor(m / 3) * 3
    setStart(new Date(y, qStartMonth, 2).toISOString().split("T")[0])
    setEnd(new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0])
    setRefScore(180)
  }

  async function loadStats() {
    const {score} = await getDepartmentStats(start, end);
    setScore(score);

    const projects = await getProjects(start, end);
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

    // const employees = await getEmployees();
    // const empData = employees.map((e: any) => ({
    //   name: e.name,
    //   score: by_employee[e.id] || 0,
    // }));
    // setEmployeeStats(empData.sort((a, b) => b.score - a.score));
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 <DepartmentHeader/></h2>
      
      <div style={{ display: "flex", gap: "3rem" }}>
        <div style={{ flex: 0.7 }}>
          <div style={{ marginBottom: "1rem" }}>
            С{" "}
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            По{" "}
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущий месяц
          </button>
          &#160;&#160;&#160;  
          <button onClick={handleCurrentQuarter} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущий квартал
          </button>
          <h3>
            Статистика отдела:    <ScoreBadge value={score} refValue={refscore}/>
          </h3>
        </div>
        <div style={{ flex: 2 }}>
          <div className="flex items-center gap-4">
            <VerticalProgress value={score} refValue={refscore}/>
          </div>
        </div>
      </div>
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
        <div style={{ flex: 0.5 }}>
          <h2></h2>
        </div>

        {/* Employees */}
        <div style={{ flex: 1 }}>
          <h4>Лучшие работники</h4>
          {employeeStats.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{e.name}</span>
              <ScoreBadge value={e.score} refValue={refscore} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
