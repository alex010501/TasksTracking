import type { Employee } from "../../types";
import "./status.css";

export default function EmployeeStatus({status, status_start, status_end}: Employee) {
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

  return <span className={className}>{text}</span>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}
