from crops_db import CROPS
from schemas import Crop, SimulateResponse, Annual_Projection
from itertools import accumulate
import random

def get_crop_data(id):
    for c in CROPS:
        if c['id'] == id:
            return Crop(**c)   
    return None

def get_weather_factor():
    # Average weather impact across seasons
    seasons = {
        "spring": random.uniform(0.9, 1.2),
        "summer": random.uniform(0.7, 1.4),
        "autumn": random.uniform(0.8, 1.1),
        "winter": random.uniform(0.5, 1.0)
    }
    return sum(seasons.values()) / len(seasons)

def get_cost_factor():
    # Simulate cost variations (inflation, market prices, etc)
    return random.uniform(0.85, 1.15)

def simulation(crop: Crop, years, water_avail) -> SimulateResponse:
    annual_data = []
    crops_plantable = int(water_avail / crop.water_needed * 365)

    for year in range(1, years + 1):        
        # Calculate yearly yields, costs and efficiency
        base_yield = crops_plantable * crop.yield_per_crop * (365/crop.days_to_mature)
        actual_yield = base_yield * get_weather_factor() 
        total_cost = crops_plantable * crop.cost_per_crop * (365/crop.days_to_mature) * get_cost_factor()
        water_used = crops_plantable * crop.water_needed * 365
        efficiency = actual_yield / water_used


        annual_data.append(Annual_Projection(
            year = year,
            annual_yield = round(actual_yield, 2),
            annual_cost = round(total_cost, 2),
            annual_efficiency = round(efficiency * 1000, 6),
        ))

    # Calculate summary statistics
    sum_yield = sum(y.annual_yield for y in annual_data)
    sum_cost = sum(y.annual_cost for y in annual_data)
    avg_efficiency = sum(y.annual_efficiency for y in annual_data) / len(annual_data)
    total_nutritional_output = sum_yield * crop.nutritional_index

    summary_stats = {
        "sum_of_yield": round(sum_yield, 2),
        "sum_of_cost": round(sum_cost, 2),
        "average_efficiency": round(avg_efficiency, 2),
        "yield_per_year_avg": round(sum_yield / years, 2),
        "value_per_litre": round(total_nutritional_output / water_used, 2),
        "value_per_area": round(total_nutritional_output / (crops_plantable * crop.space_required), 2)
    }

    return SimulateResponse(
        crop = crop,
        annual_data = annual_data,
        summary = summary_stats
    )


def cumulative(annual_data):
    cumulative_data = {
        "yield_accum": list(accumulate([y.annual_yield for y in annual_data])),
        "cost_accum": list(accumulate([c.annual_cost for c in annual_data])),
    }

    return cumulative_data
        

