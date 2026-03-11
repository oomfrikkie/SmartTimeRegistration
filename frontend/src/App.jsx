import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";

import Home from "../pages/Home/Home";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";

function App() {
  return (
    <section>
      <header>
        <NavBar />
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </section>
  );
}

export default App;
