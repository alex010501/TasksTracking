import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { FieldRow, TextInput, ErrorText } from "../ui/Field";
import { addEmployee } from "../../api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddEmployeeModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setPosition("");
    setStartDate("");
    setError(undefined);
    setBusy(false);
  }, [isOpen]);

  async function handleCreate() {
    setError(undefined);
    if (!name.trim()) return setError("Укажите ФИО.");
    if (!position.trim()) return setError("Укажите должность.");
    if (!startDate) return setError("Укажите дату начала работы.");
    if (startDate > today) return setError("Дата начала не может быть в будущем.");

    setBusy(true);
    try {
      await addEmployee({ name: name.trim(), position: position.trim(), start_date: startDate });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось добавить сотрудника");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавление сотрудника"
      footer={
        <button className="button green" onClick={handleCreate} disabled={busy}>
          {busy ? "Добавление…" : "Добавить"}
        </button>
      }
    >
      <ErrorText text={error} />
      <div style={{ display: "grid", gap: 12 }}>
        <FieldRow label="ФИО:">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FieldRow>
        <FieldRow label="Должность:">
          <TextInput value={position} onChange={(e) => setPosition(e.target.value)} />
        </FieldRow>
        <FieldRow label="Дата начала:">
          <TextInput type="date" max={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FieldRow>
      </div>
    </Modal>
  );
}