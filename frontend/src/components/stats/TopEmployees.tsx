import React, { useEffect, useState } from "react";
import { getTopEmployees } from "../../api";
import type { ScoredEmployee } from "../../types";
import { ScoreBadge } from "./ScoreBadge";

type Props = {
  from: string;
  to: string;
  refEmpScore: number;
};

export default function TopEmployees({ from, to, refEmpScore }: Props) {
  const [topCount, setTopCount] = useState(3);
  const [employeeStats, setEmployeeStats] = useState<ScoredEmployee[]>([]);

  useEffect(() => {
    if (!from || !to) return;
    getTopEmployees(from, to, topCount).then((data) => {
    const converted: ScoredEmployee[] = data.map((item) => ({
        employee_id: item.employee.id,
        name: item.employee.name,
        score: item.score,
    }));

    setEmployeeStats(converted);
    });

  }, [from, to, topCount]);

  const medals = ["🥇", "🥈", "🥉", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅"];

  return (
    <div className="right">
      <h4 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Лучшие работники
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
        </select>
      </h4>

      {employeeStats.map((e, i) => (
        <div key={e.employee_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {medals[i] || `${i + 1}.`} {e.name}
          </span>
          <ScoreBadge value={e.score} refValue={refEmpScore} />
        </div>
      ))}
    </div>
  );
}