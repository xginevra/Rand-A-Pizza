import { useState } from "react";
import "./App.css";
import Ingredients from "./components/Ingredients";
import NavBar from "./components/NavBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="landing-header">
        {/* The Pizza Image (Absolute positioned background layer) */}
        <div className="pizza-header" />

        {/* Navigation */}
        <NavBar />

        {/* Text Content (Left Side) */}
        <div className="landing-content">
          <h1>Get your favorite pizza on the shelves!</h1>
          <button className="landing-button">Get started now!</button>
        </div>
      </div>

      <div className="discover-section">
        <h2>Submit your recipes INSTANTLY!</h2>
        <p className="discover-subtext">
          share unique combos based on your flavor profiles and your preference
        </p>
      </div>
      <Ingredients />
    </>
  );
}

export default App;
