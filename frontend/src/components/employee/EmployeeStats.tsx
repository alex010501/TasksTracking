import { useEffect, useState } from "react";
import { getEmployeeScore } from "../../api";
import { ScoreBadge } from "../stats/ScoreBadge";
import VerticalProgress from "../stats/VerticalProgress";

interface Props {
  employeeId: number;
  period: { from: string; to: string };
}

export default function EmployeeStats({ employeeId, period }: Props) {
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [score, setScore] = useState(0);
  const [refScore, setRefScore] = useState(15);

  useEffect(() => {
    loadStats();
  }, [from, to]);

  const handleCurrentMonth = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    setFrom(new Date(y, m, 2).toISOString().split("T")[0])
    setTo(new Date(y, m + 1, 1).toISOString().split("T")[0])
    setRefScore(15)
  }

  const handleCurrentQuarter = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    const qStartMonth = Math.floor(m / 3) * 3
    setFrom(new Date(y, qStartMonth, 2).toISOString().split("T")[0])
    setTo(new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0])
    setRefScore(45)
  }

  async function loadStats() {
    const { score } = await getEmployeeScore(employeeId, period.from, period.to);
    setScore(score);
  }

  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "3rem" }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "1rem", fontWeight: "bold"}}>
            С{" "}
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            &#160;&#160;&#160;
            По{" "}
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущий месяц
          </button>
          &#160;&#160;&#160;  
          <button onClick={handleCurrentQuarter} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            Текущий квартал
          </button>
        <h3>&#160;</h3>
        <h3>
          Статистика сотрудника: <ScoreBadge value={score} refValue={refScore} />
        </h3>
      </div>
      <div style={{ flex: 1.5 }}>
        <VerticalProgress value={score} refValue={refScore} />
      </div>
    </div>
  );
}
