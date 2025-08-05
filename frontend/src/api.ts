// frontend/src/api.ts
const API_URL = "http://127.0.0.1:8080";

// Общее
export async function getDepartmentName() {
  const res = await fetch(`${API_URL}/stats/department_name`);
  return res.json();
}

// ======= Страница отдела =======

export async function getDepartmentStats(from: string, to: string) {
  const res = await fetch(`${API_URL}/stats/department_score?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function getProjectsByPeriod(from: string, to: string) {
  const res = await fetch(`${API_URL}/projects?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function getTopEmployees(from: string, to: string, n: number) {
  const res = await fetch(`${API_URL}/employees/top?from_date=${from}&to_date=${to}&n=${n}`);
  return res.json();
}

// ======= Сотрудники =======

export async function getAllEmployees() {
  const res = await fetch(`${API_URL}/employees`);
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
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "работает",
      status_start: null,
      status_end: null,
    }),
  });
  return res.json();
}

// ======= Проекты =======

export async function searchProjects(query: string) {
  const res = await fetch(`${API_URL}/projects/search?query=${query}`);
  return res.json();
}

export async function getProjectTasks(id: number) {
  const res = await fetch(`${API_URL}/projects/${id}/tasks`);
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
  const res = await fetch(`${API_URL}/projects/${id}/close`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed_date }),
  });
  return res.json();
}

// ======= Задачи =======

export async function searchTasks(query: string) {
  const res = await fetch(`${API_URL}/tasks/search?query=${query}`);
  return res.json();
}

export async function getUnassignedTasks(from: string, to: string) {
  const res = await fetch(`${API_URL}/tasks/unassigned?from_date=${from}&to_date=${to}`);
  return res.json();
}

export async function updateTask(id: number, data: any) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function completeTask(id: number, completed_date: string) {
  const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed_date }),
  });
  return res.json();
}