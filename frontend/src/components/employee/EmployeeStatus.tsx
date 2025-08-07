import React, { useEffect, useState } from "react";
import type { Employee } from "../../types";
import { getEmployeeById } from "../../api";
import "../../styles/status.css";

type Props = {
  employeeId: number;
};

export default function EmployeeStatus({ employeeId }: Props) {
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    getEmployeeById(employeeId).then(setEmployee).catch(() => {
      setEmployee(null);
    });
  }, [employeeId]);

  if (!employee || !employee.status) return null;

  const { status, status_start, status_end, position } = employee;

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
      if (status_start && status_end) {
        text += ` с ${formatDate(status_start)} по ${formatDate(status_end)}`;
      }
      break;
    case "уволен":
      className += " fired";
      text = "Уволен";
      if (status_start) {
        text += ` с ${formatDate(status_start)}`;
      }
      break;
  }

  return <div style={{ marginBottom: "0.2rem", padding: "0.1rem", border: "2px solid #ddd", borderRadius: "8px" }}>
            <p><strong>&#160;&#160;&#160;&#160;Должность:</strong> {position}</p>
            <p><strong>&#160;&#160;&#160;&#160;Статус:</strong> <span className={className}>{text}</span></p>                
          </div>
  
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}