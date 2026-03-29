import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./createproject.css";

function CreateProject() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch users from backend
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  // Filter users (search)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Add member
  const addMember = (user) => {
    if (selectedMembers.find(m => m.id === user.id)) return;
    setSelectedMembers([...selectedMembers, user]);
  };

  // Remove member
  const removeMember = (id) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== id));
  };

  // Create project
  const handleCreateProject = async () => {
    if (!projectName || selectedMembers.length === 0) return;

    try {
        const today = new Date().toISOString().split("T")[0];

        for (const member of selectedMembers) {
        await fetch("http://localhost:3000/event", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            name: "Project Initialization", // required
            project_name: projectName,
            account_id: member.id,

            // required fields 
            date: today,
            start_time: "00:00:00",
            end_time: "00:00:00",
            total_hours: 0,

            // optional (safe defaults)
            package_name: null,
            location: null,
            description: "Project created",
            is_online: false,
            is_series: false,
            attendees: [],
            }),
        });
        }

        navigate("/projects");

    } catch (err) {
        console.error("Error creating project:", err);
    }
  };

  // Disable create button if no name or members
  const isDisabled = !projectName.trim() || selectedMembers.length === 0;

  return (
    <div className="create-project-page">

      <h1>Create New Project</h1>
      <p className="subtitle">
        Set up your project and invite team members
      </p>

      {/* Project Name */}
      <div className="card">
        <label>Project Name</label>
        <input
          type="text"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      {/* Main Section */}
      <div className="project-layout">

        {/* LEFT - USERS */}
        <div className="card">
          <h3>Available Users</h3>

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="user-list">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-item">
                <div>
                  <p>{user.name}</p>
                  <span>{user.email}</span>
                </div>

                <button onClick={() => addMember(user)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - SELECTED */}
        <div className="card">
          <h3>Selected Members ({selectedMembers.length})</h3>

          {selectedMembers.length === 0 ? (
            <p className="empty">No members selected yet</p>
          ) : (
            selectedMembers.map(member => (
              <div key={member.id} className="selected-item">
                <div>
                  <p>{member.name}</p>
                  <span>{member.email}</span>
                </div>

                <button onClick={() => removeMember(member.id)}>
                  ✕
                </button>
              </div>
            ))
          )}

          <button
            className={`create-btn ${ isDisabled ? "disabled" : "" }`}
            onClick={handleCreateProject}
            disabled={isDisabled}
          >
            Create Project
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateProject;