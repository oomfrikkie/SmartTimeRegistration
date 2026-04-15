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
  const [budget, setBudget] = useState("");
  const [subsidy, setSubsidy] = useState("");
  const [workPackageName, setWorkPackageName] = useState("");
  const [workPackageHours, setWorkPackageHours] = useState("");
  const [workPackages, setWorkPackages] = useState([]);

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

  const addWorkPackage = () => {
    const trimmedName = workPackageName.trim();
    const parsedHours = parseFloat(workPackageHours);

    if (!trimmedName || !Number.isFinite(parsedHours) || parsedHours <= 0) {
      return;
    }

    setWorkPackages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        name: trimmedName,
        total_hours: parsedHours,
      },
    ]);

    setWorkPackageName("");
    setWorkPackageHours("");
  };

  const removeWorkPackage = (id) => {
    setWorkPackages((prev) => prev.filter((workPackage) => workPackage.id !== id));
  };

  // Create project
  const handleCreateProject = async (event) => {
    event?.preventDefault();

    if (!projectName || selectedMembers.length === 0) return;

    try {
      const user = getUserFromToken();
      if (!user) {
        console.error("No authenticated user found in token");
        return;
      }

      setCreating(true);

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
  budget: parseFloat(budget),
  subsidy: parseFloat(subsidy),
}),
      });

      if (!projectRes.ok) {
        console.error("Failed to create project", projectRes.status, await projectRes.clone().text());
        return;
      }

      const { project } = await projectRes.json();

      if (workPackages.length > 0) {
        const workPackageResponses = await Promise.all(
          workPackages.map((workPackage) =>
            fetch("http://localhost:3000/work-packages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              credentials: "include",
              body: JSON.stringify({
                name: workPackage.name,
                total_hours: workPackage.total_hours,
                projectId: Number(project.id),
              }),
            })
          )
        );

        const failedWorkPackageResponse = workPackageResponses.find(
          (response) => !response.ok
        );

        if (failedWorkPackageResponse) {
          console.error(
            "Failed to create work package",
            failedWorkPackageResponse.status,
            await failedWorkPackageResponse.clone().text()
          );
          return;
        }
      }

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
      setStartDate("");
      setEndDate("");
      setTotalHours("");
      setBudget("");
      setSubsidy("");
      setWorkPackageName("");
      setWorkPackageHours("");
      setWorkPackages([]);

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

  const parsedTotalHours = parseFloat(totalHours);
  const parsedBudget = parseFloat(budget);
  const parsedSubsidy = parseFloat(subsidy);
  const hasAssignedHours = selectedMembers.every(
    (member) => Number(member.assignedHours) > 0
  );

  const isHoursValid =
    Number.isFinite(parsedTotalHours) && parsedTotalHours > 0;

  const isBudgetValid =
    Number.isFinite(parsedBudget) && parsedBudget >= 0;

  const isSubsidyValid =
    Number.isFinite(parsedSubsidy) && parsedSubsidy >= 0;

  const isDateValid =
    startDate && endDate && new Date(endDate) >= new Date(startDate);

  const isDisabled =
    !projectName.trim() ||
    selectedMembers.length === 0 ||
    !isHoursValid ||
    !isBudgetValid ||
    !isSubsidyValid ||
    !isDateValid ||
    !startDate ||
    !endDate;

  console.log("isDisabled debug", {
    projectName: projectName.trim(),
    memberCount: selectedMembers.length,
    totalAssigned,
    parsedTotalHours,
    parsedBudget,
    parsedSubsidy,
    diff: Math.abs(totalAssigned - parsedTotalHours),
    isHoursValid,
    isBudgetValid,
    isSubsidyValid,
    isDateValid,
    hasAssignedHours,
    workPackageCount: workPackages.length,
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

        <label>Project Budget €</label>
        <input
          type="number"
          placeholder="Enter the € budget amount of the project"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <label>Project Subsidy €</label>
        <input
          type="number"
          placeholder="Enter the € subsidy amount of the project"
          value={subsidy}
          onChange={(e) => setSubsidy(e.target.value)}
        />

        <label>Create Work Packages</label>
        <div className="create-work-package">
          <input
            type="text"
            placeholder="Enter the name of this work package"
            className="work-package-name"
            value={workPackageName}
            onChange={(e) => setWorkPackageName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Work package hours"
            className="work-package-hours"
            value={workPackageHours}
            onChange={(e) => setWorkPackageHours(e.target.value)}
          />
          <button type="button" className="submit-work-package" onClick={addWorkPackage}>
            Create
          </button>
        </div>

        {workPackages.length > 0 && (
          <div className="work-package-list">
            {workPackages.map((workPackage) => (
              <div key={workPackage.id} className="work-package-item">
                <div>
                  <p>{workPackage.name}</p>
                  <span>{workPackage.total_hours} hours</span>
                </div>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => removeWorkPackage(workPackage.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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

                <button type="button" onClick={() => addMember(user)}>
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

                <button type="button" className="btn-delete" onClick={() => removeMember(member.id)}>
                  ✕
                </button>

              </div>
            ))
          )}

          <button
            type="button"
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