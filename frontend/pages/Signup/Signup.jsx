import { Link } from "react-router-dom";


function Signup() {
  return (
    <div className="auth-page">

      <div className="logo">IT Hub Logo</div>

      <div className="auth-card">
        <h2>Create Account</h2>

        <label>Name</label>
        <input type="text" placeholder="Enter your full name" />

        <label>Email</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password</label>
        <input type="password" placeholder="Enter your password" />

        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm your password" />

        <button className="primary-btn">Create Account</button>

        <button className="microsoft-btn">
          Register with Microsoft
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;