const API_URL = import.meta.env.VITE_API_BASE || "/api";

// ======= Общее =======
export async function getDepartmentName() {
  const res = await fetch(`${API_URL}/stats/department_name`);
  return res.json();
}

export async function getDepartmentStats(from: string, to: string) {
  const res = await fetch(`${API_URL}/stats/department_score?from_date=${from}&to_date=${to}`);
  return res.json();
}

// ======= Сотрудники =======
export async function getAllEmployees() {
  console.log(`${API_URL}/employees`)
  const res = await fetch(`${API_URL}/employees`);
  return res.json();
}

export async function getEmployeeById(id: number) {
  const res = await fetch(`${API_URL}/employees/${id}`);
  return res.json();
}

export async function getTopEmployees(from: string, to: string, n: number) {
  const res = await fetch(`${API_URL}/employees/top?from_date=${from}&to_date=${to}&n=${n}`);
  return res.json();
}

export async function searchEmployees(query: string) {
  const res = await fetch(`${API_URL}/employees/search?query=${query}`);
  return res.json();
}

export async function getEmployeeScore(id: number, from: string, to: string) {
  const res = await fetch(`${API_URL}/employees/${id}/score?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function getEmployeeTasks(id: number, from: string, to: string) {
  const res = await fetch(`${API_URL}/employees/${id}/tasks?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function addEmployee(data: {
  name: string;
  position: string;
  date_started: string;
}) {
  const res = await fetch(`${API_URL}/employees/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEmployee(id: number, data: any) {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function restoreEmployee(id: number) {
  return updateEmployee(id, {
    status: "работает",
    status_start: null,
    status_end: null,
  });
}

// ======= Проекты =======
export async function getProjects(params: {
  from_date?: string;
  to_date?: string;
  query?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.from_date) searchParams.append("from_date", params.from_date);
  if (params.to_date) searchParams.append("to_date", params.to_date);
  if (params.query) searchParams.append("query", params.query);
  if (params.status) searchParams.append("status", params.status);

  const res = await fetch(`${API_URL}/projects?${searchParams.toString()}`);
  return res.json();
}

export async function getProjectStages(project_id: number) {
  const res = await fetch(`${API_URL}/projects/${project_id}/stages`);
  return res.json();
}

export async function getStageTasks(project_id: number, stage_id: number) {
  const res = await fetch(`${API_URL}/projects/${project_id}/${stage_id}/tasks`);
  return res.json();
}

export async function getProjectName(id: number) {
  const res = await fetch(`${API_URL}/projects/${id}/name`);
  return res.json();
}

export async function getProjectScore(id: number, from: string, to: string) {
  const res = await fetch(`${API_URL}/projects/${id}/score?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function updateProject(id: number, data: any) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function closeProject(id: number, completed_date: string) {
  return updateProject(id, {
    completed_date,
    status: "завершен",
  });
}

export async function createProject(data: {
  name: string;
  description: string;
  deadline: string;
}) {
  const res = await fetch(`${API_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ======= Задачи =======
export async function getUnassignedTasks(params: {
  from_date?: string;
  to_date?: string;
  query?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.from_date) searchParams.append("from_date", params.from_date);
  if (params.to_date) searchParams.append("to_date", params.to_date);
  if (params.query) searchParams.append("query", params.query);
  if (params.status) searchParams.append("status", params.status);

  const res = await fetch(`${API_URL}/tasks/?${searchParams.toString()}`);
  return res.json();
}

// Задачи, привязанные к проектам (из /projects/task_search)
export async function getProjectLinkedTasks(params: {
  from_date?: string;
  to_date?: string;
  query?: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.from_date) searchParams.append("from_date", params.from_date);
  if (params.to_date) searchParams.append("to_date", params.to_date);
  if (params.query) searchParams.append("query", params.query);
  if (params.status) searchParams.append("status", params.status);

  const res = await fetch(`${API_URL}/projects/task_search?${searchParams.toString()}`);
  return res.json();
}

export type CreateTaskDto = {
  name: string;
  description: string;
  deadline: string;                   // YYYY-MM-DD
  difficulty: 1 | 2 | 4;          // бэк допускает 0
  executor_ids: number[];
  project_id?: number | null;
  stage_id?: number | null;
};

export async function createTask(data: CreateTaskDto) {
  const res = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    // отдаём тело ошибки, чтобы модалка показала его пользователю
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!text) {
    // на случай если бэк вернул 201 без тела
    throw new Error("Пустой ответ от сервера при создании задачи");
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Ожидался JSON, получено (${ct}): ${text.slice(0, 200)}`);
  }

  return JSON.parse(text);
}

export async function updateTask(id: number, data: any) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text(); // или res.json() если знаешь структуру
    throw new Error(`Ошибка при обновлении задачи: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function completeTask(id: number, completed_date: string) {
  return updateTask(id, { status: "выполнено", completed_date });
}

export async function getTaskScore(id: number) {
  const res = await fetch(`${API_URL}/tasks/${id}/score`);
  return res.json();
}

async function parseJsonOrThrow(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text) return { status: "deleted" };
  try { return JSON.parse(text); } catch { return { status: "deleted" }; }
}

export async function deleteTask(id: number, password: string) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { "X-Delete-Password": password },
  });
  return parseJsonOrThrow(res);
}

export async function deleteProject(id: number, password: string) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { "X-Delete-Password": password },
  });
  return parseJsonOrThrow(res);
}