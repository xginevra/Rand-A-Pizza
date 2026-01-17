import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import CreateAPizza from "./pages/CreateAPizza";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-pizza" element={<CreateAPizza />} />
      </Routes>
    </Router>
  )
}

export default App;
