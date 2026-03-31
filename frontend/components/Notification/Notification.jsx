import { useState } from "react";
import "./notification.css";
import { CgBell } from "react-icons/cg";

export default function Notification() {
    // Check if dropdown is visible
    const [open, setOpen] = useState(false);

    // Hardcoded for now, will get from API later
    const notifications = [];
    const unreadCount = 0;

    return (
        // CgBell toggles the dropdown when clicked. The red badge only show when unreadCount > 0
        <div className="notification-bell">
            <button className="bell-btn" onClick={() =>
                setOpen(!open)}>
                <CgBell />
                {unreadCount > 0 && (
                    <span className="bell-badge">{unreadCount}</span>
                )}
            </button>

            {/* The dropdown only render if open = true */}
            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="notification-empty">No
                                notifications</p>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`notification-item ${!n.isRead ? "unread" : ""}`}>
                                    <p
                                        className="notification-message">{n.message}</p>
                                    <span
                                        className="notification-time">{n.createdAt}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
