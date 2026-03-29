import { useState } from "react";
import "./createproject.css";

const mockUsers = [
  { id: 1, name: "Bob Johnson", email: "bob@example.com" },
  { id: 2, name: "Dylan Smith", email: "dylan@example.com" },
  { id: 3, name: "Sarah Williams", email: "sarah@example.com" },
  { id: 4, name: "Mike Davis", email: "mike@example.com" },
  { id: 5, name: "Emma Wilson", email: "emma@example.com" },
];

function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState("");

  // Add member
  const handleAdd = (user) => {
    if (!selectedMembers.find((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  // Remove member
  const handleRemove = (id) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== id));
  };

  // Filter users
  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">

      {/* Header */}
      <div className="create-header">
        <div>
          <h1>Create New Project</h1>
          <p>Set up your project and invite team members</p>
        </div>
      </div>

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

      {/* Main Layout */}
      <div className="create-layout">

        {/* LEFT: Users */}
        <div className="card users-box">
          <h3>Available Users</h3>

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="user-list">
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-item">
                <div>
                  <p>{user.name}</p>
                  <span>{user.email}</span>
                </div>

                <button onClick={() => handleAdd(user)}>Add</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Selected */}
        <div className="card selected-box">
          <h3>Selected Members ({selectedMembers.length})</h3>

          {selectedMembers.length === 0 ? (
            <p>No members selected yet</p>
          ) : (
            <div className="selected-list">
              {selectedMembers.map((member) => (
                <div key={member.id} className="selected-item">
                  <div>
                    <p>{member.name}</p>
                    <span>{member.email}</span>
                  </div>

                  <button onClick={() => handleRemove(member.id)}>X</button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-full"
            disabled={selectedMembers.length === 0 || !projectName}
          >
            Create Project
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateProject;