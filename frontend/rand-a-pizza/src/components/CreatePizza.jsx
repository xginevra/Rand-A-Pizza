import { useState } from "react";
import "../styles/CreatePizza.css";
import Modal from "./Modal";
import { supabase } from "./supabase";

function CreatePizza() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDough, setSelectedDough] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isNameInputOpen, setIsNameInputOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pizzaName, setPizzaName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const doughs = [
    { name: "Classic Wheat", id: "cla" },
    { name: "Roman", id: "rom" },
    { name: "Neapolitan", id: "nea" },
    { name: "American/Flamkuchen", id: "ame" },
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
    { name: "Garlic", id: "garlic" },
    { name: "Mozzarella", id: "mozzerella" },
    { name: "Onion", id: "onion" },
    { name: "Pepper", id: "pepper" },
    { name: "Pineapple", id: "pineapple" },
    { name: "Döner", id: "donner" },
    { name: "Gyros", id: "gyros" },
  ];

  const handleDoughSelect = (dough) => {
    setSelectedDough(dough);
    setCurrentStep(2);
  };

  const handleCheeseSelect = (cheese) => {
    setSelectedCheese(cheese);
    setCurrentStep(3);
  };

  const handleClearToppings = (e) => {
    e.stopPropagation();
    setSelectedToppings([]);
  };

  const handleClearCheese = (e) => {
    e.stopPropagation();
    setSelectedCheese();
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
    selectedDough && selectedToppings.length > 0;

  // Helper: robust comparison of toppings
  const areToppingsEqual = (savedToppings, currentToppings) => {
    // Safety check: ensure both are actually arrays before comparing
    if (!Array.isArray(savedToppings) || !Array.isArray(currentToppings))
      return false;

    if (savedToppings.length !== currentToppings.length) return false;

    // Create sorted arrays of IDs to compare
    const savedIds = savedToppings.map((t) => t.id).sort();
    const currentIds = currentToppings.map((t) => t.id).sort();

    return JSON.stringify(savedIds) === JSON.stringify(currentIds);
  };

  const handleInitialSubmit = async () => {
    if (!isFormComplete) return;
    setIsSubmitting(true);

    try {
      // 1. Fetch ALL recipes (or a sensible limit) to filter in JavaScript
      // This bypasses issues with JSON column types in Supabase
      const { data: allRecipes, error } = await supabase
        .from("pizza_recipes")
        .select("*");

      if (error) throw error;

      console.log("Recipes fetched from DB:", allRecipes); // Debugging log

      // 2. Filter manually in JavaScript
      const existingPizza = allRecipes.find((recipe) => {
        // Compare Dough (Safe check for object existence)
        const doughMatch = recipe.dough?.id === selectedDough.id;

        // Compare Cheese
        const cheeseMatch = recipe.cheese?.id === selectedCheese?.id;

        // Compare Toppings
        const toppingsMatch = areToppingsEqual(
          recipe.toppings,
          selectedToppings,
        );

        return doughMatch && cheeseMatch && toppingsMatch;
      });

      if (existingPizza) {
        console.log("Found match:", existingPizza.name);

        // SCENARIO A: Update Vote
        const { error: updateError } = await supabase
          .from("pizza_recipes")
          .update({ votes: (existingPizza.votes || 1) + 1 }) // Handle cases where votes might be null
          .eq("id", existingPizza.id);

        if (updateError) throw updateError;

        setSuccessMessage(`One more vote for "${existingPizza.name}"!`);
        setIsSubmitting(false);
        setIsSuccessModalOpen(true);
      } else {
        console.log("No match found. Asking for name.");
        // SCENARIO B: New Pizza
        setIsSubmitting(false);
        setIsNameInputOpen(true);
      }
    } catch (error) {
      console.error("Error checking pizza:", error);
      alert("Something went wrong checking the database.");
      setIsSubmitting(false);
    }
  };

  const handleSaveNewPizza = async () => {
    if (!pizzaName.trim()) return alert("Please give your pizza a name!");

    setIsSubmitting(true);

    const { error } = await supabase.from("pizza_recipes").insert([
      {
        dough: selectedDough,
        cheese: selectedCheese,
        toppings: selectedToppings,
        name: pizzaName, // Save the name
        votes: 1, // Initialize with 1 vote
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error creating pizza", error);
      alert("Something went wrong saving your pizza!");
    } else {
      setIsNameInputOpen(false); // Close name input
      setSuccessMessage(`"${pizzaName}" has been created and saved!`);
      setIsSuccessModalOpen(true); // Open success modal
    }
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    setIsNameInputOpen(false);
    setCurrentStep(1);
    setSelectedDough(null);
    setSelectedCheese(null);
    setSelectedToppings([]);
    setPizzaName("");
    setIsSubmitting(false); // Safety reset
  };

  return (
    <div className="createpizza-container">
      <div className="pizza-builder">
        {/* Left Side - Pizza Visual */}
        <div className="pizza-visual">
          <div className="pizza-stack">
            <img
              src="/ingredients/plate.png"
              alt="Pizza Base"
              className="pizza-layer base-layer"
            />
            {selectedDough && (
              <img
                src={`/ingredients/dough/d_${selectedDough.id}.png`}
                alt={selectedDough.name}
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
            {selectedDough && (
              <p className="selected">✓ {selectedDough.name}</p>
            )}
            {currentStep === 1 && (
              <div className="options">
                {doughs.map((dough) => (
                  <button
                    key={dough.id}
                    className={`option-btn ${
                      selectedDough?.id === dough.id ? "selected" : ""
                    }`}
                    onClick={() => handleDoughSelect(dough)}
                  >
                    {dough.name}
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
                <button
                  className="clear-btn"
                  onClick={handleClearCheese}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  ❌ No Cheese
                </button>
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
              <div className="step-content">
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
                {selectedToppings.length > 0 && (
                  <button
                    className="clear-btn"
                    onClick={handleClearToppings}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    ❌ Clear All Toppings
                  </button>
                )}
              </div>
            )}
          </div>

          {isFormComplete && (
            <button
              className="submit-btn"
              onClick={handleInitialSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Finish Pizza"}
            </button>
          )}
        </div>
      </div>

      {/* MODAL 1: Name Your Pizza (Only appears if pizza is new) */}
      <Modal isOpen={isNameInputOpen} onClose={() => setIsNameInputOpen(false)}>
        <h2>🧑‍🍳 A New Creation!</h2>
        <p>This exact combination hasn't been made yet. Give it a name!</p>
        <input
          type="text"
          placeholder="e.g. The Midnight Special"
          value={pizzaName}
          onChange={(e) => setPizzaName(e.target.value)}
          className="pizza-name-input"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "20px",
            fontSize: "1rem",
          }}
        />
        <button
          className="submit-btn"
          onClick={handleSaveNewPizza}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save New Pizza"}
        </button>
      </Modal>

      {/* MODAL 2: Success (Appears for both Votes and New Creations) */}
      <Modal isOpen={isSuccessModalOpen} onClose={handleModalClose}>
        <h2>🍕 Awesome!</h2>
        <p>{successMessage}</p>
        <p>Thank you for your feedback.</p>
      </Modal>
    </div>
  );
}

export default CreatePizza;
