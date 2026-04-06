import { useState, useEffect, useRef } from "react";
import "./notification.css";
import { CgBell } from "react-icons/cg";
import { getAuthHeaders } from "../../src/utils/auth";

export default function Notification() {
    const [invitations, setInvitations] = useState([]);
    // Check if dropdown is visible
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchInvitations = async () => {
        try {
            const res = await fetch("http://localhost:3000/invitation/pending", {
                headers: getAuthHeaders(),
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setInvitations(data);
            }
        } catch (error) {
            console.error("Error fetching invitations:", error);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleAccept = async (id) => {
        await fetch(`http://localhost:3000/invitation/${id}/accept`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: "include",
        });
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    };

    const handleDecline = async (id) => {
        await fetch(`http://localhost:3000/invitation/${id}/decline`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: "include",
        });
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    };

    return (
        // CgBell toggles the dropdown when clicked. The red badge only show when unreadCount > 0
        <div className="notification-bell" ref={ref}>
            <button className="bell-btn" onClick={() =>
                setOpen(!open)}>
                <CgBell />
                {invitations.length > 0 && (
                    <span className="bell-badge">{invitations.length}</span>
                )}
            </button>

            {/* The dropdown only render if open = true */}
            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="notification-list">
                        {invitations.length === 0 ? (
                            <p className="notification-empty">No notifications</p>
                        ) : (
                            invitations.map((inv) => (
                                <div key={inv.id} className= "notification-item unread">
                                    <p
                                        className="notification-message">
                                            <strong>{inv.inviter.name}</strong> invited you to <strong>{inv.project.name}</strong>
                                    </p>
                                    <div className="notification-actions">
                                        <button onClick={() => handleAccept(inv.id)}>Accept</button>
                                        <button onClick={() => handleDecline(inv.id)}>Decline</button>
                                    </div>
                                    <span className="notification-time">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
