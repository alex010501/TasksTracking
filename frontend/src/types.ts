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
  created_date: string;
  deadline?: string | null;
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
  created_date: string;
  deadline: string;
  completed_date?: string | null;
  difficulty: 1 | 2 | 4;
  status: "В работе" | "Выполнено" | "Просрочено";
  executor_ids: string; // CSV, но чаще всего преобразуется в массив
  project_id?: number | null;
  stage_id?: number | null;
}

export interface TaskWithProjectAndEmployee {
  id: number;
  name: string;
  difficulty: number;
  status: string;
  created_date: string;
  deadline: string;
  completed_date: string | null;
  executor_ids: string;
  project: Project | null;
  stage?: ProjectStage | null;
}

export interface EmployeeScore {
  employee_id: number;
  name: string;
  score: number;
}

export interface DepartmentScore {
  score: number;
}

export interface TopEmployee {
  employee_id: number;
  name: string;
  score: number;
}
