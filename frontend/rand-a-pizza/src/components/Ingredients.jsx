import { useEffect, useState } from "react";
import "../App.css";

function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        async function fetchIngredients() {
            try {
                const res = await fetch('/api/ingredients');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // If the API returns an array we'll store it directly; if it returns
                // an object with categories (e.g. {toppings, cheeses, doughs}), store that too.
                if (mounted) setIngredients(data);
            } catch (err) {
                if (mounted) setError(err.message || 'Failed to fetch ingredients');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchIngredients();
        return () => { mounted = false };
    }, []);

    const renderContent = () => {
        if (Array.isArray(ingredients)) {
            if (ingredients.length === 0) return <p>No ingredients available.</p>;
            return (
                <ul>
                    {ingredients.map((ing, idx) => (
                        <li key={ing.id ?? ing.name ?? idx}>{ing.name ?? ing}</li>
                    ))}
                </ul>
            );
        }

        if (ingredients && typeof ingredients === 'object') {
            const entries = Object.entries(ingredients);
            if (entries.length === 0) return <p>No ingredients available.</p>;
            return (
                <div>
                    {entries.map(([category, list]) => (
                        <section key={category}>
                            <h2>{category}</h2>
                            {Array.isArray(list) && list.length > 0 ? (
                                <ul>
                                    {list.map((item, idx) => (
                                        <li key={item.id ?? item.name ?? idx}>{item.name ?? item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No items in this category.</p>
                            )}
                        </section>
                    ))}
                </div>
            );
        }

        return <p>No ingredients available.</p>;
    };

    return (
        <div className="ingredients">
            <h1>We have the following ingredients:</h1>
            {loading ? <p>Loading…</p> : error ? <p className="error">Error: {error}</p> : renderContent()}
        </div>
    );
}

export default Ingredients;