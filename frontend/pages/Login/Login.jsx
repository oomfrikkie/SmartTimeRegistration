import { Link } from "react-router-dom";
import "../../src/styles/auth.css";

function Login() {
  return (
    <div className="auth-page">

      <div className="logo">IT Hub Logo</div>

      <div className="auth-card">
        <h2>Smart Time Registration</h2>

        <label>Email</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password</label>
        <input type="password" placeholder="Enter your password" />

        <button className="microsoft-btn">
          Sign in with Microsoft
        </button>

        <button className="primary-btn">Login</button>

        <div className="auth-links">
          <Link to="/reset-password">Forgot password?</Link>
          <Link to="/signup">Sign up</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;