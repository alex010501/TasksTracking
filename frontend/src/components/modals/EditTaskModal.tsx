import { useEffect, useState } from "react";
import { updateTask } from "../../api";
import type { Task } from "../../types";
import EmployeeMultiSelect from "../EmployeeMultiSelect";
import { deleteTask } from "../../api";
import PasswordPromptModal from "./PasswordPromptModal";

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
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [askPass, setAskPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(task.name);
      setDescription((task as any).description || "");
      setCreatedDate(task.created_date);
      setDeadline(task.deadline);
      setDifficulty(task.difficulty);
      setExecutorIds(Array.isArray(task.executor_ids) ? task.executor_ids : []);
      setError("");
      setSaving(false);
    }
  }, [isOpen, task]);

  const handleUpdate = async () => {
    setError("");

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

    const payload: Partial<Task> = {
      name,
      description,
      created_date: createdDate,
      deadline,
      difficulty,
      executor_ids: Array.from(new Set(executorIds)),
      project_id: task.project_id ?? null,
      stage_id: task.stage_id ?? null,
    };

    try {
      setSaving(true);
      await updateTask(task.id, payload);
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось обновить задачу");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", width: "700px" }}>
        <h2>Редактирование задачи</h2>

        {error && (
          <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>{error}</div>
        )}

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
            ["Исполнители:", <EmployeeMultiSelect value={executorIds} onChange={setExecutorIds} />],
          ].map(([label, field], idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "140px", fontWeight: "bold" }}>{label}</div>
              <div style={{ flexGrow: 1 }}>{field}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} className="button red" disabled={saving}>Отмена</button>
          <button className="button yellow" onClick={() => setAskPass(true)}>Удалить задачу</button>
          <button onClick={handleUpdate} className="button green" disabled={saving}>
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>

        <PasswordPromptModal
          isOpen={askPass}
          title="Удалить задачу?"
          confirmLabel="Удалить"
          onClose={() => setAskPass(false)}
          onConfirm={async (pwd) => {
            await deleteTask(task.id, pwd);
            onUpdated();   // рефреш списка
            onClose();     // закрыть модалку редактирования
          }}
        />

      </div>
    </div>
  );
}