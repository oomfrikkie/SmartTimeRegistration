import { NavLink } from "react-router-dom"
import './navbar.css'

export default function NavBar() {
    return (
        <nav className="navbar">
            <NavLink to="/home" className="navbar-logo">
                ITHB
            </NavLink>
            <div className="navbar-links">
                <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
                <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Projects</NavLink>
                <NavLink to="/account" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Account</NavLink>
                <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Login</NavLink>
                <button className="navbar-bell" aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span className="bell-dot"></span>
                </button>
            </div>
        </nav>
    )
}
