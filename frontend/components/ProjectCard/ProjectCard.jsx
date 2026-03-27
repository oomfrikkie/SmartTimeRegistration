function ProjectCard({ title, members, hours }) {
  return (
    <div className="project-card">
      <h3>{title}</h3>

      <p>{members} members</p>
      <p>{hours} hours logged</p>

      <button>View Project</button>
    </div>
  );
}

export default ProjectCard;