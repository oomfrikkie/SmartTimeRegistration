
import { Link } from "react-router-dom";
import "../../src/styles/auth.css";

function ResetPassword() {


  return (
    <div className="auth-page">
      <div className="logo">IT Hub Logo</div>
      <div className="auth-card">
        <h2>Reset Password</h2>
        <div className="info-box">
          Enter your email address and we'll send you a link to reset your password.
        </div>
        <label>Email</label>
        <input type="email" placeholder="Enter your email" />
        <button className="primary-btn">
          Send Reset Link
        </button>
        <Link className="back-link" to="/login">Back to Login</Link>
      </div>
    </div>
  );
}

export default ResetPassword;