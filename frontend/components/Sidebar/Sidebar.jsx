import { NavLink } from "react-router-dom";
import { logout } from "../../src/utils/auth";
import "./sidebar.css";

export default function Sidebar() {
  const handleLogout = async () => {
    await logout();
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Smart Time</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/home"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Calendar</span>
        </NavLink>

        <NavLink
          to="/auto-allocation"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Auto Allocation</span>
        </NavLink>

        <NavLink
          to="/adjustments"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Adjustments</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>Settings</span>
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
