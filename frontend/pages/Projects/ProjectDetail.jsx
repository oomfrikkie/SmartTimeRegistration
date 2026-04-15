import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoHourglass } from "react-icons/go";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getUserFromToken, getAuthHeaders } from "../../src/utils/auth";
import "./projectDetail.css";

export default function ProjectDetail() {
  const { projectId, name } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [userID, setUserID] = useState(null);
  const [budget, setBudget] = useState(null);
  const [subsidy, setSubsidy] = useState(null);
  const [loadingFinancials, setLoadingFinancials] = useState(true);
  

  // Handler for deleting the project
  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}?account_id=${userID}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete project");
      }
      navigate("/projects");
    } catch (err) {
      alert(err.message || "Error deleting project");
    }
  };

  // Handler for completing the project
  const handleCompleteProject = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/complete`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to complete project");
      }
      alert("Project marked as completed.");
      // Optionally, refresh or update UI here
    } catch (err) {
      alert(err.message || "Error completing project");
    }
  };



useEffect(() => {
  fetchCurrentUsersRole();
}, [projectId]);

useEffect(() => {
  
})

const fetchCurrentUsersRole = async () => {
  try {
    const user = getUserFromToken();

    if (!user) {
      throw new Error("No user found in token");
    }

    const accountId = user.id;

    setUserID(accountId);

    const res = await fetch(
      `http://localhost:3000/projects/${projectId}/my-role?account_id=${accountId}`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch role");
    }

    const data = await res.json();

    setCurrentRole(data.role);

    console.log("ROLE:", data.role);
  } catch (err) {
    console.error(err);
  }
};

  const projectName = decodeURIComponent(name);

  useEffect(() => {
    fetchProjectMembers();
  }, [projectId]);

  const fetchProjectMembers = async () => {
  setLoading(true);

  try {
    const res = await fetch(
  `http://localhost:3000/projects/members?project_id=${projectId}`,
  {
    headers: getAuthHeaders()
  }
);

console.log("status:", res.status);

if (!res.ok) {
  const text = await res.text();
  console.log("response text:", text);
  throw new Error("Failed to fetch project members");
}

    const data = await res.json();
    console.log("project members response:", data);

    const memberList = (data || []).map((member) => ({
      id: member.account?.id,
      name: member.account?.name || member.account?.email || "Unknown",
      role: member.roles || "member",
      totalHours: 0,
      assignedHours: member.assigned_hours,
      events: [],
    }));

    setMembers(memberList);
  } catch (err) {
    console.error("Error fetching project members:", err);
    setMembers([]);
  } finally {
    setLoading(false);
  }
};

  const getInitial = (memberName) => {
    return memberName.charAt(0).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ["#ff4f6f", "#9333ea", "#3b82f6", "#f59e0b", "#10b981"];
    return colors[index % colors.length];
  };

  const totalProjectHours = members.reduce(
    (sum, m) => sum + (Number(m.totalHours) || 0),
    0
  );

  const handleExportExcel = () => {
    const rows = [];

    members.forEach((member) => {
      (member.events || []).forEach((event) => {
        rows.push({
          Member: member.name,
          Date: event.date,
          Hours: event.total_hours || event.totalHours || 0,
          Description: event.description || event.name || "",
        });
      });
    });

    if (rows.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, projectName);
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `${projectName}.xlsx`);
  };

  useEffect(() => {
    if (!members.length) return;
    // Fetch total hours for each member
    const fetchAllMemberHours = async () => {
      const updatedMembers = await Promise.all(
        members.map(async (member) => {
          try {
            const res = await fetch(
              `http://localhost:3000/projects/${projectId}/member-hours?account_id=${member.id}`,
              { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error("Failed to fetch member hours");
            const data = await res.json();
            return { ...member, totalHours: data.total_hours };
          } catch (err) {
            console.error(`Error fetching hours for member ${member.id}:`, err);
            return member;
          }
        })
      );
      setMembers(updatedMembers);
    };
    fetchAllMemberHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectBudget();
      fetchProjectSubsidy();
    }
  }, [projectId]);

  const fetchProjectBudget = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/budget`,
        {
          headers: getAuthHeaders()
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch budget");
      }
      const data = await res.json();
      setBudget(data.budget);
    } catch (err) {
      console.error("Error fetching budget:", err);
      setBudget(null);
    } finally {
      setLoadingFinancials(false);
    }
  };

  const fetchProjectSubsidy = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/subsidy`,
        {
          headers: getAuthHeaders()
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch subsidy");
      }
      const data = await res.json();
      setSubsidy(data.subsidy);
    } catch (err) {
      console.error("Error fetching subsidy:", err);
      setSubsidy(null);
    }
  };

  return (
    <div className="project-detail-container">
      <button className="btn-back" onClick={() => navigate("/projects")}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Projects
      </button>

      <h1 className="project-detail-title">{projectName}</h1>
      <p>Budget: { budget } €</p>
      <p>Subsidy: { subsidy } €</p>
      <p className="project-detail-subtitle">
        Project member overview and time tracking
      </p>

      {currentRole === "admin" && (
  <div className="project-actions">
    <button className="action-btn action-export" onClick={handleExportExcel}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
      Export Excel
    </button>

    <button className="action-btn action-overview">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      General Overview
    </button>

    <button className="action-btn action-report">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      In-depth Report
    </button>

    <button
      className="action-btn action-summary"
      onClick={() => setShowSummary(true)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      View Summary
    </button>
  </div>
)}

      <h2 className="members-heading">Project Members</h2>

      {loading ? (
        <div className="members-loading">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="members-empty">No members found for this project.</div>
      ) : (
        <div className="members-grid">
          {members.map((member, index) => (
            <div className="member-card" key={member.id}>
              <div className="member-header">
                <div
                  className="member-avatar"
                  style={{ background: getAvatarColor(index) }}
                >
                  {getInitial(member.name)}
                </div>
                <h3 className="member-name">{member.name}</h3>
              </div>

              <div className="member-hours">
                <svg
                  width="16"
                  height="16"
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
                <span>{member.totalHours} hours logged out of {member.assignedHours} assigned hours</span>
              </div>

              <div className="member-hours">
                <GoHourglass className="member-hourglass-icon"/>
                <span>{Math.floor(member.assignedHours) - Math.floor(member.totalHours)} hours remaining</span>
              </div>

              <button
                className="btn-view-overview"
                onClick={() =>
                  navigate(
                    `/projects/${encodeURIComponent(projectName)}/member/${encodeURIComponent(member.name)}`
                  )
                }
              >
                View Overview
              </button>
            </div>
          ))}
        </div>
      )}

      {showSummary && (
        <div className="summary-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="summary-title">Project Summary</h2>
            <hr className="summary-divider" />
            <h3 className="summary-section-title">Total Hours by Member</h3>

            <div className="summary-members">
              {members.map((member) => (
                <div className="summary-row" key={member.id}>
                  <span className="summary-member-name">{member.name}</span>
                  <span className="summary-member-hours">
                    {Math.round((member.totalHours || 0) * 10) / 10} hours
                  </span>
                </div>
              ))}
            </div>

            <hr className="summary-divider" />

            <div className="summary-total">
              <span>Total Project Hours</span>
              <span className="summary-total-value">
                {Math.round(totalProjectHours * 10) / 10} hours
              </span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-actions">
              <button
                className="btn-close-summary"
                onClick={() => setShowSummary(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    {/* ...existing code... */}
    {/* Admin-only actions at the bottom */}
    {currentRole === "admin" && (
      <div className="project-bottom-actions">
        <button className="action-complete-btn" onClick={handleCompleteProject}>
          Complete Project
        </button>
        <button className="action-delete-btn" onClick={handleDeleteProject}>
          Delete Project
        </button>
      </div>
    )}
    </div>
  );
}