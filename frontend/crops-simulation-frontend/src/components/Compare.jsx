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

function Compare() {
  const [crops, setCrops] = useState([]);
  const [option, setOption] = useState("characteristics");
  const [crop1, setCrop1] = useState("");
  const [crop2, setCrop2] = useState("");
  const [years, setYears] = useState(5);
  const [waterAvailability, setWaterAvailability] = useState(50000);
  const [compareData, setCompareData] = useState(null);
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

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!crop1 || !crop2) {
      alert("Please select both crops");
      return;
    }
    if (crop1 === crop2) {
      alert("Please select different crops");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option: option,
          crop1_id: crop1,
          crop2_id: crop2,
          years: years,
          water_availability: waterAvailability,
        }),
      });

      if (!response.ok) throw new Error("Comparison failed");
      const data = await response.json();
      setCompareData(data);
      console.log(compareData);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!compareData || option === "characteristics") return [];
    if (!compareData.crop_1.accum_yield || !compareData.crop_2.accum_yield)
      return [];

    const years_array = Array.from(
      { length: compareData.crop_1.accum_yield.length },
      (_, i) => i + 1
    );

    if (chartType === "yield") {
      return years_array.map((year, idx) => ({
        year: year,
        [compareData.crop_1.name]: compareData.crop_1.accum_yield[idx],
        [compareData.crop_2.name]: compareData.crop_2.accum_yield[idx],
      }));
    } else {
      return years_array.map((year, idx) => ({
        year: year,
        [compareData.crop_1.name]: compareData.crop_1.accum_cost[idx],
        [compareData.crop_2.name]: compareData.crop_2.accum_cost[idx],
      }));
    }
  };

  const getBetterValue = (val1, val2, lowerIsBetter = false) => {
    if (lowerIsBetter) {
      return val1 < val2 ? "better" : val1 > val2 ? "worse" : "";
    }
    return val1 > val2 ? "better" : val1 < val2 ? "worse" : "";
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

  const handleOptionChange = (newOption) => {
    setOption(newOption);
    setCompareData(null); // Clear old data when switching modes
  };

  return (
    <div className="compare-container">
      <h2>Compare Crops</h2>

      <form className="compare-form" onSubmit={handleCompare}>
        <div className="option-group">
          <label>
            <input
              type="radio"
              value="characteristics"
              checked={option === "characteristics"}
              onChange={(e) => handleOptionChange(e.target.value)}
            />
            Characteristics
          </label>
          <label>
            <input
              type="radio"
              value="simulate"
              checked={option === "simulate"}
              onChange={(e) => handleOptionChange(e.target.value)}
            />
            Simulate
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Crop:</label>
            <select
              value={crop1}
              onChange={(e) => setCrop1(e.target.value)}
              required
            >
              <option value="">-- Select crop 1 --</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Second Crop:</label>
            <select
              value={crop2}
              onChange={(e) => setCrop2(e.target.value)}
              required
            >
              <option value="">-- Select crop 2 --</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {option === "simulate" && (
          <div className="form-row">
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
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Comparing..." : "Compare Crops"}
        </button>
      </form>

      {compareData && (
        <div className="results">
          {option === "simulate" && (
            <div className="chart-section">
              <div className="chart-controls">
                <label>Select Chart Type:</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="yield">Cumulative Yield</option>
                  <option value="cost">Cumulative Cost</option>
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
                      value:
                        chartType === "yield"
                          ? "Cumulative Yield (kg)"
                          : "Cumulative Cost ($)",
                      angle: -90,
                      position: "center",
                      //   dy: 15,
                      dx: -25,
                    }}
                    tickFormatter={(value) => formatter_chart.format(value)}
                    tick={{
                      fontSize: 14,
                    }}
                  />
                  <Tooltip
                    formatter={(value) => formatter_chart.format(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: "1rem" }} />
                  <Line
                    type="monotone"
                    dataKey={compareData.crop_1.name}
                    stroke="#2e7d32"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={compareData.crop_2.name}
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="comparison-tables">
            <h3>Comparison Results</h3>

            {option === "characteristics" ? (
              <>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Characteristic</th>
                      <th>{compareData.crop_1.name}</th>
                      <th>{compareData.crop_2.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cost per Crop ($)</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.cost_per_crop,
                          compareData.crop_2.cost_per_crop,
                          true
                        )}
                      >
                        ${compareData.crop_1.cost_per_crop.toFixed(2)}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.cost_per_crop,
                          compareData.crop_1.cost_per_crop,
                          true
                        )}
                      >
                        ${compareData.crop_2.cost_per_crop.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Yield per Crop (kg)</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.yield_per_crop,
                          compareData.crop_2.yield_per_crop
                        )}
                      >
                        {compareData.crop_1.yield_per_crop.toFixed(2)}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.yield_per_crop,
                          compareData.crop_1.yield_per_crop
                        )}
                      >
                        {compareData.crop_2.yield_per_crop.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Space Required (m²)</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.space_required,
                          compareData.crop_2.space_required,
                          true
                        )}
                      >
                        {compareData.crop_1.space_required.toFixed(2)}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.space_required,
                          compareData.crop_1.space_required,
                          true
                        )}
                      >
                        {compareData.crop_2.space_required.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Days to Mature</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.days_to_mature,
                          compareData.crop_2.days_to_mature,
                          true
                        )}
                      >
                        {compareData.crop_1.days_to_mature}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.days_to_mature,
                          compareData.crop_1.days_to_mature,
                          true
                        )}
                      >
                        {compareData.crop_2.days_to_mature}
                      </td>
                    </tr>
                    <tr>
                      <td>Water Needed (L/day)</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.water_needed,
                          compareData.crop_2.water_needed,
                          true
                        )}
                      >
                        {compareData.crop_1.water_needed.toFixed(2)}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.water_needed,
                          compareData.crop_1.water_needed,
                          true
                        )}
                      >
                        {compareData.crop_2.water_needed.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Nutritonal Index</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.nutritional_index,
                          compareData.crop_2.nutritional_index
                        )}
                      >
                        {compareData.crop_1.nutritional_index}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.nutritional_index,
                          compareData.crop_1.nutritional_index
                        )}
                      >
                        {compareData.crop_2.nutritional_index}
                      </td>
                    </tr>
                    <tr>
                      <td>Efficiency</td>
                      <td
                        className={getBetterValue(
                          compareData.crop_1.efficiency,
                          compareData.crop_2.efficiency
                        )}
                      >
                        {compareData.crop_1.efficiency.toFixed(2)}
                      </td>
                      <td
                        className={getBetterValue(
                          compareData.crop_2.efficiency,
                          compareData.crop_1.efficiency
                        )}
                      >
                        {compareData.crop_2.efficiency.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="ratio-section">
                  <h4>
                    Comparative Ratios ({compareData.crop_1.name} /{" "}
                    {compareData.crop_2.name})
                  </h4>
                  <table className="ratio-table">
                    <tbody>
                      <tr>
                        <td>Cost Ratio</td>
                        <td>
                          {compareData.comparative_index.cost_ratio.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>Yield Ratio</td>
                        <td>
                          {compareData.comparative_index.yield_ratio.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>Space Ratio</td>
                        <td>
                          {compareData.comparative_index.space_required_ratio.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Harvest Time Ratio</td>
                        <td>
                          {compareData.comparative_index.harvest_ratio.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Water Ratio</td>
                        <td>
                          {compareData.comparative_index.water_ratio.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>Nutritional Yield Ratio</td>
                        <td>
                          {compareData.comparative_index.nutritional_ratio.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Efficiency Ratio</td>
                        <td>
                          {compareData.comparative_index.efficiency_ratio.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{compareData.crop_1.name}</th>
                    <th>{compareData.crop_2.name}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Yield (kg)</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.total_yield,
                        compareData.crop_2.total_yield
                      )}
                    >
                      {formatter.format(compareData.crop_1.total_yield)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.total_yield,
                        compareData.crop_1.total_yield
                      )}
                    >
                      {formatter.format(compareData.crop_2.total_yield)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Cost ($)</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.total_cost,
                        compareData.crop_2.total_cost,
                        true
                      )}
                    >
                      ${formatter.format(compareData.crop_1.total_cost)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.total_cost,
                        compareData.crop_1.total_cost,
                        true
                      )}
                    >
                      ${formatter.format(compareData.crop_2.total_cost)}
                    </td>
                  </tr>
                  <tr>
                    <td>Average Efficiency (g/L)</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.average_efficiency,
                        compareData.crop_2.average_efficiency
                      )}
                    >
                      {compareData.crop_1.average_efficiency.toFixed(2)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.average_efficiency,
                        compareData.crop_1.average_efficiency
                      )}
                    >
                      {compareData.crop_2.average_efficiency.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Average Yield per Year (kg)</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.average_yield,
                        compareData.crop_2.average_yield
                      )}
                    >
                      {formatter.format(compareData.crop_1.average_yield)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.average_yield,
                        compareData.crop_1.average_yield
                      )}
                    >
                      {formatter.format(compareData.crop_2.average_yield)}
                    </td>
                  </tr>
                  <tr>
                    <td>Nutritional Yield / Litre</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.value_per_litre,
                        compareData.crop_2.value_per_litre
                      )}
                    >
                      {formatter.format(compareData.crop_1.value_per_litre)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.value_per_litre,
                        compareData.crop_1.value_per_litre
                      )}
                    >
                      {compareData.crop_2.value_per_litre}
                    </td>
                  </tr>
                  <tr>
                    <td>Nutritional Yield / m²</td>
                    <td
                      className={getBetterValue(
                        compareData.crop_1.value_per_area,
                        compareData.crop_2.value_per_area
                      )}
                    >
                      {formatter.format(compareData.crop_1.value_per_area)}
                    </td>
                    <td
                      className={getBetterValue(
                        compareData.crop_2.value_per_area,
                        compareData.crop_1.value_per_area
                      )}
                    >
                      {formatter.format(compareData.crop_2.value_per_area)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;
