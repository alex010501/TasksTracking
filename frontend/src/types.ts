export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  hire_date: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  deadline: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  weight: number;
  is_completed: boolean;
  completion_date: string | null;
  created_at: string;
  assignee: { id: number; name: string };
  project: { id: number; name: string } | null;
}
