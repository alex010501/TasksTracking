import { useEffect, useState } from "react";
import { updateEmployee } from "../../api";
import type { Employee } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  employee: Employee;
};

export default function EditEmployeeModal({ isOpen, onClose, onUpdated, employee }: Props) {
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position || "");
  const [startDate, setStartDate] = useState(employee.start_date);
  const [status, setStatus] = useState(employee.status);
  const [statusStart, setStatusStart] = useState(employee.status_start || "");
  const [statusEnd, setStatusEnd] = useState(employee.status_end || "");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(employee.name);
      setPosition(employee.position || "");
      setStartDate(employee.start_date);
      setStatus(employee.status);
      setStatusStart(employee.status_start || "");
      setStatusEnd(employee.status_end || "");
      setError("");
      setSaving(false);
    }
  }, [isOpen, employee]);

  const handleUpdate = async () => {
    setError("");
    if (!name.trim() || !position.trim() || !startDate) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    if ((status === "в отпуске" || status === "уволен") && (!statusStart || !statusEnd)) {
      alert("Укажите даты начала и окончания статуса.");
      return;
    }

    try {
      setSaving(true);
      await updateEmployee(employee.id, {
        name,
        position,
        start_date: startDate,
        status,
        status_start: status === "работает" ? null : statusStart,
        status_end: status === "работает" ? null : statusEnd,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось обновить данные сотрудника");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "600px",
        }}
      >
        <h2>Редактирование сотрудника</h2>

        {error && (
          <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>ФИО:</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Должность:</div>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Дата начала:</div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flexGrow: 1 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "160px", fontWeight: "bold" }}>Статус:</div>
            <select value={status} onChange={(e) => setStatus(e.target.value as Employee["status"])} style={{ flexGrow: 1 }}>
              <option value="работает">работает</option>
              <option value="в отпуске">в отпуске</option>
              <option value="уволен">уволен</option>
            </select>
          </div>

          {(status === "в отпуске" || status === "уволен") && (
            <>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "160px", fontWeight: "bold" }}>С даты:</div>
                <input type="date" value={statusStart} onChange={(e) => setStatusStart(e.target.value)} style={{ flexGrow: 1 }} />
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "160px", fontWeight: "bold" }}>По дату:</div>
                <input type="date" value={statusEnd} onChange={(e) => setStatusEnd(e.target.value)} style={{ flexGrow: 1 }} />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button className="button red" onClick={onClose} disabled={saving}>Отмена</button>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="button green" onClick={handleUpdate} disabled={saving}>
              {saving ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}