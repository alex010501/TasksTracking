export const StatusLabel = ({ status }: { status: "Выполнено" | "В работе" | "Просрочено" }) => {
  const color = status === "Выполнено" ? "green" : status === "Просрочено" ? "red" : "orange";

  return (
    <span style={{ color, fontWeight: "bold" }}>
      {status}
    </span>
  );
};