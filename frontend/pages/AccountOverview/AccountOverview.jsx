import { useState } from 'react';
import './accountoverview.css';

export default function AccountOverview() {
    const [account, setAccount] = useState(null);

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
                        <div className="icon">O</div>
                        <div className="info">
                            <div className="text">Name</div>
                            <div className="account-name">John</div> {/*Must be rendered dynamically*/}
                        </div>
                    </div>
                    <div className="surname">
                        <div className="icon">O</div>
                        <div className="info">
                            <div className="text">Surname</div>
                            <div className="account-surname">Doe</div> {/*Must be rendered dynamically*/}
                        </div>
                    </div>
                    <div className="email">
                        <div className="icon">O</div>
                        <div className="info">
                            <div className="text">Email</div>
                            <div className="account-email">john.doe@example.com</div> {/*Must be rendered dynamically*/}
                        </div>
                    </div>
                </div>

                <button>
                    <div className="icon">O</div>
                    <div className="desc">Change Password</div>
                </button>
            </section>

            <section className="current-projects">
                <h2>Current Projects</h2>
                <div className="project"> {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                    <div className="info">
                        <div className="title">Website Redesign</div>
                        <div className="desc">Developer</div>
                    </div>
                    <a href="#">View</a>
                </div>  

                <div className="project"> {/*Must be rendered dynamically. Use the API for the projects to retrieve info*/}
                    <div className="info">
                        <div className="title">Mobile App Development</div>
                        <div className="desc">Team lead</div>
                    </div>
                    <a href="#">View</a>
                </div>  
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

