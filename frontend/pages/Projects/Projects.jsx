import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GoHourglass } from "react-icons/go";
import { RiMoneyEuroBoxLine } from "react-icons/ri";
import { CiBank } from "react-icons/ci";
import { getUserFromToken, getAuthHeaders } from "../../src/utils/auth";
import "./projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const user = getUserFromToken();

      if (!user) {
        throw new Error("No user found in token");
      }

      const accountId = user.id;
      setUserID(accountId);

    const res = await fetch(`http://localhost:3000/projects/by-account?account_id=${accountId}`, {
      headers: getAuthHeaders()
    });

      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await res.json();

      const projectList = (data || []).map((project) => ({
        id: project.id,
        name: project.name || "Unnamed Project",
        memberCount: project.members ? project.members.length : 0,
        totalHoursLogged: 0,
        totalHours: project.total_hours,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        subsidy: project.subsidy,
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track your projects</p>
        </div>
        <button
          className="btn-create-project"
          onClick={() => navigate("/projects/create")}
        >
          Create New Project
        </button>
      </div>

      {loading ? (
        <div className="projects-loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects found yet.</p>
          <button
            className="btn-create-project"
            onClick={() => navigate("/projects/create")}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <h2 className="project-name">{project.name}</h2>

              <div className="project-detail">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1a1a4e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{project.memberCount} members</span>
              </div>

              <div className="project-detail">
                <FaRegCalendarAlt />
                <span>{project.startDate.split('-').reverse().join('/')} until {project.endDate.split('-').reverse().join('/')}</span>
              </div>

              <div className="project-detail">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1a1a4e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{project.totalHoursLogged} hours logged out of {Math.floor(project.totalHours)} total</span>
              </div>

              <div className="project-detail">
                <GoHourglass className="hourglass-icon"/>
                <span>{Math.floor(project.totalHours) - Math.floor(project.totalHoursLogged)} hours remaining</span>
              </div>

              <div className="project-detail">
                <RiMoneyEuroBoxLine className="euro-icon"/>
                <span>Budget: { project.budget } €</span>
              </div>

              <div className="project-detail">
                <CiBank className="bank-icon"/>
                <span>Subsidy: { project.subsidy } €</span>
              </div>

              <button
                className="btn-view-project"
                onClick={() =>
                  navigate(`/projects/${project.id}/${encodeURIComponent(project.name)}`)
                }
              >
                View Project
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}