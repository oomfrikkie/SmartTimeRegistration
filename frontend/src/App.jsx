import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import ResetPassword from "../pages/ResetPassword/ResetPassword.jsx";
import SetNewPassword from "../pages/SetNewPassword/SetNewPassword.jsx";
import Test from '../pages/Test/Test.jsx'
import Projects from '../pages/Projects/Projects.jsx'
import ProjectDetail from '../pages/Projects/ProjectDetail.jsx'
import CreateProject from '../pages/CreateProject/CreateProject.jsx'
import AccountOverview from "../pages/AccountOverview/AccountOverview.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AUTH_ROUTES = ["/login", "/signup",
  "/reset-password", "/set-new-password"];


function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  return (
    <ErrorBoundary>
    <section>
      {!isAuthPage && (
          <header>
            <NavBar />
          </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>

        <Route path="/account" element={
          <ProtectedRoute>
            <AccountOverview />
          </ProtectedRoute>
        }/>

        <Route path="/set-new-password" element={
          <ProtectedRoute>
            <SetNewPassword />
          </ProtectedRoute>
        }/>

        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }/>

        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }/>

        <Route path="/projects/create" element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }/>
        
        <Route path="/projects/:projectId/:name" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }/>

        <Route path="/test" element={
          <ProtectedRoute>
            <Test />
          </ProtectedRoute>
        }/>

        <Route path="/account" element={
          <ProtectedRoute>
            <AccountOverview />
          </ProtectedRoute>
        }/>
      </Routes>
    </section>
    </ErrorBoundary>
  );
}

export default App;
