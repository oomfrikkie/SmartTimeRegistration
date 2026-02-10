import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import Home from "../pages/Home/Home";

function App() {
  return (
    <section>
      <header>
        <NavBar />
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </section>
  );
}

export default App;
