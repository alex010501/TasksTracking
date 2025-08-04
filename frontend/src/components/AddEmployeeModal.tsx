import React, { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; position: string; date_started: string }) => void;
};

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [dateStarted, setDateStarted] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, position, date_started: dateStarted });
    setName('');
    setPosition('');
    setDateStarted('');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Добавить сотрудника</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ФИО"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Должность"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={dateStarted}
            onChange={(e) => setDateStarted(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
