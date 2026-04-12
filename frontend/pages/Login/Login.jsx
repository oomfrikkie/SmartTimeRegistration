import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { setToken } from "../../src/utils/auth";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { instance } = useMsal();

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email or password.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login with:", { email });

      const response = await fetch("http://localhost:3000/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login successful:", data);

      if (data.access_token) {
        setToken(data.access_token);
      }

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to connect to server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
  try {
    sessionStorage.setItem("msal_login_started", "1");
    sessionStorage.setItem("msal_redirect_target", "/home");

    await instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      redirectStartPage: `${window.location.origin}/home`,
    });
  } catch (error) {
    console.error("Microsoft login error:", error);
  }
};

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="overlay">
          <h1>Smart Time Registration</h1>
          <p>Anything you can imagine</p>
          <span>Professional time tracking for modern IT teams</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <p className="subtitle">Login your account</p>
          <h2>Welcome Back!</h2>
          <p className="desc">Enter your email and password</p>

          {error && <p className="error">{error}</p>}

          <label>Email address</label>
          <input
            type="email"
            placeholder="hello@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Link to="/reset-password" className="forgot">
            Forgot Password?
          </Link>

          <button
            className="primary-btn"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign in"}
          </button>

          <button
            className="microsoft-btn"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            Sign in with Microsoft
          </button>

          <p className="bottom-text">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;