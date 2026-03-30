import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./projectDetail.css";

export default function ProjectDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const projectName = decodeURIComponent(name);

  useEffect(() => {
    fetchProjectMembers();
  }, [name]);

  const fetchProjectMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/event?account_id=1");
      const events = await res.json();

      // Filter events for this project and group by member
      const memberMap = {};
      (events || []).forEach((event) => {
        const evtProject = event.project_name || event.name || "Unnamed Project";
        if (evtProject !== projectName) return;

        const memberName = event.account?.name || event.account?.email || "Unknown";
        const memberId = event.account?.id || memberName;

        if (!memberMap[memberId]) {
          memberMap[memberId] = {
            id: memberId,
            name: memberName,
            totalHours: 0,
            events: [],
          };
        }
        memberMap[memberId].totalHours += parseFloat(event.total_hours || 0);
        memberMap[memberId].events.push(event);
      });

      setMembers(Object.values(memberMap));
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
    setLoading(false);
  };

  const getInitial = (memberName) => {
    return memberName.charAt(0).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ["#ff4f6f", "#9333ea", "#3b82f6", "#f59e0b", "#10b981"];
    return colors[index % colors.length];
  };

  const totalProjectHours = members.reduce((sum, m) => sum + m.totalHours, 0);

  const handleExportExcel = () => {
    const rows = [];
    members.forEach((member) => {
      member.events.forEach((event) => {
        rows.push({
          Member: member.name,
          Date: event.date,
          Hours: event.total_hours,
          Description: event.description || event.name,
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

  return (
    <div className="project-detail-container">
      <button className="btn-back" onClick={() => navigate("/projects")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Projects
      </button>

      <h1 className="project-detail-title">{projectName}</h1>
      <p className="project-detail-subtitle">Project member overview and time tracking</p>

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
        <button className="action-btn action-summary" onClick={() => setShowSummary(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          View Summary
        </button>
      </div>

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{Math.round(member.totalHours * 10) / 10} hours</span>
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

      {/* Summary Modal */}
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
                    {Math.round(member.totalHours * 10) / 10} hours
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
              <button className="btn-close-summary" onClick={() => setShowSummary(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
