import React, { useEffect, useMemo } from "react";
import { useMsal } from "@azure/msal-react";
import "./home.css";

export default function Home() {
  const { instance, accounts, inProgress } = useMsal();

  const account =
    instance.getActiveAccount() || accounts?.[0] || null;

  
  useEffect(() => {
    if (!instance.getActiveAccount() && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  const userInfo = useMemo(() => {
    if (!account) return null;

    const nameParts = (account.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      email: account.username,
      firstName,
      lastName,
    };
  }, [account]);

  return (
    <div className="home-container">
      <h1 className="home-title">Smart Time Registration</h1>

      <p className="home-status">
        In progress: <b>{inProgress}</b>
      </p>

      {!userInfo ? (
        <p className="home-message">You are not signed in.</p>
      ) : (
        <div className="user-info">
          <p>
            <b>Email:</b> {userInfo.email}
          </p>
          <p>
            <b>First name:</b> {userInfo.firstName}
          </p>
          <p>
            <b>Last name:</b> {userInfo.lastName}
          </p>
        </div>
      )}
    </div>
  );
}
