import React from "react";
import { useMsal } from "@azure/msal-react";
import "./loginbutton.css";

const loginRequest = {
  scopes: ["openid", "profile", "email"],
  prompt: "select_account",
};

export default function LoginButton() {
  const { instance, accounts, inProgress } = useMsal();

  const account =
    instance.getActiveAccount() || accounts?.[0] || null;

  const signIn = () => {
    instance.loginRedirect(loginRequest);
  };

  const signOut = () => {
    const active =
      instance.getActiveAccount() || accounts?.[0];

    if (active) {
      instance.logoutRedirect({ account: active });
    }
  };

  if (!account) {
    return (
      <button
        className="login-btn"
        onClick={signIn}
        disabled={inProgress !== "none"}
      >
        Login with Microsoft
      </button>
    );
  }

  return (
    <div className="login-user">
      <span className="login-username">
        {account.name || account.username}
      </span>
      <button
        className="logout-btn"
        onClick={signOut}
        disabled={inProgress !== "none"}
      >
        Logout
      </button>
    </div>
  );
}
