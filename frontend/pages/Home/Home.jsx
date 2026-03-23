import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./home.css";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [icsUrl, setIcsUrl] = useState("");
  const [importStartDate, setImportStartDate] = useState("");
  const [importEndDate, setImportEndDate] = useState("");
  const [importing, setImporting] = useState(false);

  const accountId = 1; // TODO: Get from session/context

  useEffect(() => {
    fetchEvents();
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await fetch("http://localhost:3000/account/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      }
    } catch (error) {
      console.error("Error fetching account:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/event?account_id=${accountId}`);
      const data = await res.json();
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };

  // Filter events by date range
  const filteredEvents = events.filter((event) => {
    if (!startDate && !endDate) return true;
    const eventDate = new Date(event.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && eventDate < start) return false;
    if (end && eventDate > end) return false;
    return true;
  });

  // Calculate statistics
  const totalHours = events.reduce((sum, e) => sum + parseFloat(e.total_hours || 0), 0);

  // Extract projects from event names (e.g., "Admin - Task" -> "Admin")
  const projects = [...new Set(events.map((e) => e.name.split(" - ")[0]))];
  const activeProjects = projects.length;

  // Pending events: events from today onwards
  const today = new Date().toISOString().split("T")[0];
  const pendingEvents = events.filter((e) => e.date >= today).length;

  // Hours distribution per project
  const hoursPerProject = {};
  events.forEach((event) => {
    const project = event.name.split(" - ")[0];
    hoursPerProject[project] = (hoursPerProject[project] || 0) + parseFloat(event.total_hours || 0);
  });

  // Detect time overlaps (conflicts)
  const conflicts = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const e1 = events[i];
      const e2 = events[j];
      if (e1.date === e2.date) {
        const start1 = timeToMinutes(e1.start_time);
        const end1 = timeToMinutes(e1.end_time);
        const start2 = timeToMinutes(e2.start_time);
        const end2 = timeToMinutes(e2.end_time);

        if ((start1 < end2 && end1 > start2)) {
          conflicts.push({
            event1: e1.name,
            event2: e2.name,
            date: e1.date,
            time: `${e1.start_time} - ${e1.end_time}`,
          });
        }
      }
    }
  }

  // Sort events by date descending (newest first)
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleExportExcel = () => {
    const contactName = account ? `${account.name} ${account.surname}` : "";
    const periodeStr =
      startDate && endDate
        ? `${formatDateDutch(startDate)} t/m ${formatDateDutch(endDate)}`
        : startDate
        ? `Vanaf ${formatDateDutch(startDate)}`
        : endDate
        ? `t/m ${formatDateDutch(endDate)}`
        : "";
    const jaar =
      startDate
        ? new Date(startDate).getFullYear()
        : sortedEvents.length > 0
        ? new Date(sortedEvents[sortedEvents.length - 1].date).getFullYear()
        : new Date().getFullYear();

    const thinBorder = {
      top: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
    const grayFill = { fgColor: { rgb: "D9D9D9" }, patternType: "solid" };

    const wsData = [
      ["Konnect", "", "", "", "Paraaf werknemer"],
      ["", "", "", "", ""],
      ["Urenadministratie", "", "", "", "Paraaf verantwoordelijke"],
      [],
      ["Contactpersoon:", contactName],
      ["Periode:", periodeStr],
      ["Jaar:", String(jaar)],
      [],
      ["Datum", "Werkzaamheden", "Werkpakket", "Uren\nIn rekening"],
    ];

    sortedEvents.forEach((e) => {
      wsData.push([
        `Week ${getISOWeek(e.date)}`,
        e.name ?? "",
        e.package_name ?? (typeof e.name === "string" ? e.name.split(" - ")[0] : ""),
        parseFloat(e.total_hours || 0),
      ]);
    });

    const totalHoursExport = sortedEvents.reduce((sum, e) => sum + parseFloat(e.total_hours || 0), 0);
    wsData.push(["", "", "TOTAAL", totalHoursExport]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [{ wch: 16 }, { wch: 45 }, { wch: 40 }, { wch: 14 }, { wch: 22 }];
    ws["!rows"] = wsData.map(() => ({}));
    ws["!rows"][8] = { hpt: 30 };

    // Header block styles
    setCellStyle(ws, 0, 0, { font: { bold: true, sz: 13 } });
    setCellStyle(ws, 0, 4, { font: { bold: true } });
    setCellStyle(ws, 1, 4, { border: thinBorder });
    setCellStyle(ws, 2, 0, { font: { bold: true, underline: true } });
    setCellStyle(ws, 2, 4, { font: { bold: true } });
    setCellStyle(ws, 3, 4, { border: thinBorder });
    setCellStyle(ws, 4, 0, { font: { bold: true } });
    setCellStyle(ws, 5, 0, { font: { bold: true } });
    setCellStyle(ws, 6, 0, { font: { bold: true } });

    // Table header row (row 8)
    for (let col = 0; col < 4; col++) {
      setCellStyle(ws, 8, col, {
        font: { bold: true },
        fill: grayFill,
        border: thinBorder,
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
      });
    }

    // Data rows
    const dataStart = 9;
    sortedEvents.forEach((_, rowIdx) => {
      for (let col = 0; col < 4; col++) {
        setCellStyle(ws, dataStart + rowIdx, col, {
          border: thinBorder,
          alignment: col === 3 ? { horizontal: "center" } : { horizontal: "left" },
        });
      }
    });

    // Total row
    const totalRowIdx = dataStart + sortedEvents.length;
    setCellStyle(ws, totalRowIdx, 2, { font: { bold: true }, border: thinBorder, alignment: { horizontal: "center" } });
    setCellStyle(ws, totalRowIdx, 3, { font: { bold: true }, border: thinBorder, alignment: { horizontal: "center" } });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Urenadministratie");

    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    saveAs(new Blob([arrayBuffer], { type: "application/octet-stream" }), `urenadministratie-${stamp}.xlsx`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-title">
          <h1>Welcome back</h1>
          <p>Here is your productivity overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#e8e9ff" }}></div>
          <div className="stat-content">
            <p className="stat-label">Total Hours</p>
            <h2 className="stat-value">{totalHours.toFixed(1)}</h2>
            <span className="stat-subtext">hours</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#ffe8e8" }}></div>
          <div className="stat-content">
            <p className="stat-label">Active Projects</p>
            <h2 className="stat-value">{activeProjects}</h2>
            <span className="stat-subtext">projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#e8f5ff" }}></div>
          <div className="stat-content">
            <p className="stat-label">Pending Events</p>
            <h2 className="stat-value">{pendingEvents}</h2>
            <span className="stat-subtext">events</span>
          </div>
        </div>
      </div>

      <div className="home-content">
        {/* Left Section */}
        <div className="left-section">
          {/* Hours Distribution Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Hours Distribution</h3>
              <p>Time allocation per project</p>
            </div>
            <div className="chart-container">
              {projects.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>No projects yet</p>
              ) : (
                projects.map((project) => {
                  const hours = hoursPerProject[project];
                  const maxHours = Math.max(...Object.values(hoursPerProject));
                  const percentage = (hours / maxHours) * 100;
                  return (
                    <div key={project} className="chart-row">
                      <div className="chart-label">{project}</div>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="chart-value">{hours.toFixed(1)}h</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Conflict Logs */}
          {conflicts.length > 0 && (
            <div className="conflict-card">
              <h3>{conflicts.length} Conflict Logs</h3>
              <p>Requires attention</p>
              <div className="conflict-list">
                {conflicts.slice(0, 3).map((conflict, idx) => (
                  <div key={idx} className="conflict-item">
                    <span className="conflict-badge"></span>
                    <div>
                      <p className="conflict-title">{conflict.event1} vs {conflict.event2}</p>
                      <p className="conflict-time">{conflict.date} at {conflict.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="right-section">
          {/* Date Range Filter */}
          <div className="filter-card">
            <h3>Filter Events</h3>
            <div className="filter-inputs">
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn-clear" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Past Events */}
          <div className="events-card">
            <div className="events-header">
              <h3>Past Events</h3>
              <div className="events-actions">
                <span className="event-count">{sortedEvents.length} Total</span>
                <button
                  type="button"
                  className="btn-export"
                  onClick={handleExportExcel}
                  disabled={sortedEvents.length === 0}
                  title={sortedEvents.length === 0 ? "No events to export" : "Export to Excel"}
                >
                  Export Excel
                </button>
              </div>
            </div>
            <p className="events-subtext">Work logs from calendar</p>
            <div className="events-list">
              {loading ? (
                <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>
              ) : sortedEvents.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>No events found</p>
              ) : (
                sortedEvents.map((event, idx) => (
                  <div key={idx} className="event-item">
                    <div className="event-info">
                      <p className="event-name">{event.name}</p>
                      <p className="event-time">
                        {event.date} {event.start_time} - {event.end_time}
                      </p>
                      {(event.package_name || event.project_name) && (
                          <p className="event-meta">
                            {event.package_name && <span>Package: {event.package_name}</span>}
                            {event.package_name && event.project_name && " · "}
                            {event.project_name && <span>Project: {event.project_name}</span>}
                          </p>
                      )}
                      {event.location && (
                          <p className="event-meta"> {event.location}</p>
                      )}
                      {event.description && (
                          <p className="event-meta event-description">{event.description}</p>
                      )}
                      {event.attendees?.length > 0 && (
                          <p className="event-meta"> {event.attendees.join(", ")}</p>
                      )}
                      <div className="event-badges">
                        {event.is_online && <span className="badge badge-online">Online</span>}
                        {event.is_series && <span className="badge badge-series">Series</span>}
                      </div>
                    </div>
                    <div className="event-hours">{event.total_hours}h</div>
                  </div>
                ))
              )}
            </div>
            {sortedEvents.length > 0 && (
              <button className="btn-view-all">View Full Calendar →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert HH:MM:SS to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getISOWeek(dateStr) {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDateDutch(dateStr) {
  const months = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function setCellStyle(ws, row, col, style) {
  const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
  if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };
  ws[cellRef].s = { ...(ws[cellRef].s || {}), ...style };
}