import { NavLink } from "react-router-dom";
import DepartmentHeader from "./DepHeader";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo.svg" alt="Логотип" className="logo" />
      </div>
      <div className="navbar-tabs">
        <NavLink
          to="/department"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          <DepartmentHeader/>
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Сотрудники
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Проекты
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Задачи
        </NavLink>
      </div>
    </nav>
  );
}
