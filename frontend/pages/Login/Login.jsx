import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleLogin = () => {

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if(password.length < 6){
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");

    console.log("Login successful:", { email, password });

    // API call to authenticate user here

    navigate("/home");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h2>Smart Time Registration</h2>

        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="microsoft-btn">
          Sign in with Microsoft
        </button>

        <button
          className="primary-btn"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="auth-links">
          <Link to="/reset-password">Forgot password?</Link>
          <Link to="/signup">Sign up</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;