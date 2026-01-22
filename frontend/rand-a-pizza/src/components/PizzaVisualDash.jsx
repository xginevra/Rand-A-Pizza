import "../styles/PizzaVisualDash.css"; // We reuse the styles for the stack

const PizzaVisualDash = ({ dough, cheese, toppings, scale = 1 }) => {
    return (
        <div className="pizza-stack">
            <img src="/ingredients/plate.png" alt="Pizza Base" className="pizza-layer base-layer" />

            {dough && (
                <img
                    src={`/ingredients/dough/d_${dough.id}.png`}
                    alt={dough.name}
                    className="pizza-layer dough-layer"
                />
            )}

            {cheese && (
                <img
                    src={`/ingredients/cheese/c_${cheese.id}.png`}
                    alt={cheese.name}
                    className="pizza-layer cheese-layer"
                />
            )}
            {toppings && toppings.map((topping, index) => (
                <img
                    key={topping.id}
                    src={`/ingredients/toppings/t_${topping.id}.png`}
                    alt={topping.name}
                    className="pizza-layer topping-layer"
                    style={{ zIndex: 30 + index }}
                />
            ))}
        </div>
    );
};

export default PizzaVisualDash;