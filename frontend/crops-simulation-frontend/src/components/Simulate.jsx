import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:8000";

function Simulate() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [years, setYears] = useState(5);
  const [waterAvailability, setWaterAvailability] = useState(50000);
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("yield");

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await fetch(`${API_BASE}/list`);
      const data = await response.json();
      setCrops(data);
    } catch (err) {
      console.error("Error fetching crops:", err);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!selectedCrop) {
      alert("Please select a crop");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/simulate/${selectedCrop}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          years: years,
          water_availability: waterAvailability,
        }),
      });

      if (!response.ok) throw new Error("Simulation failed");
      const data = await response.json();
      setSimulationData(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!simulationData) return [];

    switch (chartType) {
      case "yield":
        return simulationData.annual_data.map((d) => ({
          year: d.year,
          value: d.annual_yield,
        }));
      case "cost":
        return simulationData.annual_data.map((d) => ({
          year: d.year,
          value: d.annual_cost,
        }));
      case "efficiency":
        return simulationData.annual_data.map((d) => ({
          year: d.year,
          value: d.annual_efficiency,
        }));
      default:
        return [];
    }
  };

  const getChartLabel = () => {
    switch (chartType) {
      case "yield":
        return "Annual Yield (kg)";
      case "cost":
        return "Annual Cost ($)";
      case "efficiency":
        return "Annual Efficiency";
      default:
        return "";
    }
  };

  const formatter_chart = new Intl.NumberFormat("en", {
    notation: "compact", // gives K, M, B
    compactDisplay: "short",
  });

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  return (
    <div className="simulate-container">
      <h2>Crop Simulation</h2>

      <form className="simulate-form" onSubmit={handleSimulate}>
        <div className="form-group">
          <label>Select Crop:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            required
          >
            <option value="">-- Choose a crop --</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Years:</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min="1"
            max="50"
            required
          />
        </div>

        <div className="form-group">
          <label>Water Availability (L/year):</label>
          <input
            type="number"
            value={waterAvailability}
            onChange={(e) => setWaterAvailability(Number(e.target.value))}
            min="0"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Running..." : "Run Simulation"}
        </button>
      </form>

      {simulationData && (
        <div className="results">
          <div className="chart-section">
            <div className="chart-controls">
              <label>Select Chart Type:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="yield">Annual Yield</option>
                <option value="cost">Annual Cost</option>
                <option value="efficiency">Annual Efficiency</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: getChartLabel(),
                    angle: -90,
                    dx: -25,
                  }}
                  tickFormatter={(value) => formatter_chart.format(value)}
                  tick={{
                    fontSize: 14,
                  }}
                />
                <Tooltip formatter={(value) => formatter_chart.format(value)} />
                <Legend wrapperStyle={{ paddingTop: "1rem" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  name={getChartLabel()}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="summary-section">
            <h3>Summary Statistics</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Yield(kg) </td>
                  <td className="highlight">
                    {formatter.format(simulationData.summary.sum_of_yield)}
                  </td>
                </tr>
                <tr>
                  <td>Total Cost</td>
                  <td className="highlight">
                    ${formatter.format(simulationData.summary.sum_of_cost)}
                  </td>
                </tr>
                <tr>
                  <td>Average Efficiency</td>
                  <td className="highlight">
                    {simulationData.summary.average_efficiency}g / Litre
                  </td>
                </tr>
                <tr>
                  <td>Average Yield per Year</td>
                  <td className="highlight">
                    {formatter.format(
                      simulationData.summary.yield_per_year_avg
                    )}{" "}
                    kg
                  </td>
                </tr>
                <tr>
                  <td>Nutritional Yield / Litre</td>
                  <td className="highlight">
                    {simulationData.summary.value_per_litre}
                  </td>
                </tr>
                <tr>
                  <td>Nutritional Yield / m²</td>
                  <td className="highlight">
                    {simulationData.summary.value_per_area.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulate;
