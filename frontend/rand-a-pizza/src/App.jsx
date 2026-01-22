import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import CreateAPizza from "./pages/CreateAPizza";
import Home from "./pages/Home";
import Voting from "./pages/Voting";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="page">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-pizza" element={<CreateAPizza />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
