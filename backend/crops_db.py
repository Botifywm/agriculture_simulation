CROPS = [
    {
        "id": "wheat",
        "name": "Wheat",
        "cost_per_crop": 0.03,        # USD per plant (seed cost)
        "yield_per_crop": 0.035,      # kg per plant (harvest weight)
        "space_required": 0.02,       # m² per plant
        "days_to_mature": 120,        # days until harvest
        "water_needed": 0.1,          # L/day per plant
        "nutritional_index": 42    # 0-100, weighted in the context of staple food - prioritising calories then protein
    },
    {
        "id": "corn",
        "name": "Corn",
        "cost_per_crop": 0.15,
        "yield_per_crop": 0.25,
        "space_required": 0.25,
        "days_to_mature": 90,
        "water_needed": 1.2,
        "nutritional_index": 57
    },
    {
        "id": "soybean",
        "name": "Soybean",
        "cost_per_crop": 0.05,
        "yield_per_crop": 0.15,
        "space_required": 0.15,
        "days_to_mature": 100,
        "water_needed": 0.8,
        "nutritional_index": 63
    },
    {
        "id": "potato",
        "name": "Potato",
        "cost_per_crop": 0.20,
        "yield_per_crop": 1.5,
        "space_required": 0.25,
        "days_to_mature": 110,
        "water_needed": 0.9,
        "nutritional_index": 81
    },
    {
        "id": "rice",
        "name": "Rice",
        "cost_per_crop": 0.02,
        "yield_per_crop": 0.04,
        "space_required": 0.02,
        "days_to_mature": 150,
        "water_needed": 2.5,
        "nutritional_index": 50
    }
]
