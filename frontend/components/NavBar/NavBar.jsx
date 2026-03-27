import { NavLink } from "react-router-dom"
import './navbar.css'
export default function NavBar()
{
    return(
        <section>
            <nav className="nav-links">
                <NavLink to='/home'>IT Hub Logo</NavLink>
                <NavLink to='/home'>Home</NavLink>
                <NavLink to='/login'>Login</NavLink>
                <NavLink to="/projects">Projects</NavLink>
            </nav>
        </section>
    )
}