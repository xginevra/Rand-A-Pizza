import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import CreateAPizza from "./pages/CreateAPizza";
import Home from "./pages/Home";
import Voting from "./pages/Voting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-pizza" element={<CreateAPizza />} />
        <Route path="/voting" element={<Voting />} />
      </Routes>
    </Router>
  )
}

export default App;
