export function toExecutorIds(value: number[] | string | null | undefined): number[] {
  if (Array.isArray(value)) return uniq(value.filter((n) => Number.isFinite(n)));
  if (typeof value === "string" && value.trim() !== "") {
    return uniq(
      value
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n))
    );
  }
  return [];
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function safeDateISO(d?: string | null) {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export function toAddEmployeeDto(input: {
  name: string;
  position?: string;
  start_date: string;
}) {
  return {
    name: input.name,
    position: input.position ?? "",
    date_started: input.start_date,
  };
}

export function getScoreColor(value: number, refValue: number): string {
  if (value < (refValue/3)) return "red"
  if (value < (2*refValue/3)) return "orange"
  return "green"
}

export interface ScoreRef {
  value: number  // Текущее значение
  refValue: number  // Референсное значение
}