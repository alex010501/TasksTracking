import { useEffect, useState } from "react";
import { getAllEmployees } from "../../api";
import type { Employee } from "../../types";

type Props = {
  selectedId: number;
  onSelect: (id: number) => void;
};

export default function EmployeeSelector({ selectedId, onSelect }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
  }, []);

  return (
    <div style={{ margin: "1rem 0" }}>
      <label style={{ fontWeight: "bold", marginRight: "1rem" }}>
        Выберите сотрудника:
      </label>
      <select
        value={selectedId || 0}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="border px-2 py-1 rounded"
      >
        <option value={0}>– не выбран –</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>
    </div>
  );
}