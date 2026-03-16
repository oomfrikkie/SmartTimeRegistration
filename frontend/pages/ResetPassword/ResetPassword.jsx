
import { Link } from "react-router-dom";
import "./restpassword.css";

function ResetPassword() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleResetPassword = () => {

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

    console.log("Reset password email sent to:", email);

    setSuccess("Password reset link has been sent to your email.");
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
        >
          Send Reset Link
        </button>

        <Link className="back-link" to="/login">
          Back to Login
        </Link>

      </div>
    </div>
  );
}

export default ResetPassword;