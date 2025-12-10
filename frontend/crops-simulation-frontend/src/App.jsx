import React, { useState } from "react";
import "./App.css";
import CropList from "./components/CropList";
import Simulate from "./components/Simulate";
import Compare from "./components/Compare";

function App() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="app">
      <header className="header">
        <h1>🌾 Agricultural Crop Simulation</h1>
        <p>Optimize crop selection for maximum yield and efficiency</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          📋 Crop List
        </button>
        <button
          className={`tab ${activeTab === "simulate" ? "active" : ""}`}
          onClick={() => setActiveTab("simulate")}
        >
          📊 Simulate
        </button>
        <button
          className={`tab ${activeTab === "compare" ? "active" : ""}`}
          onClick={() => setActiveTab("compare")}
        >
          ⚖️ Compare
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "list" && <CropList />}
        {activeTab === "simulate" && <Simulate />}
        {activeTab === "compare" && <Compare />}
      </main>
    </div>
  );
}

export default App;
