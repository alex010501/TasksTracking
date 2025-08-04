export const StatusLabel = ({ status }: { status: "Выполнен" | "В работе" }) => {
  const color = status === "Выполнен" ? "green" : "orange";

  return (
    <span style={{ color, fontWeight: "bold" }}>
      {status}
    </span>
  );
};
