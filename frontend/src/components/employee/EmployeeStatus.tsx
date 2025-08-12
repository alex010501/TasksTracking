import { useEffect, useState } from "react";
import type { Employee } from "../../types";
import { getEmployeeById } from "../../api";
import "../../styles/status.css";

type Props = { employeeId: number };

export default function EmployeeStatus({ employeeId }: Props) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    if (!employeeId) return;
    let alive = true;
    setErr(undefined);
    getEmployeeById(employeeId)
      .then((e) => { if (alive) setEmployee(e || null); })
      .catch((e) => { if (alive) { setEmployee(null); setErr(e?.message || "Не удалось загрузить сотрудника"); } });
    return () => { alive = false; };
  }, [employeeId]);

  if (!employee) return null;

  const { status, status_start, status_end, position } = employee;
  if (!status) return null;

  let className = "status";
  let text = "";

  switch (status) {
    case "работает":
      className += " working";
      text = "Работает";
      break;
    case "в отпуске":
      className += " vacation";
      text = "В отпуске";
      if (status_start && status_end) text += ` с ${formatDate(status_start)} по ${formatDate(status_end)}`;
      break;
    case "уволен":
      className += " fired";
      text = "Уволен";
      if (status_start) text += ` с ${formatDate(status_start)}`;
      break;
    default:
      text = status;
  }

  return (
    <div style={{ marginBottom: "0.2rem", padding: "0.1rem", border: "2px solid #ddd", borderRadius: 8 }}>
      <p><strong style={{ marginLeft: 8 }}>Должность:</strong> {position || "—"}</p>
      <p><strong style={{ marginLeft: 8 }}>Статус:</strong> <span className={className}>{text}</span></p>
      {err && <div style={{ color: "#c0392b" }}>{err}</div>}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}