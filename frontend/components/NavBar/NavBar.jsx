import { NavLink } from "react-router-dom"
import './navbar.css'
import Notification from "../Notification/Notification.jsx";

export default function NavBar() {
    return (
        <nav className="navbar">
            <NavLink to="/home" className="navbar-logo">
                <img src="../src/assets/logo.png" alt="logo" />
            </NavLink>
            <div className="navbar-links">
                <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
                <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Projects</NavLink>
                <NavLink to="/account" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Account</NavLink>
                <Notification />
            </div>
        </nav>
    )
}
