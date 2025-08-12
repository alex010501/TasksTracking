import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { FieldRow, TextInput, TextArea, Select, ErrorText } from "../ui/Field";
import EmployeeMultiSelect from "../EmployeeMultiSelect";
import { updateTask } from "../../api";
import type { Task } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  task: Task;
};

export default function EditTaskModal({ isOpen, onClose, onUpdated, task }: Props) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState((task as any).description || "");
  const [createdDate, setCreatedDate] = useState(task.created_date);
  const [deadline, setDeadline] = useState(task.deadline);
  const [difficulty, setDifficulty] = useState<1 | 2 | 4>(task.difficulty);
  const [executors, setExecutors] = useState<number[]>(task.executor_ids || []);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const minDeadline = useMemo(() => createdDate || new Date().toISOString().split("T")[0], [createdDate]);

  useEffect(() => {
    if (!isOpen) return;
    setName(task.name);
    setDescription((task as any).description || "");
    setCreatedDate(task.created_date);
    setDeadline(task.deadline);
    setDifficulty(task.difficulty);
    setExecutors(task.executor_ids || []);
    setError(undefined);
  }, [isOpen, task]);

  async function handleSave() {
    setError(undefined);
    if (!name.trim()) return setError("Укажите название задачи.");
    if (!deadline) return setError("Укажите дедлайн.");
    if (deadline < (createdDate || "")) return setError("Дедлайн не может быть раньше даты постановки.");
    if (executors.length === 0) return setError("Выберите хотя бы одного исполнителя.");

    setBusy(true);
    try {
      await updateTask(task.id, {
        name: name.trim(),
        description: description.trim(),
        created_date: createdDate,
        deadline,
        difficulty,
        executor_ids: executors,
        project_id: task.project_id ?? null,
        stage_id: task.stage_id ?? null,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить задачу");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактирование задачи" width={720}
      footer={<button className="button green" onClick={handleSave} disabled={busy}>{busy ? "Сохранение…" : "Сохранить"}</button>}
    >
      <ErrorText text={error} />

      <div style={{ display: "grid", gap: 12 }}>
        <FieldRow label="Название:"><TextInput value={name} onChange={e => setName(e.target.value)} /></FieldRow>
        <FieldRow label="Описание:"><TextArea rows={3} value={description} onChange={e => setDescription(e.target.value)} /></FieldRow>
        <FieldRow label="Дата постановки:"><TextInput type="date" value={createdDate} onChange={e => setCreatedDate(e.target.value)} /></FieldRow>
        <FieldRow label="Дедлайн:"><TextInput type="date" min={minDeadline} value={deadline} onChange={e => setDeadline(e.target.value)} /></FieldRow>
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