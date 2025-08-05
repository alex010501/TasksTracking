import React, { useEffect, useState } from "react";
import { getDepartmentStats, getProjectsByPeriod, getTopEmployees } from "../api";
import { ScoreBadge } from "../components/common/ScoreBadge";
import { StatusLabel } from "../components/common/StatusLabel";
import DepartmentHeader from "../components/department/DepHeader";
import VerticalProgress from "../components/common/VerticalProgress"

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
  const [topCount, setTopCount] = useState(3);
  const [score, setScore] = useState(0);
  const [refEmpScore, setRefEmpScore] = useState(15);
  const [refscore, setRefScore] = useState(60);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, [start, end, topCount]);

  const handleCurrentMonth = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    setStart(new Date(y, m, 2).toISOString().split("T")[0])
    setEnd(new Date(y, m + 1, 1).toISOString().split("T")[0])
    setRefEmpScore(15)
    setRefScore(60)
  }

  const handleCurrentQuarter = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    const qStartMonth = Math.floor(m / 3) * 3
    setStart(new Date(y, qStartMonth, 2).toISOString().split("T")[0])
    setEnd(new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0])
    setRefEmpScore(45)
    setRefScore(180)
  }

  async function loadStats() {
    const { score } = await getDepartmentStats(start, end);
    setScore(score);

    const projects = await getProjectsByPeriod(start, end);
    const projData = projects.map((proj: any) => ({
      name: proj.name,
      status: proj.status,
      score: proj.efficiency ?? 0,
    }));
    setProjectStats(projData);

    const top = await getTopEmployees(start, end, topCount);
    const empData = top.map((e: any) => ({
      name: e.name,
      score: e.score,
    }));
    setEmployeeStats(empData);
  }


  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 <DepartmentHeader/></h2>
      
      <div style={{ display: "flex", gap: "3rem" }}>
        <div style={{ flex: 0.7 }}>
          <div style={{ marginBottom: "1rem" }}>
            С&#160;&#160;{" "}
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
          <h4>Лучшие работники &#160;&#160;&#160; 
          <select
            value={topCount}
            onChange={(e) => setTopCount(Number(e.target.value))}
            style={{ padding: "4px 8px", borderRadius: "4px" }}
          >
            {[3, 5, 10].map((n) => (
              <option key={n} value={n}>
                Топ {n}
              </option>
            ))}
          </select> </h4>
          {employeeStats.map((e, i) => {
            const medals = ["🥇", "🥈", "🥉", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅"];
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{medals[i] || `${i + 1}.`} {e.name}</span>
                <ScoreBadge value={e.score} refValue={refEmpScore} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
