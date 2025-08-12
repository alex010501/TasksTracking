const API_URL = import.meta.env.VITE_API_BASE || "/api";

// Общая обёртка
async function request(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");

  if (!res.ok) {
    const body = isJSON ? await res.json().catch(() => ({})) : await res.text();
    const msg = typeof body === "string" ? body : (body?.detail || JSON.stringify(body));
    throw new Error(`${res.status} ${res.statusText} - ${msg}`);
  }

  return isJSON ? res.json() : res.text();
}

// ======= Статистика =======
export async function getDepartmentName(): Promise<{ department_name: string }> {
  return request(`${API_URL}/stats/department_name`);
}

export async function getDepartmentStats(from: string, to: string): Promise<{ score: number }> {
  return request(`${API_URL}/stats/department_score?from_date=${from}&to_date=${to}`);
}

// ======= Сотрудники =======
export async function getAllEmployees() {
  // без редиректа (есть /employees и /employees/)
  return request(`${API_URL}/employees`);
}

export async function getEmployeeById(id: number) {
  return request(`${API_URL}/employees/${id}`);
}

export async function getTopEmployees(from: string, to: string, n: number) {
  return request(`${API_URL}/employees/top?from_date=${from}&to_date=${to}&n=${n}`);
}

export async function searchEmployees(query: string) {
  return request(`${API_URL}/employees/search?query=${encodeURIComponent(query)}`);
}

export async function getEmployeeScore(id: number, from: string, to: string) {
  return request(`${API_URL}/employees/${id}/score?from_date=${from}&to_date=${to}`);
}

export async function getEmployeeTasks(id: number, from: string, to: string) {
  return request(`${API_URL}/employees/${id}/tasks?from_date=${from}&to_date=${to}`);
}

export async function addEmployee(data: {
  name: string;
  position?: string;
  start_date: string;
  status?: string;
  status_start?: string | null;
  status_end?: string | null;
}) {
  return request(`${API_URL}/employees/`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateEmployee(id: number, data: any) {
  return request(`${API_URL}/employees/${id}`, { method: "PUT", body: JSON.stringify(data) });
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
  const sp = new URLSearchParams();
  if (params.from_date) sp.append("from_date", params.from_date);
  if (params.to_date) sp.append("to_date", params.to_date);
  if (params.query) sp.append("query", params.query);
  if (params.status) sp.append("status", params.status);
  const qs = sp.toString();
  const url = `${API_URL}/projects${qs ? "?" + qs : ""}`;
  return request(url);
}

export async function getProjectStages(project_id: number) {
  return request(`${API_URL}/projects/${project_id}/stages`);
}

export async function getStageTasks(project_id: number, stage_id: number) {
  return request(`${API_URL}/projects/${project_id}/${stage_id}/tasks`);
}

export async function getProjectName(id: number) {
  return request(`${API_URL}/projects/${id}/name`);
}

export async function getProjectScore(id: number, from: string, to: string) {
  return request(`${API_URL}/projects/${id}/score?from_date=${from}&to_date=${to}`);
}

export async function updateProject(id: number, data: any) {
  return request(`${API_URL}/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function closeProject(id: number, completed_date: string) {
  return updateProject(id, { completed_date, status: "завершен" });
}

export async function createProject(data: { name: string; description?: string; deadline?: string }) {
  return request(`${API_URL}/projects/`, { method: "POST", body: JSON.stringify(data) });
}

// ======= Задачи =======
export type CreateTaskPayload = {
  name: string;
  description?: string;
  deadline: string;              // YYYY-MM-DD
  difficulty: 1 | 2 | 4;
  executor_ids: number[];        // минимум 1
  project_id?: number | null;
  stage_id?: number | null;
  created_date?: string | null;
  status?: string;               // по умолчанию "в работе"
  completed_date?: string | null;
};

export async function getUnassignedTasks(params: {
  from_date?: string;
  to_date?: string;
  query?: string;
  status?: string;
}) {
  const sp = new URLSearchParams();
  if (params.from_date) sp.append("from_date", params.from_date);
  if (params.to_date) sp.append("to_date", params.to_date);
  if (params.query) sp.append("query", params.query);
  if (params.status) sp.append("status", params.status);
  return request(`${API_URL}/tasks/?${sp.toString()}`);
}

export async function getProjectLinkedTasks(params: {
  from_date?: string;
  to_date?: string;
  query?: string;
  status?: string;
}) {
  const sp = new URLSearchParams();
  if (params.from_date) sp.append("from_date", params.from_date);
  if (params.to_date) sp.append("to_date", params.to_date);
  if (params.query) sp.append("query", params.query);
  if (params.status) sp.append("status", params.status);
  return request(`${API_URL}/projects/task_search?${sp.toString()}`);
}

export async function createTask(payload: CreateTaskPayload) {
  return request(`${API_URL}/tasks/`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateTask(id: number, data: any) {
  return request(`${API_URL}/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function completeTask(id: number, completed_date: string) {
  return updateTask(id, { status: "выполнено", completed_date });
}

export async function getTaskScore(taskId: number): Promise<number> {
  const data = await request(`${API_URL}/tasks/${taskId}/score`);
  const v = typeof data === "number" ? data : (typeof data?.score === "number" ? data.score : 0);
  return v;
}