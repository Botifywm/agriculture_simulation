import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

function CropList() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/list`);
      if (!response.ok) throw new Error("Failed to fetch crops");
      const data = await response.json();
      setCrops(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading crops...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="crop-list-container">
      <h2>Available Crops</h2>
      <div className="table-container">
        <table className="crop-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost per Crop ($)</th>
              <th>Yield per Crop (kg)</th>
              <th>Space Required (m²)</th>
              <th>Days to Mature</th>
              <th>Water Needed (L/day)</th>
              <th>Nutritional Index</th>
              <th>Efficiency (g/Litre)</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop) => (
              <tr key={crop.id}>
                <td className="crop-name">{crop.name}</td>
                <td>${crop.cost_per_crop.toFixed(2)}</td>
                <td>{crop.yield_per_crop.toFixed(2)}</td>
                <td>{crop.space_required.toFixed(2)}</td>
                <td>{crop.days_to_mature}</td>
                <td>{crop.water_needed.toFixed(2)}</td>
                <td>{crop.nutritional_index.toFixed(2)}</td>
                <td className="efficiency">
                  {(
                    (crop.yield_per_crop * 1000) /
                    (crop.days_to_mature * crop.water_needed)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CropList;
