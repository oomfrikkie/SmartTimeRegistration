import { NavLink } from "react-router-dom";
import "./projectcard.css";

function ProjectCard({ title, members, hours }) {
  return (
    <div className="project-card">

      <h3>{title}</h3>

      <div className="project-info">
        <span>{members} members</span>
        <span>{hours} hours logged</span>
      </div>

      <button>View Project</button>

    </div>
  );
}

export default ProjectCard;