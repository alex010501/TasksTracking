import { useEffect, useState } from "react";
import { createTask } from "../../api";
import EmployeeMultiSelect from "../EmployeeMultiSelect";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId?: number | null;
  stageId?: number | null;
};

export default function AddTaskModal({
  isOpen,
  onClose,
  onCreated,
  projectId = null,
  stageId = null,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 4>(1);
  const [executorIds, setExecutorIds] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setDeadline("");
      setDifficulty(1);
      setExecutorIds([]);
      setError("");
      setSaving(false);
    }
  }, [isOpen]);


  const handleCreate = async () => {
    setError("");

    if (!name.trim()) { alert("Укажите название."); return; }
    if (!deadline) { alert("Укажите дедлайн."); return; }
    if (new Date(deadline) < new Date(todayStr)) { alert("Дедлайн не может быть в прошлом."); return; }
    if (!projectId || !stageId) { alert("Не найден проект/этап для задачи."); return; }
    if (executorIds.length === 0) { alert("Выберите хотя бы одного исполнителя."); return; }

    const uniqueExecutorIds = Array.from(new Set(executorIds));

    // тип строго из сигнатуры API
    const payload: Parameters<typeof createTask>[0] = {
      name,
      description,
      deadline,
      difficulty,
      executor_ids: uniqueExecutorIds,
      project_id: Number(projectId),
      stage_id: Number(stageId),
    };

    try {
      setSaving(true);
      await createTask(payload);
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось создать задачу");
    } finally {
      setSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "700px",
        }}
      >
        <h2>Создание задачи</h2>

        {(projectId || stageId) && (
          <div style={{ marginBottom: "1rem", fontStyle: "italic", color: "#555" }}>
            {projectId && <div>Проект ID: {projectId}</div>}
            {stageId && <div>Этап ID: {stageId}</div>}
          </div>
        )}

        {error && (
          <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>{error}</div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {[
            ["Название:", <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />],
            ["Описание:", <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }} rows={3} />],
            ["Дедлайн:", <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={todayStr} style={{ width: "100%" }} />],
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

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose} className="button red" disabled={saving}>
            Отмена
          </button>
          <button onClick={handleCreate} className="button green" disabled={saving}>
            {saving ? "Создаю…" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}