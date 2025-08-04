import { useEffect, useState } from "react"

type Employee = {
  id: number
  name: string
}

interface Props {
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function EmployeeSelector({ selectedId, onSelect }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    fetch("http://127.0.0.1:8080/employees")
      .then(res => res.json())
      .then(data => setEmployees(data))
  }, [])

  return (
    <select value={selectedId ?? ""} onChange={e => onSelect(Number(e.target.value))}>
      <option value="">Выберите сотрудника</option>
      {employees.map(emp => (
        <option key={emp.id} value={emp.id}>{emp.name}</option>
      ))}
    </select>
  )
}
