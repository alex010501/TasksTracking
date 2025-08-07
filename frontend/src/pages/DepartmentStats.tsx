import React, { useEffect, useState, useMemo } from "react";
import { getDepartmentStats } from "../api";
import DepartmentHeader from "../components/stats/DepHeader";
import StatsSection from "../components/stats/StatsSection";
import DepartmentProjects from "../components/stats/DepartmentProjects";
import TopEmployees from "../components/stats/TopEmployees";

export default function DepartmentStats() {
  const deptK = 2;     // баллов в день для отдела
  const empK = 0.5;    // баллов в день на сотрудника

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const defaultStart = new Date(year, month, 2).toISOString().split("T")[0];
  const defaultEnd = new Date(year, month + 1, 1).toISOString().split("T")[0];

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [score, setScore] = useState(0);

  const handleCurrentMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    setStart(new Date(y, m, 2).toISOString().split("T")[0]);
    setEnd(new Date(y, m + 1, 1).toISOString().split("T")[0]);
  };

  const handleCurrentQuarter = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const qStartMonth = Math.floor(m / 3) * 3;
    setStart(new Date(y, qStartMonth, 2).toISOString().split("T")[0]);
    setEnd(new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0]);
  };

  const refScore = useMemo(() => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const days = Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round(days * deptK);
  }, [start, end]);

  const refEmpScore = useMemo(() => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const days = Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round(days * empK);
  }, [start, end]);

  useEffect(() => {
    getDepartmentStats(start, end).then(({ score }) => setScore(score));
  }, [start, end]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 <DepartmentHeader /></h2>

      <StatsSection
        from={start}
        to={end}
        score={score}
        refScore={refScore}
        onChangeFrom={setStart}
        onChangeTo={setEnd}
        onCurrentMonth={handleCurrentMonth}
        onCurrentQuarter={handleCurrentQuarter}
        type="отдел"
      />

      <hr style={{ margin: "2rem 0" }} />

      <div className="page-content-60-40">
        <div className="left">
          <DepartmentProjects from={start} to={end} />
        </div>
        <div className="right">
          <TopEmployees from={start} to={end} refEmpScore={refEmpScore} />
        </div>
      </div>
    </div>
  );
}