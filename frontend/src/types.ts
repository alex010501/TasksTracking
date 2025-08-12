export type Employee = {
  id: number;
  name: string;
  position?: string | null;
  start_date: string;               // YYYY-MM-DD
  status?: "работает" | "в отпуске" | "уволен" | string;
  status_start?: string | null;     // YYYY-MM-DD | null
  status_end?: string | null;       // YYYY-MM-DD | null
};

export type Task = {
  id: number;
  name: string;
  description?: string;             // всегда строка (может быть пустой)
  created_date: string;             // YYYY-MM-DD
  deadline: string;                 // YYYY-MM-DD
  status: string;                   // "в работе" | "выполнено" | ...
  difficulty: 1 | 2 | 4;
  executor_ids: number[];           // нормализованный список id исполнителей
  project_id?: number | null;
  stage_id?: number | null;
};

export type Project = {
  id: number;
  name: string;
  deadline?: string | null;         // YYYY-MM-DD | null
  status?: string | null;           // опционально (для отделов/дашбордов)
};

export type Stage = {
  id: number;
  name: string;
  project_id?: number;
};

export type ScoredEmployee = {
  employee_id: number;
  name: string;
  score: number;
};