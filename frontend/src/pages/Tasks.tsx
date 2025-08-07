import { useEffect, useState } from "react";
import type { Task, Employee } from "../types";
import {
  getUnassignedTasks,
  getAllEmployees,
  completeTask,
} from "../api";
import TaskCard from "../components/tasks/TaskCard";
import AddTaskModal from "../components/modals/AddTaskModal";
import EditTaskModal from "../components/modals/EditTaskModal";
import FilterBlock from "../components/FilterBlock";

import "../styles/styles.css";
import "../styles/buttons.css";

export default function TasksPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("все");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const today = new Date();
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    2
  ).toISOString().split("T")[0];
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  ).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(startOfMonth);
  const [toDate, setToDate] = useState(endOfMonth);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const loadTasks = async () => {
    const res = await getUnassignedTasks({
      query: query.trim() || undefined,
      from_date: fromDate,
      to_date: toDate,
      status: statusFilter !== "все" ? statusFilter : undefined,
    });

    const cleanedTasks = res.map((task: any) => ({
      ...task,
      executor_ids: typeof task.executor_ids === "string"
        ? task.executor_ids.split(",").map((id: string) => Number(id.trim()))
        : Array.isArray(task.executor_ids)
        ? task.executor_ids
        : [],
    }));

    setTasks(cleanedTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [query, statusFilter, fromDate, toDate]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
  }, []);

  const handleCurrentWeek = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    setFromDate(monday.toISOString().split("T")[0]);
    setToDate(friday.toISOString().split("T")[0]);
  };

  const handleCurrentMonth = () => {
    setFromDate(startOfMonth);
    setToDate(endOfMonth);
  };

  return (
    <div className="page-container">
      <h2 className="page-header">🧩 Задачи</h2>
      <div className="page-content-80-20">
        <div className="left">
          <FilterBlock
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onSetPeriod1={handleCurrentWeek}
            onSetPeriod2={handleCurrentMonth}
            period1Label="Текущая неделя"
            period2Label="Текущий месяц"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTaskId === task.id}
                onSelect={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                onUpdated={loadTasks}
                onEdit={() => {
                  setSelectedTaskId(task.id);
                  setShowEditModal(true);
                }}
                employees={employees}
              />
            ))}
          </div>
        </div>

        <div className="right" style={{ position: "sticky", top: "2rem" }}>
          <button className="button green" onClick={() => setShowAddModal(true)}>
            + Создать задачу
          </button>

          <AddTaskModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onCreated={() => {
              setShowAddModal(false);
              loadTasks();
            }}
          />

          {selectedTask && (
            <EditTaskModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              task={selectedTask}
              onUpdated={() => {
                setShowEditModal(false);
                loadTasks();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}