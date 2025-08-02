import { NavLink } from "react-router-dom";

const NavBar = () => (
  <nav style={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
    <NavLink to="/department" style={{ marginRight: "20px" }}>📊 Технический блок</NavLink>
    <NavLink to="/employees" style={{ marginRight: "20px" }}>👤 Сотрудники</NavLink>
    <NavLink to="/projects">📁 Проекты и задачи</NavLink>
  </nav>
);

export default NavBar;
