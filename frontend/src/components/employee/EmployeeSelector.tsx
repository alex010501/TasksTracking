import { useEffect, useState } from "react";
import { getAllEmployees } from "../../api";
import type { Employee } from "../../types";

type Props = {
  selectedId: number;
  onSelect: (id: number) => void;
};

export default function EmployeeSelector({ selectedId, onSelect }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(undefined);
    getAllEmployees()
      .then((list) => { if (alive) setEmployees(Array.isArray(list) ? list : []); })
      .catch((e) => { if (alive) setErr(e?.message || "Не удалось загрузить сотрудников"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
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
        disabled={loading}
      >
        <option value={0} disabled={loading}>– {loading ? "загрузка…" : "не выбран"} –</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>
      {err && <div style={{ color: "#c0392b", marginTop: 6 }}>{err}</div>}
    </div>
  );
}