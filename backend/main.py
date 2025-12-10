from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from crops_db import CROPS
from services import get_crop_data, simulation, cumulative
from schemas import Crop, SimulateRequest, SimulateResponse, CompareRequest


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Ping Successful",
        "endpoints": ["/list", "/simulate/{crop_id}", "/compare"]
    }

@app.get("/list", response_model = list[Crop])
def get_crop_list():
    """
    Get the list of crops available to be planted
    """ 
    return CROPS

@app.post("/simulate/{crop_id}", response_model = SimulateResponse)
def simulate_crop(crop_id: str, req: SimulateRequest):   
    """
    Simulate the crops based on the inputs for water availability 
    and number of years

    Provides key statistics based on the type of crop:
    - Yield
    - Cost
    - Efficiency
    - Nutritional Yield (calculated based on calories and nutritional value)
    """ 
    # Gather all the required inputs and data to calculate
    crop_chosen = get_crop_data(crop_id)
    if crop_chosen == None:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_id}' not found")
    
    years = int(req.years)
    water_avail = float(req.water_availability) # anuual basis

    return simulation(crop = crop_chosen, years = years, water_avail = water_avail)


@app.post("/compare")
def compare_crops(req: CompareRequest):
    """
    Compare two different crops side-by-side.
    User can have the option of just comparing the base 
    characteristics or a simulated sitaution.

    Provides key metrics for agricultural decision-making:
    - Water efficiency (kg produced per liter of water)
    - Overall efficiency (yield per unit of time and water)
    - Cost comparison
    - Output (total yield over time period)
    - Nutritional Yield analysis (Essential to sustain over long period of famine)
    """ 
    crop1 = get_crop_data(req.crop1_id)
    crop2 = get_crop_data(req.crop2_id)

    if req.option == "characteristics":
        comparison_characteristics = {
            "crop_1": {
                "name": crop1.name,
                "cost_per_crop": crop1.cost_per_crop,
                "yield_per_crop": crop1.yield_per_crop,
                "space_required": crop1.space_required,
                "days_to_mature": crop1.days_to_mature,
                "water_needed": crop1.water_needed,
                "nutritional_index": crop1.nutritional_index,
                "efficiency": crop1.calc_efficiency(),
            },
            "crop_2": {
                "name": crop2.name,
                "cost_per_crop": crop2.cost_per_crop,
                "yield_per_crop": crop2.yield_per_crop,
                "space_required": crop2.space_required,
                "days_to_mature": crop2.days_to_mature,
                "water_needed": crop2.water_needed,
                "nutritional_index": crop2.nutritional_index,
                "efficiency": crop2.calc_efficiency() 
            },
            "comparative_index": {
                "cost_ratio": crop1.cost_per_crop / crop2.cost_per_crop,
                "yield_ratio": crop1.yield_per_crop / crop2.yield_per_crop,
                "space_required_ratio": crop1.space_required / crop2.space_required,
                "harvest_ratio": crop1.days_to_mature / crop2.days_to_mature,
                "water_ratio": crop1.water_needed / crop2.water_needed,
                "nutritional_ratio": crop1.nutritional_index / crop2.nutritional_index,
                "efficiency_ratio": crop1.calc_efficiency() / crop2.calc_efficiency() 
            }
        }

        return comparison_characteristics
    
    else:
        simualated_crop1 = simulation(crop = crop1, years = req.years, water_avail = req.water_availability)
        simualated_crop2 = simulation(crop = crop2, years = req.years, water_avail = req.water_availability)

        cumulative_crop1 = cumulative(simualated_crop1.annual_data)
        cumulative_crop2 = cumulative(simualated_crop2.annual_data)
        
        comparison_simulation = {
            "crop_1": {
                "name": simualated_crop1.crop.name,
                "average_efficiency": simualated_crop1.summary["average_efficiency"],
                "total_yield" : simualated_crop1.summary["sum_of_yield"],
                "total_cost" : simualated_crop1.summary["sum_of_cost"],
                "average_yield": simualated_crop1.summary["yield_per_year_avg"],
                "accum_cost" : cumulative_crop1["cost_accum"],
                "accum_yield": cumulative_crop1["yield_accum"],
                "value_per_litre": simualated_crop1.summary["value_per_litre"],
                "value_per_area": simualated_crop1.summary["value_per_area"]
            },
            "crop_2": {
                "name": simualated_crop2.crop.name,
                "average_efficiency": simualated_crop2.summary["average_efficiency"],
                "total_yield" : simualated_crop2.summary["sum_of_yield"],
                "total_cost" : simualated_crop2.summary["sum_of_cost"],
                "average_yield": simualated_crop2.summary["yield_per_year_avg"],
                "accum_cost" : cumulative_crop2["cost_accum"],
                "accum_yield": cumulative_crop2["yield_accum"],
                "value_per_litre": simualated_crop2.summary["value_per_litre"],
                "value_per_area": simualated_crop2.summary["value_per_area"]
            }
        }

        return comparison_simulation

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
        
    


    



