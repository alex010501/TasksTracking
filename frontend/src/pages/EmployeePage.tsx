import { useState } from "react";
import EmployeeSelector from "../components/EmployeeSelector";
import EmployeeStats from "../components/EmployeeStats";
import EmployeeTasks from "../components/EmployeeTasks";
import AddEmployeeModal from "../components/AddEmployeeModal";

type Employee = {
  id: number;
  name: string;
  position: string;
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState({ from: "2025-08-01", to: "2025-08-31" });
  const [taskPeriod, setTaskPeriod] = useState({ from: "2025-09-01", to: "2025-09-30" });

  const fetchEmployees = async () => {
    const res = await fetch('http://localhost:8080/employees/all');
    const data = await res.json();
    setEmployees(data);
    if (data.length > 0 && employeeId === null) {
      setEmployeeId(data[0].id);
    }
  };

  const handleAdd = async (data: {
    name: string;
    position: string;
    date_started: string;
  }) => {
    await fetch('http://localhost:8080/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchEmployees();
  };

  // useEffect(() => {
  //   fetchEmployees();
  // }, []);

  return (
    // <div className="p-6 space-y-6">
    <div style={{ padding: "2rem" }}>
      <div className="flex justify-between items-center">
        <h2>👤 Сотрудники</h2>
        <div style={{ display: "flex", gap: "3rem" }}>
          {/* Projects */}
          <div style={{ flex: 1 }}>
            <EmployeeSelector selectedId={employeeId} onSelect={setEmployeeId} />
            {employeeId && (
              <>
                <EmployeeStats employeeId={employeeId} period={statsPeriod} />
                <EmployeeTasks employeeId={employeeId} period={taskPeriod} />
              </>
            )}
          </div>
  
          {/* Employees */}
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Добавить сотрудника
            </button>

            {/* Модальное окно */}
            <AddEmployeeModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSubmit={handleAdd}
            />
          </div>
        </div>        
      </div>
    </div>
  );
}
