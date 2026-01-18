import { useEffect, useState } from "react";
import { supabase } from "../supabase"; // Adjust path if needed
import PizzaVisual from "./PizzaVisual";
import "../styles/Leaderboard.css"; // We will create this CSS next

function PizzaLeaderboard() {
    const [topPizzas, setTopPizzas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPizzas();
    }, []);

    const fetchPizzas = async () => {
        try {
            const { data, error } = await supabase
            .from("pizza_recipes")
            .select("*")
            .order("votes", { ascending: false })
            .limit(20);

        if (error) throw error;

        const sorted = data.sort((a, b) => {
            if (b.votes !== a.votes) {
            return b.votes - a.votes; // Higher votes first
            }
            return 0.5 - Math.random(); // Randomize if ties
        });

      // Take only the top 6
        setTopPizzas(sorted.slice(0, 6));
        } catch (error) {
        console.error("Error loading pizzas:", error);
        } finally {
        setLoading(false);
        }
    };

    const handleVote = async (id, currentVotes, isYes) => {
        const change = isYes ? 1 : -1;
        const newVotes = Math.max(0, currentVotes + change); // Prevent negative votes

        // 1. Optimistic UI Update (Update screen before DB responds)
        setTopPizzas((prev) =>
            prev.map((pizza) =>
                pizza.id === id ? { ...pizza, votes: newVotes } : pizza
            )
        );

        // 2. Update Database
        const { error } = await supabase
        .from("pizza_recipes")
        .update({ votes: newVotes })
        .eq("id", id);

        if (error) {
            console.error("Error voting:", error);
            // Revert if error (optional, but good practice)
            fetchPizzas(); 
        }
    };

    if (loading) return <div className="loading">Loading hot pizzas...</div>;

        return (
            <div className="leaderboard-container">
                <h2>🔥 Community Favorites</h2>
                    <div className="pizza-grid">
                        {topPizzas.map((pizza) => (
                        <div key={pizza.id} className="pizza-card">
                            <div className="card-visual-wrapper">
                                {/* Reusing the visual component with a smaller scale */}
                                <PizzaVisual 
                                    dough={pizza.dough} 
                                    cheese={pizza.cheese} 
                                    toppings={pizza.toppings} 
                                    scale={0.6} 
                                />
                            </div>

                            <div className="card-info">
                            <h3>{pizza.name}</h3>
                            <div className="vote-count">Votes: {pizza.votes}</div>

                            <div className="vote-buttons">
                                <button 
                                className="vote-btn no" 
                                onClick={() => handleVote(pizza.id, pizza.votes, false)}
                                >
                                👎 No
                                </button>
                                <button 
                                className="vote-btn yes" 
                                onClick={() => handleVote(pizza.id, pizza.votes, true)}
                                >
                                👍 Yes
                                </button>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                );
}

export default PizzaLeaderboard;