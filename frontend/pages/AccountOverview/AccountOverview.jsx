import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoPerson } from 'react-icons/go';
import { MdOutlineMail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { getUserFromToken, getAuthHeaders, logout } from '../../src/utils/auth';
import './accountoverview.css';

export default function AccountOverview() {
    const [user, setUser] = useState(null);
    const [accountID, setAccountID] = useState(0);
    const [currentProjects, setCurrentProjects] = useState([]);
    const [previousProjects, setPreviousProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
        initializeData();
    }, []);

    const getUserData = () => {
        const userData = getUserFromToken();

        if (userData) {
            setAccountID(userData.id);
            return userData;
        } else {
            throw new Error("User not found in token.");
        }   
    };

    const fetchProjects = async (accountID) => {
        try {
            const response = await fetch(`http://localhost:3000/projects/by-account?account_id=${accountID}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            const currentProjectList = (data || [])
                .filter(project => project.status == "ongoing")
                .map((project) => ({
                    id: project.id,
                    name: project.name || "Unnamed Project",
                }));
            setCurrentProjects(currentProjectList);

            const previousProjectsList = (data || [])
                .filter(project => project.status = "completed")
                .map((project) => ({
                    id: project.id,
                    name: project.name || "Unnamed Project",
                }));
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const initializeData = async () => {
        setIsLoading(true);
        
        const userData = getUserData();
        setUser(userData);
        
        if (userData) {
          await fetchProjects(userData.id);
        }
        
        setIsLoading(false);
    };

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

                <div className="buttons">
                    <button className="reset-password" onClick={() => navigate('/reset-password')}>
                        <IoLockClosedOutline className="button-icon" />
                        <div className="desc">Change Password</div>
                    </button>

                    <button className="log-out" 
                    onClick={handleLogout}
                    >
                        <CiLogout className="button-icon" />
                        <div className="desc">Log out</div>
                    </button>
                </div>
            </section>

            <section className="current-projects">
                <h2>Current Projects</h2>

                {currentProjects.length === 0 ? (
                    <p>You are curretly not part of any project.</p>
                ) : (
                    <div className="projects-list">
                        {currentProjects.map(project => (
                            <div className="project" key={project.id}>
                                <div className="title">{project.name}</div>
                                <div className="view-project-button">
                                    <button 
                                        onClick={() => 
                                            navigate(`/projects/${project.id}/${encodeURIComponent(project.name)}`)
                                        }
                                    >
                                        <span>View</span><FaArrowRight className="arrow-icon"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="previous-projects">
                <h2>Previous Projects</h2>
                <div className="project">  {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                    <div className="title">API Integration</div>
                    <div className="status">Completed</div>
                </div>

                <div className="project"> {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                    <div className="title">Database Migration</div>
                    <div className="status">Completed</div>
                </div>
            </section>
        </div> 
    );
}