import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleLogin = async () => {

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
    setIsLoading(true);

    // API call to authenticate user here
    try {
      console.log("Attempting login with:", { email });

      const response = await fetch('http://localhost:3000/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // This allows cookies to be sent
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Successfully logged in
      console.log("Login successful:", data);
      
      // Storing user info in localStorage 
      localStorage.setItem('user', JSON.stringify(data.account));
      
      // Redirecting the user to the home page
      navigate("/home");
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to connect to server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }

    navigate("/home");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h2>Smart Time Registration</h2>

        {error && <p className="error" style={{ color: 'red', padding: '10px', background: '#ffeeee', borderRadius: '4px' }}>{error}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
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

        <button 
          className="microsoft-btn"
          type="button"
          disabled={isLoading}
          >
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