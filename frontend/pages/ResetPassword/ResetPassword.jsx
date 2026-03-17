
import { Link } from "react-router-dom";
import { useState } from "react";
import "./restpassword.css";

function ResetPassword() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleResetPassword = async () => {

    if (!email) {
      setError("Please enter your email address.");
      setSuccess("");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/account/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
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
    <div className="auth-page">

      <div className="auth-card">

        <h2>Reset Password</h2>

        <div className="info-box">
          Enter your email address and we'll send you a link to reset your password.
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="primary-btn"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <Link className="back-link" to="/login">
          Back to Login
        </Link>

      </div>
    </div>
  );
}

export default ResetPassword;