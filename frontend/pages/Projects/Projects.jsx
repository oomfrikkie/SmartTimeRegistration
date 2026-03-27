import ProjectCard from "../../components/ProjectCard/ProjectCard";
import "./projects.css";

function Projects() {
  return (
    <div className="projects-page">

      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track your projects</p>
        </div>

        <button className="create-btn">Create New Project</button>
      </div>

      <div className="projects-grid">
        <ProjectCard
          title="Website Redesign"
          members={5}
          hours={120}
        />

        <ProjectCard
          title="Mobile App Development"
          members={8}
          hours={240}
        />

        <ProjectCard
          title="API Integration"
          members={3}
          hours={85}
        />
      </div>

    </div>
  );
}

export default Projects;