import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import PizzaLeaderboard from "../components/PizzaLeaderboard";


function Home() {
  const Navigate = useNavigate();

  return (
    <>
      <div className="landing-header">
        <div className="pizza-header" />
        <NavBar />

        <div className="landing-content">
          <h1>Get your favorite pizza on the shelves!</h1>
          <button
            className="landing-button"
            onClick={() => Navigate("/create-pizza")}
          >
            Get started now!
          </button>
        </div>
      </div>

        <div className="discover-section">
            <h2>Submit your recipes INSTANTLY!</h2>
            <p className="discover-subtext">
                share unique combos based on your flavor profiles and your preference
            </p>
        </div>
    </>
  );
}

export default Home;
