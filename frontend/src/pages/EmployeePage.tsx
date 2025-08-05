import { useEffect, useState } from "react";
import EmployeeSelector from "../components/employee/EmployeeSelector";
import EmployeeStats from "../components/employee/EmployeeStats";
import EmployeeTasks from "../components/employee/EmployeeTasks";
import AddEmployeeModal from "../components/employee/AddEmployeeModal";
import EditEmployeeModal from "../components/employee/EditEmployeeModal";
import EmployeeStatus from "../components/employee/EmployeeStatus";
import {
  getAllEmployees,
  addEmployee,
  updateEmployee
} from "../api";
import type { Employee } from "../types";

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 2).toISOString().split("T")[0]
  const lastDay = new Date(year, month + 1, 1).toISOString().split("T")[0]
  const day = today.getDay(); // Sunday = 0
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const [statsPeriod, setStatsPeriod] = useState({ from: firstDay, to: lastDay});
  const [taskPeriod, setTaskPeriod] = useState({ from: monday.toISOString().split("T")[0], to: friday.toISOString().split("T")[0]});

  const fetchEmployees = async () => {
    const data = await getAllEmployees();
    setEmployees(data);
    if (data.length > 0 && employeeId === null) {
      setEmployeeId(data[0].id);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (data: {
    name: string;
    position: string;
    date_started: string;
  }) => {
    await addEmployee(data);
    await fetchEmployees();
    const newEmployee = (await getAllEmployees()).find((e: Employee) => e.name === data.name);
    setEmployeeId(newEmployee?.id || null);
  };

  const handleEdit = async (updatedData: Partial<Employee>) => {
    if (!employeeId) return;
    await updateEmployee(employeeId, updatedData);
    await fetchEmployees();
    setEditModalOpen(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>👤 Сотрудники</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 2 }}>
          <EmployeeSelector selectedId={employeeId} onSelect={setEmployeeId} />

          {employeeId && (
            <>
              {/* Информация о сотруднике */}
              <div style={{ marginTop: "0.5rem", marginBottom: "0.2rem", padding: "0.1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
                <p><strong>&#160;&#160;&#160;&#160;Должность:</strong> {employees.find(e => e.id === employeeId)?.position}</p>
                <p><strong>&#160;&#160;&#160;&#160;Статус:</strong> <EmployeeStatus status={employees.find(e => e.id === employeeId)?.status} status_start={employees.find(e => e.id === employeeId)?.status_start} status_end={employees.find(e => e.id === employeeId)?.status_end} /></p>                
              </div>
              <EmployeeStats employeeId={employeeId} period={statsPeriod} />
              <EmployeeTasks employeeId={employeeId} period={taskPeriod} />
            </>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>          
          <button
            onClick={() => setAddModalOpen(true)}
            disabled={addModalOpen}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Добавить сотрудника
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            disabled={!employeeId}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Изменить данные сотрудника
          </button>

          <AddEmployeeModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSubmit={handleAdd}
          />

          {employeeId && (
            <EditEmployeeModal
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              onSubmit={handleEdit}
              employee={employees.find((e) => e.id === employeeId)!}
            />
          )}
        </div>
      </div>
    </div>
  );
}
