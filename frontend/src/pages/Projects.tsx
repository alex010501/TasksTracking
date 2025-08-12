import { useCallback, useEffect, useMemo, useState } from "react";
import { getProjects } from "../api";
import AddProjectModal from "../components/modals/AddProjectModal";
import EditProjectModal from "../components/modals/EditProjectModal";
import ProjectCard from "../components/projects/ProjectCard";

type Project = { id: number; name: string; deadline?: string | null };

export default function ProjectsPage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const monthAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);

  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadProjects = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const list = await getProjects({ from_date: fromDate, to_date: toDate });
      setProjects(list || []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Не удалось загрузить проекты");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const projectToEdit = useMemo(
    () => projects.find((p) => p.id === editProjectId) || null,
    [projects, editProjectId]
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="filters card">
        <div className="card-header" style={{ fontWeight: 700 }}>Фильтры</div>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>С: <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
          <label>По: <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
          <button className="button" onClick={loadProjects}>Применить</button>
          <div style={{ flex: 1 }} />
          <button className="button green" onClick={() => setShowAddModal(true)}>+ Проект</button>
        </div>
      </div>

      {error && <div style={{ color: "#c0392b" }}>{error}</div>}
      {loading && <div style={{ color: "#6b7280" }}>Загрузка…</div>}

      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          expanded={expandedId === project.id}
          onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
          onEdit={() => setEditProjectId(project.id)}
          onUpdated={loadProjects}
          fromDate={fromDate}
          toDate={toDate}
        />
      ))}

      {showAddModal && (
        <AddProjectModal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); loadProjects(); }}
        />
      )}

      {editProjectId !== null && projectToEdit && (
        <EditProjectModal
          isOpen={true}
          onClose={() => setEditProjectId(null)}
          onUpdated={() => { setEditProjectId(null); loadProjects(); }}
          project={projectToEdit}
        />
      )}
    </div>
  );
}