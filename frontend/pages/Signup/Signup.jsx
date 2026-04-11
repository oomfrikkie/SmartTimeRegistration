import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // State for UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { instance } = useMsal();

  // For navigation after successful signup
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
      // Clear error when user starts typing again
      setErrorMessage("");
  };

  // Microsoft login redirect
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

   // Handle form submission
   const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form", formData);
    
    // Basic validation
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

    // Email format validation
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

    // Password match validation
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
          // Handle error response from backend
          throw new Error(data.message || 'Registration failed');
      }

      // Successfully created an account
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

      // Redirect to login after 2 seconds
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
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>

        {errorMessage && (
            <div className="error-message">
                {errorMessage}
            </div>
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
              placeholder="Enter your first name" 
              value={formData.name}
              onChange={ handleChange }
              disabled={isLoading}
            />

            <label>Surname</label>
            <input 
              name="surname" 
              placeholder="Enter your surname" 
              value={formData.surname}
              onChange={ handleChange }
              disabled={isLoading}
            />

            <label>Email</label>
            <input 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={ handleChange }
              disabled={isLoading}
            />

            <label>Password</label>
            <input 
              type="password"
              name="password" 
              placeholder="Enter your password" 
              value={formData.password}
              onChange={ handleChange }
              disabled={isLoading}
            />

            <label>Confirm Password</label>
            <input 
              type="password"
              name="confirmPassword" 
              placeholder="Confirm your password" 
              value={formData.confirmPassword}
              onChange={ handleChange }
              disabled={isLoading}
            />

            <button 
              className="primary-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              className="microsoft-btn"
              type="button"
              onClick={handleMicrosoftRegister}
              disabled={isMicrosoftLoading}
            >
              {isMicrosoftLoading ? "Redirecting to Microsoft..." : "Register with Microsoft"}
            </button>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
      </div>
    </div>
  );
}

export default Signup;