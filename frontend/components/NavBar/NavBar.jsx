import { NavLink } from "react-router-dom"
import './navbar.css'

export default function NavBar() {
  return (
    <nav className="navbar">

      <div className="nav-left">
        <div>IT Hub Logo</div>
      </div>

      <div className="nav-right">
        <div className="nav-links">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/account">Account</NavLink>
          <NavLink to="/login">Login</NavLink>
        </div>

        <div>🔔</div>
      </div>

    </nav>
  );
}