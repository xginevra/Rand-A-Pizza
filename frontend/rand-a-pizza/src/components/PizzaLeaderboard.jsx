import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import PizzaVisual from "./PizzaVisual";
import "../styles/Leaderboard.css";

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
        // Calculate new vote count
        // If Yes: +1
        // If No: -1 (but ensure it doesn't go below 0)
        const newVotes = isYes 
        ? currentVotes + 1 
        : Math.max(0, currentVotes - 1); 

        // Optimistic UI Update (Change screen immediately)
        setTopPizzas((prev) =>
        prev.map((pizza) =>
            pizza.id === id ? { ...pizza, votes: newVotes } : pizza
        )
        );

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
        <h2>🔥 Community Favorites</h2>
        <div className="pizza-grid">
            {topPizzas.map((pizza) => (
            <div key={pizza.id} className="pizza-card">

                {/* Visual */}
                <div className="card-visual-wrapper">
                    <PizzaVisual
                        dough={pizza.dough}
                        cheese={pizza.cheese}
                        toppings={pizza.toppings}
                        scale={0.55}
                    />
                </div>

                {/* 2. INGREDIENTS LIST */}
                <div className="card-ingredients">
                    <span className="ing-tag dough">{pizza.dough?.name}</span>
                    <span className="ing-tag cheese">{pizza.cheese?.name}</span>
                    {pizza.toppings?.map((t) => (
                        <span key={t.id} className="ing-tag topping">{t.name}</span>
                    ))}
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