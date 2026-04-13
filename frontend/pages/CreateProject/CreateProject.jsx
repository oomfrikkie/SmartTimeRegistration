import { getUserFromToken } from "../../src/utils/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../src/utils/auth";
import "./createproject.css";

function CreateProject() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/account/all", {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Filter users (search)
  const filteredUsers = users
    .filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(user => !selectedMembers.find(m => m.id === user.id));

  // Add member
  const addMember = (user) => {
    setSelectedMembers(prev => {
      if (prev.find(m => m.id === user.id)) return prev;
      return [...prev, user];
    });
  };

  // Remove member
  const removeMember = (id) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMemberHours = (id, value) => {
    const hours = parseFloat(value) || 0;

    setSelectedMembers(prev =>
      prev.map(m =>
        m.id === id ? { ...m, assignedHours: hours } : m
      )
    );
  };

  // Create project
  const handleCreateProject = async () => {
    if (!projectName || selectedMembers.length === 0) return;

    setCreating(true);

    try {
      const user = getUserFromToken();
      if (!user) return;

      // 1. Create the project
      const projectRes = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify({
          name: projectName,
          account_id: user.id,
          total_hours: parseFloat(totalHours),
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!projectRes.ok) {
        console.error("Failed to create project");
        return;
      }

      const { project } = await projectRes.json();
      
      // 2. Send invitations to selected members
      const inviteRes = await fetch("http://localhost:3000/invitation/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify({
          projectId: Number(project.id),
          invitees: selectedMembers.map((m) => ({
            id: m.id,
            assigned_hours: m.assignedHours,
          })),
        }),
      });
      console.log("invite status:", inviteRes.status, await inviteRes.clone().text());

      setProjectName("");
      setSelectedMembers([]);
      setSearch("");

      navigate("/projects");
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setCreating(false);
    }
  };

  const totalAssigned = selectedMembers.reduce(
    (sum, m) => sum + (m.assignedHours || 0),
    0
  );

  const isHoursValid =
    totalHours > 0;
  
  const isDateValid =
    startDate && endDate && new Date(endDate) >= new Date(startDate);

  const isDisabled =
    !projectName.trim() ||
    selectedMembers.length === 0 ||
    !isHoursValid ||
    !isDateValid ||
    !startDate ||
    !endDate;

  console.log("isDisabled debug", {
    projectName: projectName.trim(),
    memberCount: selectedMembers.length,
    totalAssigned,
    parsedTotalHours: parseFloat(totalHours),
    diff: Math.abs(totalAssigned - parseFloat(totalHours)),
    isHoursValid,
    isDateValid,
    startDate,
    endDate,
  });

  return (
    <div className="create-project-page">
      <div>
          <button className="btn-back" onClick={() => navigate("/projects")}>
            &larr; Back to Projects
          </button>
      </div>

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

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>Total Project Hours</label>
        <input
          type="number"
          placeholder="Enter total hours"
          value={totalHours}
          onChange={(e) => setTotalHours(e.target.value)}
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

                  <input
                    type="number"
                    placeholder="Assigned hours"
                    value={member.assignedHours || ""}
                    onChange={(e) => updateMemberHours(member.id, e.target.value)}
                  />
                </div>

                <button className="btn-delete" onClick={() => removeMember(member.id)}>
                  ✕
                </button>
                
              </div>
            ))
          )}

          <button
            className={`create-btn ${isDisabled ? "disabled" : ""}`}
            onClick={handleCreateProject}
            disabled={isDisabled || creating}
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateProject;