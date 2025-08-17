import { NavLink } from "react-router-dom";
import DepartmentHeader from "./stats/DepHeader";
import "../styles/navbar.css";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo.svg" alt="Логотип" className="logo" />
      </div>
      <div className="navbar-tabs">
        <NavLink
          to="/отдел"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          <DepartmentHeader/>
        </NavLink>
        <NavLink
          to="/сотрудники"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Сотрудники
        </NavLink>
        <NavLink
          to="/проекты"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Проекты
        </NavLink>
        <NavLink
          to="/задачи"
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          Задачи
        </NavLink>
      </div>
    </nav>
  );
}
