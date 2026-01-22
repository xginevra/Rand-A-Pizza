import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import PizzaVisual from "../components/PizzaVisual";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const navigate = useNavigate();
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const response = await fetch("/api/business/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };


  const handleBarClick = (data) => {
    console.log("Clicked Bar Data!", data);

    if (data.dough || data.cheese || data.toppings) {
      console.log("✅ Ingredients found:", data);
      setSelectedPizza({
        name: data.name || "Pizza",
        dough: data.dough,
        cheese: data.cheese,
        toppings: data.toppings
      });
    } else {
      console.error("❌ Ingredient data is MISSING from the data.");
      console.log("Did you restart the Python backend after adding the new code?");
      alert("Error: Ingredients data is missing. Please check the console.");
    }
  };

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🍕 Business Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div style={cardStyle}>
          <h3>Total Recipes Created</h3>
          <h2 style={{ color: "#FF8042" }}>{stats?.total_pizzas}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Total Community Votes</h3>
          <h2 style={{ color: "#00C49F" }}>{stats?.total_votes}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
        <div style={chartContainerStyle}>
          <h3>🏆 Top Rated Pizzas (Click bars for details)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.vote_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar
                dataKey="votes"
                fill="#8884d8"
                name="Votes"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={chartContainerStyle}>
          <h3>🍄 Most Popular Toppings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.top_toppings}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats?.top_toppings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {selectedPizza && (
        <div style={{ marginTop: "40px" }}>
          <h2>Selected Pizza Details</h2>
          <div className="selected-pizza-card" style={{ maxWidth: "400px", margin: "20px 0" }}>
            <div className="card-visual-wrapper">
              <PizzaVisual
                dough={selectedPizza.dough}
                cheese={selectedPizza.cheese}
                toppings={selectedPizza.toppings}
                scale={1}
              />
            </div>

            <div className="card-ingredients">
              {selectedPizza.dough && (
                <span className="ing-tag dough">{selectedPizza.dough.name}</span>
              )}
              {selectedPizza.cheese && (
                <span className="ing-tag cheese">{selectedPizza.cheese.name}</span>
              )}
              {selectedPizza.toppings && selectedPizza.toppings.map((t) => (
                <span key={t.id} className="ing-tag topping">
                  {t.name}
                </span>
              ))}
            </div>

            <div className="card-info">
              <h3>{selectedPizza.name}</h3>
            </div>
          </div>
          <button
            onClick={() => setSelectedPizza(null)}
            style={{ padding: "8px 16px", cursor: "pointer", marginTop: "10px" }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#f9f9f9",
  padding: "20px",
  borderRadius: "8px",
  flex: 1,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const chartContainerStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};


const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContentStyle = {
  background: "white",
  padding: "2rem",
  borderRadius: "10px",
  width: "300px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  minHeight: "200px"
};

export default Dashboard;