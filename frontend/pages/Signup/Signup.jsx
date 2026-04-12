import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import "./signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { instance } = useMsal();

  // For navigation after successful signup
  const navigate = useNavigate();

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
      
      setErrorMessage("");
  };

  const handleMicrosoftRegister = async () => {
    if (isMicrosoftLoading) {
      return;
    }

    setIsMicrosoftLoading(true);
    try {
      sessionStorage.setItem("msal_login_started", "1");
      // Store intended redirect target (e.g., home)
      sessionStorage.setItem("msal_redirect_target", "/home");
      await instance.loginRedirect({
        scopes: ["openid", "profile", "email"],
        redirectStartPage: `${window.location.origin}/home`,
      });
    } catch (error) {
      sessionStorage.removeItem("msal_login_started");
      console.error("MSAL login error:", error);
      const errorCode = error?.errorCode || error?.code;
      const errorText = error?.errorMessage || error?.message;
      setErrorMessage(
        errorCode || errorText
          ? `Microsoft login failed: ${errorCode ? `${errorCode} - ` : ""}${errorText || "Unknown MSAL error"}`
          : "Microsoft login failed"
      );
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form", formData);
    
    if (!formData.name || !formData.surname || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Input validation for name and surname
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(formData.name) || !usernameRegex.test(formData.surname)) {
      setErrorMessage("Name and surname can only contain letters, numbers, and underscores");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Password format validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage("Your password must be at least 6 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Send request to your NestJS backend
      const response = await fetch('http://localhost:3000/account/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password
          })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
      }

      setSuccessMessage(data.message || "Account created successfully!");
      console.log("[Signup] Email signup successful for:", formData.email);
      
      // Clear form
      setFormData({
          name: "",
          surname: "",
          email: "",
          password: "",
          confirmPassword: ""
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setErrorMessage(error.message || "Failed to connect to server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      
      <div className="signup-left">
        <div className="overlay">
          <h1>Join Our Platform</h1>
          <p>Start tracking time efficiently</p>
          <span>Create your account and boost your productivity</span>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-content">
          <p className="small-text">Create your account</p>
          <h2>Get Started</h2>
          <p className="subtitle">
            Fill in your details to create an account
          </p>

          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage} Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />

            <label>Surname</label>
            <input
              name="surname"
              placeholder="Enter your surname"
              value={formData.surname}
              onChange={handleChange}
              disabled={isLoading}
            />

            <label>Email address</label>
            <input
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />

            <button className="primary-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              className="microsoft-btn"
              type="button"
              onClick={handleMicrosoftRegister}
              disabled={isMicrosoftLoading}
            >
              Register with Microsoft
            </button>

            <p className="bottom-text">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;