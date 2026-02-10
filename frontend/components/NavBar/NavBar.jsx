import { NavLink } from "react-router-dom"

export default function NavBar()
{
    return(
        <section>
            <nav>
                <NavLink to='/home'>Home</NavLink>
            </nav>
        </section>
    )
}