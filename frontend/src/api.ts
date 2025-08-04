const API = "http://localhost:5000/api";

export async function getEmployees() {
  const res = await fetch(`${API}/employees`);
  return res.json();
}

export async function getProjects() {
  const res = await fetch(`${API}/projects`);
  return res.json();
}

export async function getTasks(projectId?: number, assigneeId?: number) {
  const url = new URL(`${API}/tasks`, window.location.origin);
  if (projectId) url.searchParams.append("project_id", projectId.toString());
  if (assigneeId) url.searchParams.append("assignee_id", assigneeId.toString());

  const res = await fetch(url.toString().replace(window.location.origin, "http://localhost:5000"));
  return res.json();
}

export async function getDepartmentStats(start: string, end: string) {
  const res = await fetch(`${API}/stats/department?start=${start}&end=${end}`);
  return res.json();
}

export async function getEmployeeStats(id: number, start: string, end: string) {
  const res = await fetch(`${API}/stats/employee/${id}?start=${start}&end=${end}`);
  return res.json();
}

export async function getProjectStats(id: number, start: string, end: string) {
  const res = await fetch(`${API}/stats/project/${id}?start=${start}&end=${end}`);
  return res.json();
}
