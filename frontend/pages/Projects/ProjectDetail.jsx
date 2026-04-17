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
  const [workPackages, setWorkPackages] = useState([]);
  // Add Work Package modal state
  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);
  const [newWorkPackageName, setNewWorkPackageName] = useState("");
  const [newWorkPackageHours, setNewWorkPackageHours] = useState("");
  const [addingWorkPackage, setAddingWorkPackage] = useState(false);
  const [addWorkPackageError, setAddWorkPackageError] = useState("");

  // Add Work Package handler
  const handleAddWorkPackage = async () => {
    const trimmedName = newWorkPackageName.trim();
    const parsedHours = parseFloat(newWorkPackageHours);
    setAddWorkPackageError("");
    if (!trimmedName || !Number.isFinite(parsedHours) || parsedHours <= 0) {
      setAddWorkPackageError("Please enter a valid name and hours.");
      return;
    }
    setAddingWorkPackage(true);
    try {
      const res = await fetch("http://localhost:3000/work-packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
          total_hours: parsedHours,
          projectId: Number(projectId),
        }),
      });
      if (!res.ok) {
        setAddWorkPackageError("Failed to add work package.");
        return;
      }
      setNewWorkPackageName("");
      setNewWorkPackageHours("");
      setShowAddWorkPackageModal(false);
      fetchWorkPackages();
    } catch (err) {
      setAddWorkPackageError("Error adding work package.");
    } finally {
      setAddingWorkPackage(false);
    }
  };
  const [loadingWorkPackages, setLoadingWorkPackages] = useState(true);
  const [selectedWorkPackage, setSelectedWorkPackage] = useState(null);
  const [assigningMemberIds, setAssigningMemberIds] = useState([]);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [loadingAvailableAccounts, setLoadingAvailableAccounts] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState([]);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [sendingInvitations, setSendingInvitations] = useState(false);

  const fetchWorkPackages = async () => {
    setLoadingWorkPackages(true);

    try {
      const res = await fetch(
        `http://localhost:3000/work-packages/project/${projectId}`,
        {
          headers: getAuthHeaders()
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch work packages");
      }
      const data = await res.json();
      setWorkPackages(data || []);
      return data || [];
    } catch (err) {
      console.error("Error fetching work packages:", err);
      setWorkPackages([]);
      return [];
    } finally {
      setLoadingWorkPackages(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWorkPackages();
    }
  }, [projectId]);

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

  const memberIds = new Set(members.map((member) => member.id));

  const inviteableAccounts = availableAccounts.filter((account) => {
    if (memberIds.has(account.id) || account.id === userID) {
      return false;
    }

    const searchValue = inviteSearch.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      account.name.toLowerCase().includes(searchValue) ||
      account.email.toLowerCase().includes(searchValue)
    );
  });

  const fetchAvailableAccounts = async () => {
    setLoadingAvailableAccounts(true);

    try {
      const res = await fetch("http://localhost:3000/account/all", {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch available accounts");
      }

      const data = await res.json();
      setAvailableAccounts(data || []);
    } catch (err) {
      console.error("Error fetching available accounts:", err);
      setInviteError(err.message || "Failed to load accounts");
      setAvailableAccounts([]);
    } finally {
      setLoadingAvailableAccounts(false);
    }
  };

  const openInviteMembersModal = async () => {
    setShowInviteModal(true);
    setInviteError("");
    setInviteSuccess("");
    setInviteSearch("");
    setSelectedInvitees([]);
    await fetchAvailableAccounts();
  };

  const closeInviteMembersModal = () => {
    setShowInviteModal(false);
    setInviteSearch("");
    setSelectedInvitees([]);
    setInviteError("");
    setInviteSuccess("");
  };

  const isInviteeSelected = (accountId) => {
    return selectedInvitees.some((invitee) => invitee.id === accountId);
  };

  const toggleInvitee = (account) => {
    setSelectedInvitees((currentInvitees) => {
      if (currentInvitees.some((invitee) => invitee.id === account.id)) {
        return currentInvitees.filter((invitee) => invitee.id !== account.id);
      }

      return [
        ...currentInvitees,
        {
          id: account.id,
          name: account.name,
          email: account.email,
          assignedHours: "",
        },
      ];
    });
  };

  const updateInviteeAssignedHours = (accountId, value) => {
    setSelectedInvitees((currentInvitees) =>
      currentInvitees.map((invitee) =>
        invitee.id === accountId
          ? { ...invitee, assignedHours: value }
          : invitee
      )
    );
  };

  const handleSendInvitations = async () => {
    if (!selectedInvitees.length) {
      setInviteError("Select at least one account to invite.");
      return;
    }

    setInviteError("");
    setInviteSuccess("");
    setSendingInvitations(true);

    try {
      const res = await fetch("http://localhost:3000/invitation/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          invitees: selectedInvitees.map((invitee) => ({
            id: invitee.id,
            assigned_hours:
              invitee.assignedHours === ""
                ? undefined
                : Number(invitee.assignedHours),
          })),
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to send invitations";

        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();
      const sentCount = Array.isArray(result) ? result.length : selectedInvitees.length;

      setInviteSuccess(
        sentCount === 0
          ? "No invitations were sent. Those accounts may already be members or already have pending invitations."
          : `${sentCount} invitation${sentCount === 1 ? "" : "s"} sent successfully.`
      );
      setSelectedInvitees([]);
      await fetchAvailableAccounts();
    } catch (err) {
      setInviteError(err.message || "Failed to send invitations");
    } finally {
      setSendingInvitations(false);
    }
  };

  const closeAssignMembersModal = () => {
    setSelectedWorkPackage(null);
    setAssigningMemberIds([]);
    setAssignmentError("");
    setAssignmentSuccess("");
  };

  const openAssignMembersModal = (workPackage) => {
    setSelectedWorkPackage(workPackage);
    setAssignmentError("");
    setAssignmentSuccess("");
  };

  const isMemberAssignedToWorkPackage = (workPackage, memberId) => {
    return (workPackage?.assignedMembers || []).some((member) => member.id === memberId);
  };

  const handleAssignMemberToWorkPackage = async (member) => {
    if (!selectedWorkPackage) {
      return;
    }

    setAssignmentError("");
    setAssignmentSuccess("");
    setAssigningMemberIds((currentIds) => [...currentIds, member.id]);

    try {
      const res = await fetch(
        `http://localhost:3000/work-packages/${selectedWorkPackage.id}/assign-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ accountId: member.id }),
        }
      );

      if (!res.ok) {
        let errorMessage = "Failed to assign member to work package";

        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const updatedWorkPackages = await fetchWorkPackages();
      const updatedSelection = updatedWorkPackages.find(
        (workPackage) => workPackage.id === selectedWorkPackage.id
      );

      if (updatedSelection) {
        setSelectedWorkPackage(updatedSelection);
      }

      setAssignmentSuccess(
        `${member.name} was assigned to ${selectedWorkPackage.name}.`
      );
    } catch (err) {
      setAssignmentError(err.message || "Failed to assign member to work package");
    } finally {
      setAssigningMemberIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== member.id)
      );
    }
  };

  const handleExportExcel = async () => {
    const rowsByPackage = {};

    const getPackageNumber = (pkg) => {
      if (!pkg) return 9999;
      const match = pkg.match(/\d+/);
      return match ? parseInt(match[0], 10) : 9999;
    };

    const normalizePackageKey = (pkg) => {
      if (!pkg) return "no-package";
      const match = pkg.match(/\d+/);
      return match ? `WP${match[0]}` : pkg.trim();
    };

    for (const member of members) {
      try {
        const res = await fetch(
          `http://localhost:3000/projects/${projectId}/member-events?account_id=${member.id}`,
          { headers: getAuthHeaders() }
        );
        if (!res.ok) continue;
        const events = await res.json();
        events.forEach((event) => {
          const key = normalizePackageKey(event.package_name);
          if (!rowsByPackage[key]) {
            rowsByPackage[key] = [];
          }
          rowsByPackage[key].push({
            Member: member.name,
            Date: event.date,
            "Event Name": event.name,
            "Start Time": event.start_time,
            "End Time": event.end_time,
            Hours: Number(event.total_hours) || 0,
            Description: event.description || "",
          });
        });
      } catch (err) {
        console.error(`Error fetching events for member ${member.name}:`, err);
      }
    }

    if (Object.keys(rowsByPackage).length === 0) {
      alert("No time entries found for this project.");
      return;
    }

    const wb = XLSX.utils.book_new();
    Object.entries(rowsByPackage)
      .sort(([a], [b]) => getPackageNumber(a) - getPackageNumber(b))
      .forEach(([sheetName, rows]) => {
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      });

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
      {/* Add Work Package Modal */}
      {showAddWorkPackageModal && (
        <div className="summary-overlay" onClick={() => setShowAddWorkPackageModal(false)}>
          <div className="summary-modal" onClick={e => e.stopPropagation()}>
            <h2 className="summary-title">Add Work Package</h2>
            <div className="create-work-package">
              <input
                type="text"
                placeholder="Work package name"
                className="work-package-name"
                value={newWorkPackageName}
                onChange={e => setNewWorkPackageName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Work package hours"
                className="work-package-hours"
                value={newWorkPackageHours}
                onChange={e => setNewWorkPackageHours(e.target.value)}
              />
            </div>
            {addWorkPackageError && (
              <div className="assignment-feedback assignment-feedback-error">
                {addWorkPackageError}
              </div>
            )}
            <div className="summary-actions">
              <button
                className="action-btn action-overview"
                onClick={handleAddWorkPackage}
                disabled={addingWorkPackage}
              >
                {addingWorkPackage ? "Adding..." : "Add Work Package"}
              </button>
              <button
                className="btn-close-summary"
                onClick={() => setShowAddWorkPackageModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
      <p>Budget: {budget} €</p>
      <p>Subsidy: {subsidy} €</p>
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
          <button className="action-btn action-overview" onClick={() => setShowAddWorkPackageModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Work Package
          </button>
          <button className="action-btn action-overview" onClick={openInviteMembersModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Invite Members
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
                <GoHourglass className="member-hourglass-icon" />
                <span>{Math.floor(member.assignedHours) - Math.floor(member.totalHours)} hours remaining</span>
              </div>
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

      <div className="work-packages-section">
        <h2 className="members-heading">Work Packages</h2>

        {loadingWorkPackages ? (
          <div className="members-loading">Loading work packages...</div>
        ) : workPackages.length === 0 ? (
          <div className="work-packages-empty">
            <p>No work packages created yet.</p>
          </div>
        ) : (
          <div className="work-packages-list">
            {workPackages.map((workPackage, wpIndex) => (
              <div key={workPackage.id} className="work-package-container">
                <div className="work-package-header">
                  <div
                    className="work-package-icon"
                    style={{ background: getAvatarColor(wpIndex) }}
                  >
                    {workPackage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="work-package-title">
                    <h3>{workPackage.name}</h3>
                    <span className="work-package-total-hours">
                      {workPackage.total_hours} hours allocated
                    </span>
                  </div>
                  {currentRole === "admin" && (
                    <button
                      className="btn-assign-members-workpackage"
                      onClick={() => openAssignMembersModal(workPackage)}
                    >
                      Assign Members
                    </button>
                  )}
                </div>

                <div className="work-package-members">
                  <p className="work-package-members-title">Assigned Members</p>

                  {(workPackage.assignedMembers || []).length === 0 ? (
                    <p className="no-members-message">No members assigned yet</p>
                  ) : (
                    <div className="work-package-members-grid">
                      {(workPackage.assignedMembers || []).map((assignedMember) => (
                        <div
                          key={`${workPackage.id}-${assignedMember.id}`}
                          className="work-package-member-chip"
                        >
                          <span className="work-package-member-chip-name">
                            {assignedMember.name}
                          </span>
                          <span className="work-package-member-chip-role">
                            {assignedMember.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedWorkPackage && (
        <div
          className="summary-overlay"
          onClick={closeAssignMembersModal}
        >
          <div
            className="summary-modal assignment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="summary-title">Assign Members</h2>
            <p className="assignment-modal-subtitle">
              Choose project members to assign to {selectedWorkPackage.name}.
            </p>

            {assignmentError && (
              <div className="assignment-feedback assignment-feedback-error">
                {assignmentError}
              </div>
            )}

            {assignmentSuccess && (
              <div className="assignment-feedback assignment-feedback-success">
                {assignmentSuccess}
              </div>
            )}

            <div className="assignment-member-list">
              {members.map((member) => {
                const isAssigned = isMemberAssignedToWorkPackage(
                  selectedWorkPackage,
                  member.id
                );
                const isAssigning = assigningMemberIds.includes(member.id);

                return (
                  <div className="assignment-member-row" key={member.id}>
                    <div className="assignment-member-info">
                      <span className="assignment-member-name">{member.name}</span>
                      <span className="assignment-member-meta">
                        {member.role} · {member.assignedHours} assigned hours
                      </span>
                    </div>

                    <button
                      className="btn-assign-member"
                      disabled={isAssigned || isAssigning}
                      onClick={() => handleAssignMemberToWorkPackage(member)}
                    >
                      {isAssigned
                        ? "Assigned"
                        : isAssigning
                          ? "Assigning..."
                          : "Assign to Work Package"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="summary-actions">
              <button
                className="btn-close-summary"
                onClick={closeAssignMembersModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="summary-overlay" onClick={closeInviteMembersModal}>
          <div
            className="summary-modal invite-members-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="summary-title">Invite Members</h2>
            <p className="assignment-modal-subtitle">
              Invite people from the account database to join {projectName}.
            </p>

            <input
              className="invite-members-search"
              type="text"
              placeholder="Search by name or email"
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
            />

            {inviteError && (
              <div className="assignment-feedback assignment-feedback-error">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="assignment-feedback assignment-feedback-success">
                {inviteSuccess}
              </div>
            )}

            <div className="invite-members-layout">
              <div className="invite-members-list">
                {loadingAvailableAccounts ? (
                  <p className="no-members-message">Loading accounts...</p>
                ) : inviteableAccounts.length === 0 ? (
                  <p className="no-members-message">No inviteable accounts found.</p>
                ) : (
                  inviteableAccounts.map((account) => {
                    const selected = isInviteeSelected(account.id);

                    return (
                      <button
                        type="button"
                        key={account.id}
                        className={`invite-account-row${selected ? " is-selected" : ""}`}
                        onClick={() => toggleInvitee(account)}
                      >
                        <div className="invite-account-info">
                          <span className="invite-account-name">{account.name}</span>
                          <span className="invite-account-email">{account.email}</span>
                        </div>
                        <span className="invite-account-action">
                          {selected ? "Selected" : "Select"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="invite-selection-panel">
                <h3 className="invite-selection-title">Selected Invitees</h3>

                {selectedInvitees.length === 0 ? (
                  <p className="no-members-message">No accounts selected yet.</p>
                ) : (
                  <div className="invite-selection-list">
                    {selectedInvitees.map((invitee) => (
                      <div key={invitee.id} className="invite-selection-row">
                        <div className="invite-account-info">
                          <span className="invite-account-name">{invitee.name}</span>
                          <span className="invite-account-email">{invitee.email}</span>
                        </div>

                        <input
                          type="number"
                          min="0"
                          className="invite-hours-input"
                          placeholder="Assigned hours"
                          value={invitee.assignedHours}
                          onChange={(e) =>
                            updateInviteeAssignedHours(invitee.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="summary-actions">
              <button
                className="action-btn action-overview invite-submit-btn"
                onClick={handleSendInvitations}
                disabled={sendingInvitations}
              >
                {sendingInvitations ? "Sending..." : "Send Invitations"}
              </button>
              <button
                className="btn-close-summary"
                onClick={closeInviteMembersModal}
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