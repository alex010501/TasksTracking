export function getScoreColor(score: number, norm1: number, norm2: number): string {
  if (score <= norm1) return "red";
  if (score <= norm2) return "orange";
  return "green";
}
