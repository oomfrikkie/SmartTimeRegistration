import React from "react";
import { useMsal } from "@azure/msal-react";

/**
 * Home.jsx - Microsoft login test page
 * Assumes main.jsx already wraps the app with <MsalProvider instance={msalInstance}>
 */

// Quick config here for testing (no extra files)
const CLIENT_ID = "f68133ef-fbb5-4a26-a51d-b0b76bbd7aec";
const TENANT_ID = "7e0609fe-cffc-471d-8777-264f711051f6";
const REDIRECT_URI = "http://localhost:5173";

const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export default function Home() {
  const { instance, accounts, inProgress } = useMsal();
  const account = accounts?.[0] ?? null;

  const signIn = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (err) {
      console.error("MS login error:", err);
      alert(err?.message ?? "Login failed (check console).");
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutPopup();
    } catch (err) {
      console.error("MS logout error:", err);
      alert(err?.message ?? "Logout failed (check console).");
    }
  };

  const getToken = async () => {
    if (!account) return;
    try {
      // silent first
      const result = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      console.log("✅ idToken:", result.idToken);
      console.log("✅ accessToken:", result.accessToken);
      alert("Token acquired ✅ (check console)");
    } catch (err) {
      console.warn("Silent token failed, trying popup…", err);
      try {
        const result = await instance.acquireTokenPopup(loginRequest);
        console.log("✅ idToken:", result.idToken);
        console.log("✅ accessToken:", result.accessToken);
        alert("Token acquired via popup ✅ (check console)");
      } catch (err2) {
        console.error("Token popup error:", err2);
        alert(err2?.message ?? "Token failed (check console).");
      }
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Smart Time Registration</h1>
      <p style={{ opacity: 0.8 }}>
        In progress: <b>{inProgress}</b>
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {!account ? (
          <button onClick={signIn}>Sign in with Microsoft</button>
        ) : (
          <>
            <span>
              Logged in as <b>{account.username}</b>
            </span>
            <button onClick={getToken}>Get Token (console)</button>
            <button onClick={signOut}>Logout</button>
          </>
        )}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <details>
        <summary>Debug</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(
  {
    clientId: CLIENT_ID,
    tenantId: TENANT_ID,
    redirectUri: REDIRECT_URI,
    accounts,
  },
  null,
  2
)}
        </pre>
      </details>
    </div>
  );
}
