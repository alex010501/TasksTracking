import NavBar from "./components/NavBar";
import DepartmentStats from "./pages/DepartmentStats";
import EmployeePage from "./pages/EmployeePage";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/buttons.css";
import "./styles/status.css";
import "./styles/styles.css";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/отдел" />} />
        <Route path="/отдел" element={<DepartmentStats />} />
        <Route path="/сотрудники" element={<EmployeePage />} />
        <Route path="/проекты" element={<Projects />} />
        <Route path="/задачи" element={<Tasks />} />
      </Routes>
    </>
  );
}
