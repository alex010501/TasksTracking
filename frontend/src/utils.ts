export function getScoreColor(value: number, refValue: number): string {
  if (value < (refValue/3)) return "red"
  if (value < (2*refValue/3)) return "orange"
  return "green"
}

export interface ScoreRef {
  value: number  // Текущее значение
  refValue: number  // Референсное значение
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export function normalizeExecutorIds(value: number[] | string | null | undefined): number[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    return value
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
}