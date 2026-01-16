import { useState } from "react";
import "../styles/CreatePizza.css";

function CreatePizza() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDough, setSelectedDough] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const doughs = [
    "Classic Wheat",
    "Roman",
    "Neapolitan",
    "American/Flammkuchen",
  ];
  const cheeses = [
    { name: "Mozzarella", id: "moz" },
    { name: "Gouda", id: "gou" },
    { name: "Emmentaler", id: "emm" },
    { name: "Edamer", id: "eda" },
  ];
  const toppings = [
    { name: "Salami", id: "salami" },
    { name: "Ham", id: "ham" },
    { name: "Tuna", id: "tuna" },
    { name: "Mushrooms", id: "mush" },
    { name: "Sucuk", id: "sucuk" },
  ];

  const handleDoughSelect = (dough) => {
    setSelectedDough(dough);
    setCurrentStep(2);
  };

  const handleCheeseSelect = (cheese) => {
    setSelectedCheese(cheese);
    setCurrentStep(3);
  };

  const handleToppingSelect = (topping) => {
    setSelectedToppings((prev) => {
      const isSelected = prev.find((t) => t.id === topping.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const isFormComplete =
    selectedDough && selectedCheese && selectedToppings.length > 0;

  const handleSubmit = () => {
    console.log({
      dough: selectedDough,
      cheese: selectedCheese,
      toppings: selectedToppings,
    });
  };

  return (
    <div className="createpizza-container">
      <div className="pizza-builder">
        {/* Left Side - Pizza Visual */}
        <div className="pizza-visual">
          <div className="pizza-stack">
            <img src="/ingredients/plate.png" alt="Pizza Base" className="pizza-layer base-layer" />
            {selectedDough && (
              <img
                src="/ingredients/dough/d_n_s.png"
                alt="Dough"
                className="pizza-layer dough-layer"
              />
            )}
            {selectedCheese && (
              <img
                src={`/ingredients/cheese/c_${selectedCheese.id}.png`}
                alt={selectedCheese.name}
                className="pizza-layer cheese-layer"
              />
            )}
            {selectedToppings.map((topping, index) => (
              <img
                key={topping.id}
                src={`/ingredients/toppings/t_${topping.id}.png`}
                alt={topping.name}
                className="pizza-layer topping-layer"
                style={{ zIndex: 30 + index }}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Step Selection */}
        <div className="step-selection">
          {/* Step 1: Dough */}
          <div
            className={`step ${currentStep === 1 ? "active" : ""}`}
            onClick={() => handleStepClick(1)}
          >
            <h3>Step 1: Select Dough</h3>
            {selectedDough && <p className="selected">✓ {selectedDough}</p>}
            {currentStep === 1 && (
              <div className="options">
                {doughs.map((dough) => (
                  <button
                    key={dough}
                    className={`option-btn ${
                      selectedDough === dough ? "selected" : ""
                    }`}
                    onClick={() => handleDoughSelect(dough)}
                  >
                    {dough}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Cheese */}
          <div
            className={`step ${currentStep === 2 ? "active" : ""}`}
            onClick={() => handleStepClick(2)}
          >
            <h3>Step 2: Select Cheese</h3>
            {selectedCheese && (
              <p className="selected">✓ {selectedCheese.name}</p>
            )}
            {currentStep === 2 && (
              <div className="options">
                {cheeses.map((cheese) => (
                  <button
                    key={cheese.id}
                    className={`option-btn ${
                      selectedCheese?.id === cheese.id ? "selected" : ""
                    }`}
                    onClick={() => handleCheeseSelect(cheese)}
                  >
                    {cheese.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Toppings */}
          <div
            className={`step ${currentStep === 3 ? "active" : ""}`}
            onClick={() => handleStepClick(3)}
          >
            <h3>Step 3: Select Toppings (Multiple)</h3>
            {selectedToppings.length > 0 && (
              <p className="selected">
                ✓ {selectedToppings.map((t) => t.name).join(", ")}
              </p>
            )}
            {currentStep === 3 && (
              <div className="options">
                {toppings.map((topping) => (
                  <button
                    key={topping.id}
                    className={`option-btn ${
                      selectedToppings.find((t) => t.id === topping.id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleToppingSelect(topping)}
                  >
                    {topping.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {isFormComplete && (
            <button className="submit-btn" onClick={handleSubmit}>
              Submit Pizza Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePizza;
