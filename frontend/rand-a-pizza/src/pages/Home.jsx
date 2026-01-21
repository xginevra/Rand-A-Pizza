import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../components/Modal";
import NavBar from "../components/NavBar";

function Home() {
  const Navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="landing-header">
        <div className="pizza-header" />
        <NavBar />

        <div className="landing-content">
          <h1 className="mb-2">Get your favorite pizza on the shelves!</h1>
          <button
            className="landing-button"
            onClick={() => setIsModalOpen(true)}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>What do you want to do?</h2>
        <div className="modal-cards-container">
          <div className="modal-card" onClick={() => Navigate("/create-pizza")}>
            <h3>🍕 Create a Pizza</h3>
            <p>Design your own unique pizza recipe and submit it to our collection</p>
          </div>
          <div className="modal-card" onClick={() => Navigate("/voting")}>
            <h3>🗳️ Vote on Pizzas</h3>
            <p>Discover and vote on pizzas created by our community</p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Home;
