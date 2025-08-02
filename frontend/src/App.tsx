import { Route, Routes, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar"
import DepartmentStats from "./pages/DepartmentStats";
import EmployeePage from "./pages/EmployeePage";
import ProjectTasks from "./pages/ProjectsTasks";

export default function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/department" />} />
        <Route path="/department" element={<DepartmentStats />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/projects" element={<ProjectTasks />} />
      </Routes>
    </div>
  );
}
