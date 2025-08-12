import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { FieldRow, TextInput, ErrorText } from "../ui/Field";
import { updateProject } from "../../api";

type Project = {
  id: number;
  name: string;
  deadline?: string | null; // YYYY-MM-DD | null
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  project: Project;
};

export default function EditProjectModal({ isOpen, onClose, onUpdated, project }: Props) {
  const [name, setName] = useState(project.name || "");
  const [deadline, setDeadline] = useState(project.deadline || "");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!isOpen) return;
    setName(project.name || "");
    setDeadline(project.deadline || "");
    setError(undefined);
    setBusy(false);
  }, [isOpen, project]);

  async function handleSave() {
    setError(undefined);
    if (!name.trim()) return setError("Укажите название проекта.");
    if (deadline && deadline < today) return setError("Дедлайн проекта не может быть в прошлом.");

    setBusy(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        deadline: deadline || null,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить проект");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактирование проекта"
      width={720}
      footer={
        <button className="button green" onClick={handleSave} disabled={busy}>
          {busy ? "Сохранение…" : "Сохранить"}
        </button>
      }
    >
      <ErrorText text={error} />
      <div style={{ display: "grid", gap: 12 }}>
        <FieldRow label="Название:">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FieldRow>
        <FieldRow label="Дедлайн:">
          <TextInput type="date" min={today} value={deadline || ""} onChange={(e) => setDeadline(e.target.value)} />
        </FieldRow>
      </div>
    </Modal>
  );
}