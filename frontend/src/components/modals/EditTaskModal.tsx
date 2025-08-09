import { useEffect, useState } from "react";
import { getAllEmployees, updateTask } from "../../api";
import type { Task, Employee } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  task: Task;
};

export default function EditTaskModal({ isOpen, onClose, onUpdated, task }: Props) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState("");
  const [createdDate, setCreatedDate] = useState(task.created_date);
  const [deadline, setDeadline] = useState(task.deadline);
  const [difficulty, setDifficulty] = useState<1 | 2 | 4>(task.difficulty);
  const [executorIds, setExecutorIds] = useState<number[]>([]);
  const [selectedExecutorId, setSelectedExecutorId] = useState<number | "">("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAllEmployees().then(setEmployees);
      setName(task.name);
      setDescription((task as any).description || ""); // на случай если поле необязательное
      setCreatedDate(task.created_date);
      setDeadline(task.deadline);
      setDifficulty(task.difficulty);
      setExecutorIds(task.executor_ids);
      setSelectedExecutorId("");
    }
  }, [isOpen, task]);

  const addExecutor = () => {
    if (selectedExecutorId !== "" && !executorIds.includes(selectedExecutorId)) {
      setExecutorIds([...executorIds, selectedExecutorId]);
      setSelectedExecutorId("");
    }
  };

  const removeExecutor = (id: number) => {
    setExecutorIds(executorIds.filter((eid) => eid !== id));
  };

  const handleUpdate = async () => {
    if (!deadline) {
      alert("Необходимо указать дедлайн.");
      return;
    }

    if (new Date(deadline) < new Date(createdDate)) {
      alert("Дедлайн не может быть раньше даты постановки.");
      return;
    }

    if (executorIds.length === 0) {
      alert("Необходимо выбрать хотя бы одного исполнителя.");
      return;
    }

    const payload = {
      name,
      description,
      created_date: createdDate,
      deadline,
      difficulty,
      executor_ids: executorIds,
      project_id: task.project_id ?? null,
      stage_id: task.stage_id ?? null,
    };

    await updateTask(task.id, payload);
    onUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", width: "700px" }}>
        <h2>Редактирование задачи</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          {[
            ["Название:", <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />],
            ["Описание:", <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }} rows={3} />],
            ["Дата постановки:", <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} style={{ width: "100%" }} />],
            ["Дедлайн:", <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: "100%" }} />],
            ["Сложность:", (
              <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 4)} style={{ width: "100%" }}>
                <option value={1}>1 – лёгкая</option>
                <option value={2}>2 – средняя</option>
                <option value={4}>4 – высокая</option>
              </select>
            )],
            ["Исполнители:", (
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <select value={selectedExecutorId} onChange={(e) => setSelectedExecutorId(Number(e.target.value))} style={{ flexGrow: 1 }}>
                    <option value="">Выберите исполнителя</option>
                    {employees
                      .filter((emp) => !executorIds.includes(emp.id))
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                  </select>
                  <button onClick={addExecutor}>+</button>
                </div>
                <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                  {executorIds.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return (
                      <li key={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        • {emp?.name}
                        <button
                          onClick={() => removeExecutor(id)}
                          className="button red"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )],
          ].map(([label, field], idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "140px", fontWeight: "bold" }}>{label}</div>
              <div style={{ flexGrow: 1 }}>{field}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} className="button red">
            Отмена
          </button>
          <button onClick={handleUpdate} className="button green">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}