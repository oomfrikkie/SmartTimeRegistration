import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import "./index.css";
import App from "./App.jsx";

const CLIENT_ID = "f68133ef-fbb5-4a26-a51d-b0b76bbd7aec";
const TENANT_ID = "7e0609fe-cffc-471d-8777-264f711051f6";

// ✅ always consistent in dev
const REDIRECT_URI = `${window.location.origin}/`;

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URI,

    // ✅ prevents MSAL from trying to "go back" to the pre-login route
    // and helps you control where you land after login
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
});

// ✅ ensures active account is set even when handleRedirectPromise returns null
msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS ||
    event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
  ) {
    const account = event.payload?.account;
    if (account) msalInstance.setActiveAccount(account);
  }
});

const root = createRoot(document.getElementById("root"));
root.render(
  <div
    style={{
      fontFamily: "sans-serif",
      textAlign: "center",
      marginTop: "3em",
    }}
  >
    Loading authentication...
  </div>
);

(async () => {
  try {
    // ✅ important for redirect flow stability
    await msalInstance.initialize();

    const res = await msalInstance.handleRedirectPromise();

    if (res?.account) {
      msalInstance.setActiveAccount(res.account);
      console.log("[MSAL] Redirect result account set:", res.account);
    } else {
      // If already logged in previously, pick the first cached account
      const cached = msalInstance.getAllAccounts();
      if (!msalInstance.getActiveAccount() && cached.length > 0) {
        msalInstance.setActiveAccount(cached[0]);
        console.log("[MSAL] Active account set from cache:", cached[0]);
      }
    }
  } catch (err) {
    console.error("[MSAL] init/redirect error:", err);
  } finally {
    root.render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MsalProvider>
      </StrictMode>
    );
  }
})();
