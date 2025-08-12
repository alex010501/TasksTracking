import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { FieldRow, TextInput, ErrorText } from "../ui/Field";
import { updateEmployee } from "../../api";

type Employee = {
  id: number;
  name: string;
  position?: string | null;
  start_date: string; // YYYY-MM-DD
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  employee: Employee;
};

export default function EditEmployeeModal({ isOpen, onClose, onUpdated, employee }: Props) {
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position || "");
  const [startDate, setStartDate] = useState(employee.start_date || "");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!isOpen) return;
    setName(employee.name || "");
    setPosition(employee.position || "");
    setStartDate(employee.start_date || "");
    setError(undefined);
    setBusy(false);
  }, [isOpen, employee]);

  async function handleSave() {
    setError(undefined);
    if (!name.trim()) return setError("Укажите ФИО.");
    if (!position.trim()) return setError("Укажите должность.");
    if (!startDate) return setError("Укажите дату начала работы.");
    if (startDate > today) return setError("Дата начала не может быть в будущем.");

    setBusy(true);
    try {
      await updateEmployee(employee.id, {
        name: name.trim(),
        position: position.trim(),
        start_date: startDate, // api.ts нормализует при необходимости
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить изменения");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактирование сотрудника"
      footer={
        <button className="button green" onClick={handleSave} disabled={busy}>
          {busy ? "Сохранение…" : "Сохранить"}
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