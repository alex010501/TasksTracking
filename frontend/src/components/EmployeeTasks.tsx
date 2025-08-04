import { useEffect, useState } from "react";

type Task = {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  project_name: string;
  created_date: string;
  deadline: string;
  status: string;
};

type Props = {
  employeeId: number;
  period: { from: string; to: string };
};

function difficultyText(n: number) {
  return n === 1 ? "Легко" : n === 2 ? "Средне" : "Сложно";
}

export default function EmployeeTasks({ employeeId, period }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch(`/employees/${employeeId}/tasks?from_date=${period.from}&to_date=${period.to}`)
      .then(res => res.json())
      .then(setTasks);
  }, [employeeId, period]);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">Задачи на другой период</h3>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Задача</th>
            <th className="border p-2">Описание</th>
            <th className="border p-2">Сложность</th>
            <th className="border p-2">Проект</th>
            <th className="border p-2">Постановка</th>
            <th className="border p-2">Дедлайн</th>
            <th className="border p-2">Статус</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td className="border p-2">{t.name}</td>
              <td className="border p-2">{t.description}</td>
              <td className="border p-2">{difficultyText(t.difficulty)}</td>
              <td className="border p-2">{t.project_name}</td>
              <td className="border p-2">{t.created_date}</td>
              <td className="border p-2">{t.deadline}</td>
              <td className="border p-2">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
