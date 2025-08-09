type Props = {
  query: string;
  onQueryChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onSetPeriod1: () => void;
  onSetPeriod2: () => void;
  period1Label: string;
  period2Label: string;
};

export default function FilterBlock({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSetPeriod1,
  onSetPeriod2,
  period1Label,
  period2Label,
}: Props) {
  return (
    <div style={{ padding: "0.75rem", border: "2px solid #ddd", borderRadius: "8px", marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Поиск:</label>
        <input
          type="text"
          placeholder="Введите название"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{ width: "98%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Статус:</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "150px" }}
          >
            <option value="все">Все</option>
            <option value="в работе">В работе</option>
            <option value="выполнено">Выполнено</option>
            <option value="просрочено">Просрочено</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>С:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>По:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
          <button onClick={onSetPeriod1}>{period1Label}</button>
          <button onClick={onSetPeriod2}>{period2Label}</button>
        </div>
      </div>
    </div>
  );
}