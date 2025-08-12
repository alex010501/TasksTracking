import { useEffect, useMemo, useState } from "react";
import { getEmployeeScore } from "../../api";
import { ScoreBadge } from "../stats/ScoreBadge";
import VerticalProgress from "../stats/VerticalProgress";

interface Props {
  employeeId: number;
  period: { from: string; to: string };
}

export default function EmployeeStats({ employeeId, period }: Props) {
  // собственный управляемый период
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [score, setScore] = useState(0);
  const [refScore, setRefScore] = useState(15);
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFrom(period.from);
    setTo(period.to);
  }, [period.from, period.to]);

  const handleCurrentMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    setFrom(new Date(y, m, 2).toISOString().split("T")[0]);
    setTo(new Date(y, m + 1, 1).toISOString().split("T")[0]);
    setRefScore(15);
  };

  const handleCurrentQuarter = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const qStart = Math.floor(m / 3) * 3;
    setFrom(new Date(y, qStart, 2).toISOString().split("T")[0]);
    setTo(new Date(y, qStart + 3, 1).toISOString().split("T")[0]);
    setRefScore(45);
  };

  const loadStats = useMemo(
    () => async () => {
      if (!employeeId) return;
      setLoading(true);
      setErr(undefined);
      try {
        // БАГ был тут: раньше использовались period.from/period.to
        const { score } = await getEmployeeScore(employeeId, from, to);
        setScore(Number(score) || 0);
      } catch (e: any) {
        setErr(e?.message || "Не удалось загрузить статистику");
      } finally {
        setLoading(false);
      }
    },
    [employeeId, from, to]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "3rem" }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
          С{" "}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          {" "}По{" "}
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={handleCurrentMonth} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущий месяц
        </button>
        {" "}
        <button onClick={handleCurrentQuarter} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Текущий квартал
        </button>

        <h3 style={{ marginTop: 12 }}>
          Статистика сотрудника:{" "}
          {loading ? "загрузка…" : <ScoreBadge value={score} refValue={refScore} />}
        </h3>
        {err && <div style={{ color: "#c0392b", marginTop: 6 }}>{err}</div>}
      </div>

      <div style={{ flex: 1.5 }}>
        <VerticalProgress value={score} refValue={refScore} />
      </div>
    </div>
  );
}