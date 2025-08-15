import { useEffect, useMemo, useRef, useState } from "react";
import { getAllEmployees } from "../api";
import type { Employee } from "../types";

type Props = {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
};

export default function EmployeeMultiSelect({ value, onChange, placeholder = "Выберите исполнителя…" }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getAllEmployees().then(setEmployees); }, []);

  const selected = useMemo(
    () => employees.filter(e => value.includes(e.id)),
    [employees, value]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = employees.filter(e => !value.includes(e.id));
    if (!q) return base.slice(0, 50);
    return base.filter(e =>
      e.name.toLowerCase().includes(q) || String(e.id).includes(q)
    ).slice(0, 50);
  }, [employees, value, query]);

  function add(id: number) {
    if (!value.includes(id)) onChange([...value, id]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(id: number) {
    onChange(value.filter(v => v !== id));
  }

  function clearAll() {
    onChange([]);
    inputRef.current?.focus();
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          minHeight: 42, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 8
        }}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map(emp => (
          <span key={emp.id}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0f3f7",
                     border: "1px solid #dfe6ee", borderRadius: 999, padding: "4px 8px" }}>
            {emp.name}
            <button
              onClick={(e) => { e.stopPropagation(); remove(emp.id); }}
              title="Убрать"
              style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 700 }}
            >×</button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder={selected.length ? "" : placeholder}
          style={{ flex: 1, minWidth: 140, border: "none", outline: "none", padding: "4px 6px" }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !query && selected.length) {
              remove(selected[selected.length - 1].id);
            }
          }}
        />
        {selected.length > 0 && (
          <button onClick={(e) => { e.stopPropagation(); clearAll(); }}
            className="button"
            style={{ background: "#f5f7fa", borderColor: "#e0e6ed", color: "#2c3e50", padding: "4px 8px" }}>
            Очистить
          </button>
        )}
      </div>

      {open && list.length > 0 && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
            background: "#fff", border: "1px solid #ddd", borderRadius: 8,
            marginTop: 4, maxHeight: 240, overflow: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.08)"
          }}
        >
          {list.map(emp => (
            <div key={emp.id}
              onClick={() => add(emp.id)}
              style={{ padding: "8px 10px", cursor: "pointer" }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {emp.name} <span style={{ color: "#95a5a6" }}>#{emp.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}