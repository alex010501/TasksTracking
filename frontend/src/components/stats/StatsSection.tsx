import { ScoreBadge } from "./ScoreBadge";
import VerticalProgress from "./VerticalProgress";

type Props = {
  type: "сотрудник" | "отдел";
  score: number;
  refScore: number;
  from: string;
  to: string;
  onChangeFrom: (date: string) => void;
  onChangeTo: (date: string) => void;
  onCurrentMonth: () => void;
  onCurrentQuarter: () => void;
};

export default function StatsSection({
  type,
  score,
  refScore,
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onCurrentMonth,
  onCurrentQuarter,
}: Props) {
  return (
    <div style={{ padding: "1rem", border: "2px solid #ddd", borderRadius: "8px" }}>
    <div style={{ display: "flex", gap: "3rem", marginTop: "1rem" }}>
      {/* Левая часть: ввод, кнопки, текст */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
            С{" "}
            <input
              type="date"
              value={from}
              onChange={(e) => onChangeFrom(e.target.value)}
              style={{ marginRight: "2rem" }}
            />
            По{" "}
            <input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={onCurrentMonth}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              style={{ marginRight: "1rem" }}
            >
              Текущий месяц
            </button>
            <button
              onClick={onCurrentQuarter}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Текущий квартал
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            Статистика {type === "сотрудник" ? "сотрудника" : "отдела"}:
          </h3>
          <ScoreBadge value={score} refValue={refScore} />
        </div>
      </div>

      {/* Правая часть: вертикальный прогресс */}
      <div style={{ flex: 1.5, display: "flex", alignItems: "center" }}>
        <VerticalProgress value={score} refValue={refScore} />
      </div>
    </div>
    </div>
  );
}