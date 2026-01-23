import { useEffect, useState } from "react";
import "../styles/Leaderboard.css";
import PizzaVisual from "./PizzaVisual";
import { supabase } from "./supabase";

function PizzaLeaderboard() {
  const [topPizzas, setTopPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votedPizzas, setVotedPizzas] = useState([]);

  useEffect(() => {
    fetchPizzas();

    const storedVotes = JSON.parse(localStorage.getItem("votedPizzas")) || [];
    setVotedPizzas(storedVotes);
  }, []);

  const fetchPizzas = async () => {
    try {
      const { data, error } = await supabase
        .from("pizza_recipes")
        .select("*")
        .order("votes", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Logic: Sort by votes, randomize ties, take top 6
      const sorted = data.sort((a, b) => {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return 0.5 - Math.random();
      });

      setTopPizzas(sorted.slice(0, 6));
    } catch (error) {
      console.error("Error loading pizzas:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. UPDATED VOTING LOGIC
  const handleVote = async (id, currentVotes, isYes) => {
    if (votedPizzas.includes(id)) {
      alert("You have already voted for this pizza!");
      return;
    }

    const newVotes = isYes ? currentVotes + 1 : Math.max(0, currentVotes -1);

    setTopPizzas((prev) =>
      prev.map((pizza) =>
        pizza.id === id ? { ...pizza, votes: newVotes} : pizza,
      ),
    );

    const newVotedList = [...votedPizzas, id];
    setVotedPizzas(newVotedList);
    localStorage.setItem("votedPizzas", JSON.stringify(newVotedList));

    // Update Database
    const { error } = await supabase
      .from("pizza_recipes")
      .update({ votes: newVotes })
      .eq("id", id);

    if (error) {
      console.error("Error updating vote:", error);
      // Optional: Revert changes or re-fetch if DB fails
      fetchPizzas();
    }
  };

  if (loading) return <div className="loading">Loading hot pizzas...</div>;

  return (
    <div className="leaderboard-container">
      <h1>Community Favorites 🔥</h1>
      <h4>Vote for your favorite pizza creations!</h4>
      <div className="pizza-grid">
        {topPizzas.map((pizza) => {
          // Helper to check if this specific card is voted
          const hasVoted = votedPizzas.includes(pizza.id);

          return (
            <div key={pizza.id} className="pizza-card">
              <div className="card-visual-wrapper">
                <PizzaVisual
                  dough={pizza.dough}
                  cheese={pizza.cheese}
                  toppings={pizza.toppings}
                  scale={1}
                />
              </div>

              <div className="card-ingredients">
                <span className="ing-tag dough">{pizza.dough?.name}</span>
                <span className="ing-tag cheese">{pizza.cheese?.name}</span>
                {pizza.toppings?.map((t) => (
                  <span key={t.id} className="ing-tag topping">
                    {t.name}
                  </span>
                ))}
              </div>

              <div className="card-info">
                <h3>{pizza.name}</h3>
                <div className="vote-count">Votes: {pizza.votes}</div>

                <div className="vote-buttons">
                  <button
                    className={`vote-btn yes ${hasVoted ? "disabled" : ""}`}
                    // CHANGE 4: Disable button logic
                    onClick={() => !hasVoted && handleVote(pizza.id, pizza.votes, true)}
                    disabled={hasVoted}
                    style={{
                        opacity: hasVoted ? 0.5 : 1,
                        cursor: hasVoted ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {hasVoted ? "✅ Voted" : "👍 Vote"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PizzaLeaderboard;
