import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import ResetPassword from "../pages/ResetPassword/ResetPassword.jsx";
import SetNewPassword from "../pages/SetNewPassword/SetNewPassword.jsx";
import Test from '../pages/Test/Test.jsx'
import Projects from "../pages/Projects/Projects.jsx";
import CreateProject from "../pages/CreateProject/CreateProject.jsx";

function App() {
  return (
    <ErrorBoundary>
    <section>
      <header>
        <NavBar />
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/test" element={<Test />} />

        <Route path="/projects" element={<Projects />} />
        <Route path="/create-project" element={<CreateProject />} />
        
      </Routes>
    </section>
    </ErrorBoundary>
  );
}

export default App;
