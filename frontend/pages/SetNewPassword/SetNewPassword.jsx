import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./setnewpassword.css";

function SetNewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid reset link. No token provided.");
    }
  }, [searchParams]);

  const handleSetNewPassword = async () => {
    if (!password) {
      setError("Please enter a new password.");
      setSuccess("");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    if (!token) {
      setError("Invalid token.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/account/set-new-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-left">
        <div className="overlay">
          <h1>Set New Password</h1>
          <p>Secure your account</p>
        </div>
      </div>

      <div className="reset-right">
        <div className="reset-content">

          <span className="small-text">Create new password</span>
          <h2>Set New Password</h2>

          <div className="info-box">
            Enter your new password below.
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={handleSetNewPassword}
            disabled={loading || !token}
          >
            {loading ? "Setting..." : "Set New Password"}
          </button>

          <button className="secondary-btn" onClick={() => navigate("/login")}>
            Back to Login
          </button>

        </div>
      </div>
    </div>
  );
}

export default SetNewPassword;