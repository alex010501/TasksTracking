export interface Employee {
  id: number;
  name: string;
  position?: string;
  start_date: string;
  status: "работает" | "в отпуске" | "уволен";
  status_start?: string | null;
  status_end?: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_date?: string | null;
  deadline: string;
  completed_date?: string | null;
  status: "в работе" | "завершен" | "просрочено";
}

export interface ProjectStage {
  id: number;
  project_id: number;
  name: string;
  order: number;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  created_date: string;
  deadline: string;
  completed_date?: string | null;
  difficulty: 1 | 2 | 4;
  status: "в работе" | "выполнено" | "просрочено";
  executor_ids: number[];
  project_id?: number | null;
  stage_id?: number | null;
}

export interface ScoredEmployee {
  employee_id: number;
  name: string;
  score: number;
}

export interface DepartmentScore {
  score: number;
}
