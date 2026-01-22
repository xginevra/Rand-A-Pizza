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
    // Recharts passes the data object of the clicked bar
    if (data && data.payload_ingredients) {
      setSelectedPizza({
        name: data.name,
        ...data.payload_ingredients
      });
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

      {/* Summary Cards */}
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

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
<div style={chartContainerStyle}>
          <h3>🏆 Top Rated Pizzas (Click bars for details)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.vote_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              {/* 3. NEW: Added onClick and cursor pointer */}
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
        {/* Chart 2: Most Popular Toppings */}
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