type Props = {
  employeeId: number;
  period: { from: string; to: string };
};

export default function EmployeeStats({ employeeId, period }: Props) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/employees/${employeeId}/score?from_date=${period.from}&to_date=${period.to}`)
      .then(res => res.json())
      .then(data => setScore(data.score));
  }, [employeeId, period]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Эффективность за период</h3>
      <p className="text-2xl">{score ?? "Загрузка..."}</p>
    </div>
  );
}
