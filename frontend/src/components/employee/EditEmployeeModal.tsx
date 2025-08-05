import React, { useState, useEffect } from "react";
import type { Employee } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Employee>) => void;
  employee: Employee;
};

export default function EditEmployeeModal({ isOpen, onClose, onSubmit, employee }: Props) {
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [startDate, setStartDate] = useState(employee.start_date);
  const [vacationStart, setVacationStart] = useState(employee.status_start || "");
  const [vacationEnd, setVacationEnd] = useState(employee.status_end || "");
  const [dismissalDate, setDismissalDate] = useState("");

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPosition(employee.position);
      setStartDate(employee.start_date);
      setVacationStart(employee.status === "в отпуске" ? employee.status_start || "" : "");
      setVacationEnd(employee.status === "в отпуске" ? employee.status_end || "" : "");
      setDismissalDate(employee.status === "уволен" ? employee.status_start || "" : "");
    }
  }, [employee]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Employee> = {
      name,
      position,
      start_date: startDate,
    };

    if (vacationStart && vacationEnd) {
      payload.status = "в отпуске";
      payload.status_start = vacationStart;
      payload.status_end = vacationEnd;
    }

    if (dismissalDate) {
      payload.status = "уволен";
      payload.status_start = dismissalDate;
    }

    onSubmit(payload);
  };

  const handleRestore = () => {
    const payload: Partial<Employee> = {
      status: "работает",
      status_start: null,
      status_end: null,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Редактировать сотрудника</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ФИО"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Должность"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <hr />
          <h4 className="font-semibold">Отправить в отпуск</h4>
          <div className="flex gap-2">
            <input
              type="date"
              value={vacationStart}
              onChange={(e) => setVacationStart(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="date"
              value={vacationEnd}
              onChange={(e) => setVacationEnd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <hr />
          <h4 className="font-semibold">Уволить</h4>
          <input
            type="date"
            value={dismissalDate}
            onChange={(e) => setDismissalDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <div className="flex justify-between gap-2 pt-4">
            {employee.status !== "работает" && (
              <button
                type="button"
                onClick={handleRestore}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Снова в работу
              </button>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                Отмена
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}