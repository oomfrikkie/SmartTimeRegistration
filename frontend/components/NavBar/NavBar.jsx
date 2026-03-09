import { NavLink } from "react-router-dom"
import './navbar.css'
export default function NavBar()
{
    return(
        <section>
            <nav className="nav-links">
                <NavLink to='/home'>Home</NavLink>
                <NavLink to='/login'>Login</NavLink>
            </nav>
        </section>
    )
}