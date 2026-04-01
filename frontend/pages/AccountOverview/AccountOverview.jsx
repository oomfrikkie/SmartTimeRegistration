import { useState, useEffect } from 'react';
import { GoPerson } from 'react-icons/go';
import { MdOutlineMail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import './accountoverview.css';

export default function AccountOverview() {
    const [user, setUser] = useState(null);
    const [accountID, setAccountID] = useState(0);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeData();
    }, []);

    const getUserData = () => {
        const userData = localStorage.getItem('user');

        if (userData) {
            setAccountID(userData.id);
            return JSON.parse(userData);
        } else {
            throw new Error("User not found in local storage.");
        }   
    };

    const fetchProjects = async (accountID) => {
        try {
            const response = await fetch(`http://localhost:3000/projects/by-account?account_id=${accountID}`);
            const data = await response.json();

            const projectList = (data || []).map((project) => ({
            id: project.id,
            name: project.name || "Unnamed Project",
        }));
            setProjects(projectList);
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

                <button>
                    <IoLockClosedOutline className="lock-icon" />
                    <div className="desc">Change Password</div>
                </button>
            </section>

            <section className="current-projects">
                <h2>Current Projects</h2>

                {projects.length === 0 ? (
                    <p>No projects found yet.</p>
                ) : (
                    <div className="projects-list">
                        {projects.map(project => (
                            <div className="project" key={project.id}>
                                <div className="title">{project.name}</div>
                                <a href="#">View<FaArrowRight className="arrow-icon"/></a>
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