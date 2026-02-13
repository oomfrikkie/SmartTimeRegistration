import { NavLink } from "react-router-dom"
import LoginButton from "../LoginButton/LoginButton"

export default function NavBar()
{
    return(
        <section>
            <nav>
                <NavLink to='/home'>Home</NavLink>
                <LoginButton />
            </nav>
        </section>
    )
}