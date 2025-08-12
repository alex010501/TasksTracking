import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { FieldRow, TextInput, TextArea, Select, ErrorText } from "../ui/Field";
import EmployeeMultiSelect from "../EmployeeMultiSelect";
import { createTask } from "../../api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId?: number | null;
  stageId?: number | null;
};

export default function AddTaskModal({ isOpen, onClose, onCreated, projectId = null, stageId = null }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 4>(1);
  const [executors, setExecutors] = useState<number[]>([]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!isOpen) return;
    setName(""); setDescription(""); setDeadline(""); setDifficulty(1); setExecutors([]); setError(undefined);
  }, [isOpen]);

  async function handleCreate() {
    setError(undefined);

    if (!name.trim()) return setError("Укажите название задачи.");
    if (!deadline) return setError("Укажите дедлайн.");
    if (deadline < today) return setError("Дедлайн не может быть раньше сегодняшней даты.");
    if (executors.length === 0) return setError("Выберите хотя бы одного исполнителя.");

    setBusy(true);
    try {
      await createTask({
        name: name.trim(),
        description: description.trim(),
        deadline,
        difficulty,
        executor_ids: executors,
        project_id: projectId ?? undefined,
        stage_id: stageId ?? undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось создать задачу");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создание задачи" width={720}
      footer={<button className="button green" onClick={handleCreate} disabled={busy}>{busy ? "Создание…" : "Создать"}</button>}
    >
      <ErrorText text={error} />

      {(projectId || stageId) && (
        <div style={{ marginBottom: 8, color: "#6b7280", fontStyle: "italic" }}>
          {projectId && <>Проект ID: {projectId} </>}
          {stageId && <>• Этап ID: {stageId}</>}
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        <FieldRow label="Название:"><TextInput value={name} onChange={e => setName(e.target.value)} /></FieldRow>
        <FieldRow label="Описание:"><TextArea rows={3} value={description} onChange={e => setDescription(e.target.value)} /></FieldRow>
        <FieldRow label="Дедлайн:"><TextInput type="date" min={today} value={deadline} onChange={e => setDeadline(e.target.value)} /></FieldRow>
        <FieldRow label="Сложность:">
          <Select value={difficulty} onChange={e => setDifficulty(Number(e.target.value) as 1 | 2 | 4)}>
            <option value={1}>1 — лёгкая</option>
            <option value={2}>2 — средняя</option>
            <option value={4}>4 — высокая</option>
          </Select>
        </FieldRow>
        <FieldRow label="Исполнители:">
          <EmployeeMultiSelect value={executors} onChange={setExecutors} />
        </FieldRow>
      </div>
    </Modal>
  );
}