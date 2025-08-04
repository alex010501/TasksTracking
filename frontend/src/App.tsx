import NavBar from "./components/NavBar";
import DepartmentStats from "./pages/DepartmentStats";
import EmployeePage from "./pages/EmployeePage";
import ProjectTasks from "./pages/ProjectsTasks";
import { Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/department" />} />
        <Route path="/department" element={<DepartmentStats />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/projects" element={<ProjectTasks />} />
      </Routes>
    </>
  );
}
