import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/event?account_id=1");
      const events = await res.json();

      // Group events by project_name to derive project list
      const projectMap = {};
      (events || []).forEach((event) => {
        const name = event.project_name || event.name || "Unnamed Project";
        if (!projectMap[name]) {
          projectMap[name] = { name, totalHours: 0, members: new Set() };
        }
        projectMap[name].totalHours += parseFloat(event.total_hours || 0);
        if (event.account) {
          projectMap[name].members.add(event.account.id || event.account);
        }
      });

      const projectList = Object.values(projectMap).map((p) => ({
        name: p.name,
        totalHours: Math.round(p.totalHours * 10) / 10,
        memberCount: Math.max(p.members.size, 1),
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setLoading(false);
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track your projects</p>
        </div>
        <button className="btn-create-project" onClick={() => navigate("../CreateProject/CreateProject.jsx")}>
          Create New Project
        </button>
      </div>

      {loading ? (
        <div className="projects-loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects found yet.</p>
          <button className="btn-create-project" onClick={() => navigate("../CreateProject/CreateProject.jsx")}>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div className="project-card" key={index}>
              <h2 className="project-name">{project.name}</h2>
              <div className="project-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>{project.memberCount} members</span>
              </div>
              <div className="project-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{project.totalHours} hours logged</span>
              </div>
              <button className="btn-view-project" onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}>
                View Project
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
