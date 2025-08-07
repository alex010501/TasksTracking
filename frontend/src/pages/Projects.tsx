import { useEffect, useState } from "react";
import type { Project } from "../types";
import {
  getProjects,
  closeProject,
  getDepartmentName,
} from "../api";
import ProjectCard from "../components/projects/ProjectCard";
import AddProjectModal from "../components/modals/AddProjectModal";
import EditProjectModal from "../components/modals/EditProjectModal";
import FilterBlock from "../components/FilterBlock";

function getCurrentMonthRange() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  return {
    from: new Date(y, m, 2).toISOString().split("T")[0],
    to: new Date(y, m + 1, 1).toISOString().split("T")[0],
  };
}

function getCurrentQuarterRange() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const qStartMonth = Math.floor(m / 3) * 3;
  return {
    from: new Date(y, qStartMonth, 2).toISOString().split("T")[0],
    to: new Date(y, qStartMonth + 3, 1).toISOString().split("T")[0],
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("все");

  const [fromDate, setFromDate] = useState(getCurrentMonthRange().from);
  const [toDate, setToDate] = useState(getCurrentMonthRange().to);

  const loadProjects = async () => {
    const data = await getProjects({
      query,
      status: statusFilter !== "все" ? statusFilter : undefined,
      from_date: fromDate,
      to_date: toDate,
    });
    setProjects(data);
  };

  useEffect(() => {
    getDepartmentName().then(setDepartmentName);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [query, statusFilter, fromDate, toDate]);

  const handleSetCurrentMonth = () => {
    const { from, to } = getCurrentMonthRange();
    setFromDate(from);
    setToDate(to);
  };

  const handleSetCurrentQuarter = () => {
    const { from, to } = getCurrentQuarterRange();
    setFromDate(from);
    setToDate(to);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📦 Проекты отдела</h2>
      <div className="page-content-80-20">
        <div className="left">
          <FilterBlock
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onSetPeriod1={handleSetCurrentMonth}
            onSetPeriod2={handleSetCurrentQuarter}
            period1Label="Текущий месяц"
            period2Label="Текущий квартал"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                expanded={selectedProjectId === project.id}
                onToggle={() =>
                  setSelectedProjectId((prev) =>
                    prev === project.id ? null : project.id
                  )
                }
                onEdit={() => setEditProjectId(project.id)}
                onUpdated={loadProjects}
              />
            ))}
          </div>
        </div>

        <div className="right" style={{ position: "sticky", top: "2rem" }}>
            <button className="button green" onClick={() => setShowAddModal(true)}>
              + Создать проект
            </button>

            {showAddModal && (
              <AddProjectModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={loadProjects}
              />
            )}

            {editProjectId !== null && (
              <EditProjectModal
                isOpen={true}
                onClose={() => setEditProjectId(null)}
                onUpdated={() => {
                  setEditProjectId(null);
                  loadProjects();
                }}
                project={projects.find((p) => p.id === editProjectId)!}
              />
            )}
        </div>
      </div>
    </div>
  );
}
