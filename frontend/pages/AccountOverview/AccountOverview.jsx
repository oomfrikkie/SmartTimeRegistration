import { useState, useEffect } from 'react';
import { GoPerson } from 'react-icons/go';
import { MdOutlineMail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import './accountoverview.css';

export default function AccountOverview() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userID, setUserID] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccountInfo();
    }, []);

    const fetchAccountInfo = async () => {
        setLoading(true);

        try {
            const userData = localStorage.getItem('user');

            if (!userData) {
                throw new Exception("No user found in local storage.");
            } 

            const user = JSON.parse(userData);

            if (!user?.id) {
                throw new Error("User ID not found in localStorage");
            }

            const accountId = user.id;
            setUserID(accountId);

            const res = await fetch(`http://localhost:3000/projects/by-account?account_id=${accountId}`);

            if (!res.ok) {
                throw new Error("Failed to fetch projects");
            }

            const data = await res.json();

            const projectList = (data || []).map((project) => ({
                id: project.id,
                name: project.name || "Unnamed Project",
                memberCount: project.members ? project.members.length : 0,
                totalHours: 0,
            }));
        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="account-overview-container">
            <section className="header">
                <h1>Account Overview</h1>
                <p>Manage your profile and view your projects</p>
            </section>

            <section className="personal-information">
                <h2>Personal Information</h2>
                <div className="form">
                    <div className="name">
                        <GoPerson className="icon" />
                        <div className="info">
                            <div className="text">Name</div>
                            <div className="account-name">{ user?.name }</div>
                        </div>
                    </div>
                    <div className="surname">
                        <GoPerson className="icon" />
                        <div className="info">
                            <div className="text">Surname</div>
                            <div className="account-surname">{ user?.surname }</div>
                        </div>
                    </div>
                    <div className="email">
                        <MdOutlineMail className="icon" />
                        <div className="info">
                            <div className="text">Email</div>
                            <div className="account-email">{ user?.email }</div>
                        </div>
                    </div>
                </div>

                <button>
                    <IoLockClosedOutline className="lock-icon" />
                    <div className="desc">Change Password</div>
                </button>
            </section>

            <section className="current-projects">
                <h2>Current Projects</h2>

                {loading ? (
                    <div className="projects-loading">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="projects-empty">
                        <p>No projects found yet.</p>
                    </div>
                ) : (
                    <div className="projects">
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
                                <span>{project.totalHours} hours logged</span>
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
            </section>

            <section className="previous-projects">
                <h2>Previous Projects</h2>
                    <div className="project">  {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                        <div className="info">
                            <div className="title">API Integration</div>
                            <div className="desc">Developer</div>
                        </div>
                    <div className="status">Completed</div>
                </div>

                <div className="project"> {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                    <div className="info">
                        <div className="title">Database Migration</div>
                        <div className="desc">Developer</div>
                    </div>
                    <div className="status">Completed</div>
                </div>
            </section>
        </div> 
    );
}

