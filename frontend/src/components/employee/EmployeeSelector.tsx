import { useEffect, useState } from "react";
import { getAllEmployees } from "../../api";

type Employee = {
  id: number;
  name: string;
};

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function EmployeeSelector({ selectedId, onSelect }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllEmployees();
      setEmployees(data);
    }
    fetchData();
  }, []);

  return (
    <select value={selectedId ?? ""} onChange={(e) => onSelect(Number(e.target.value))}>
      {/* <option value="">Выберите сотрудника</option> */}
      {employees.map((emp) => (
        <option key={emp.id} value={emp.id}>
          {emp.name}
        </option>
      ))}
    </select>
  );
}
