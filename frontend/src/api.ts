const API = "http://localhost:8080";

// employees
export async function getEmployees() {
  const res = await fetch(`${API}/employees`);
  return res.json();
}

export async function getTopEmployees(topCount: number, start: string, end: string) {
  const res = await fetch(`${API}/employees/top/${topCount.toString()}?from_date=${start}&to_date=${end}`);
  return res.json();
}

export async function findEmployees(searchQuery: string) {
  const res = await fetch(`${API}/employees/search?query=${searchQuery}`);
  return res.json();
}

export async function getEmployeeScore(id: number, start: string, end: string) {
  const res = await fetch(`${API}/employees/${id.toString()}/score?from_date=${start}&to_date=${end}`);
  return res.json();
}

export async function getProjects(start: string, end: string) {
  const res = await fetch(`${API}/projects/?from_date=${start}&to_date=${end}`);
  return res.json();
}

export async function getTasks(projectId?: number, assigneeId?: number) {
  const url = new URL(`${API}/tasks`, window.location.origin);
  if (projectId) url.searchParams.append("project_id", projectId.toString());
  if (assigneeId) url.searchParams.append("assignee_id", assigneeId.toString());

  const res = await fetch(url.toString().replace(window.location.origin, "http://localhost:8080"));
  return res.json();
}

export async function getDepartmentStats(start: string, end: string) {
  const res = await fetch(`${API}/stats/department_score?from_date=${start}&to_date=${end}`);
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
