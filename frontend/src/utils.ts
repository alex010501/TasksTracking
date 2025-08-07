export function getScoreColor(value: number, refValue: number): string {
  if (value < (refValue/3)) return "red"
  if (value < (2*refValue/3)) return "orange"
  return "green"
}

export interface ScoreRef {
  value: number  // Текущее значение
  refValue: number  // Референсное значение
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}