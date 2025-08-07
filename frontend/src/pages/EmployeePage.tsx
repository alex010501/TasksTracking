import React, { useEffect, useState, useMemo } from "react";
import EmployeeSelector from "../components/employee/EmployeeSelector";
import EmployeeStatus from "../components/employee/EmployeeStatus";
import StatsSection from "../components/stats/StatsSection";
import EmployeeTasksSection from "../components/employee/EmployeeTasks";
import AddEmployeeModal from "../components/modals/AddEmployeeModal";
import EditEmployeeModal from "../components/modals/EditEmployeeModal";
import { getEmployeeById, getEmployeeScore } from "../api";
import type { Employee } from "../types";

export default function EmployeePage() {
  const empK = 0.5;  // баллов в день на сотрудника

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const [statFrom, setStatFrom] = useState(new Date(year, month, 2).toISOString().split("T")[0]);
  const [statTo, setStatTo] = useState(new Date(year, month + 1, 1).toISOString().split("T")[0]);
  const [score, setScore] = useState(0);
  // const [refScore, setRefScore] = useState(15);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (selectedEmployeeId > 0) {
      loadEmployeeData(selectedEmployeeId);
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, statFrom, statTo]);

  const loadEmployeeData = async (id: number) => {
    try {
      const employee = await getEmployeeById(id);
      const {score} = await getEmployeeScore(id, statFrom, statTo);
      setSelectedEmployee(employee);
      setScore(score);
    } catch (err) {
      console.error("Ошибка загрузки данных сотрудника:", err);
      setSelectedEmployee(null);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEmployeeId(id);
    setSelectedEmployee(null);
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    setStatFrom(new Date(y, m, 2).toISOString().split("T")[0]);
    setStatTo(new Date(y, m + 1, 1).toISOString().split("T")[0]);
    // setRefScore(15);
  };

  const handleCurrentQuarter = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const qStartMonth = Math.floor(m / 3) * 3;
    setStatFrom(new Date(y, qStartMonth, 2).toISOString().split("T")[0]);
    setStatTo(new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0]);
    // setRefScore(45);
  };

  const refScore = useMemo(() => {
    const d1 = new Date(statFrom);
    const d2 = new Date(statTo);
    const days = Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round(days * empK);
  }, [statFrom, statTo]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>👤 Сотрудники</h2>

      <EmployeeSelector selectedId={selectedEmployeeId} onSelect={handleSelect} />

      <div className="page-content-80-20">
        <div className="left">
          {selectedEmployee && (
            <>
              <EmployeeStatus employeeId={selectedEmployeeId} />

              <StatsSection
                from={statFrom}
                to={statTo}
                score={score}
                refScore={refScore}
                onChangeFrom={setStatFrom}
                onChangeTo={setStatTo}
                onCurrentMonth={handleCurrentMonth}
                onCurrentQuarter={handleCurrentQuarter}
                type="сотрудник"
              />

              <EmployeeTasksSection employeeId={selectedEmployeeId} />
            </>
          )}
        </div>

        <div className="right" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button className="button green" onClick={() => setShowAddModal(true)}>
            + Добавить сотрудника
          </button>

          {selectedEmployee && (
            <button className="button blue" onClick={() => setShowEditModal(true)}>
              Изменить данные сотрудника
            </button>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={() => window.location.reload()}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => window.location.reload()}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}