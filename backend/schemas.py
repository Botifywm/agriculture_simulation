from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class Crop(BaseModel):
    id: str
    name: str
    cost_per_crop: float = Field(description = "Cost in currency units")
    yield_per_crop: float = Field(description = "Yield per crop in kg per harverst (days to mature)")
    space_required: float = Field(description = "Space in square meters")
    days_to_mature: int = Field(description = "Days required to mature")
    water_needed: float = Field(description = "Water in liters per crop")
    nutritional_index: float = Field(description = "0-1, weighted in the context of staple food - prioritising calories then protein")

    def calc_efficiency(self) -> float:
        # Calculate efficiency as yield / (days to mature * water needed)
        return (self.yield_per_crop / (self.days_to_mature * self.water_needed)) *1000

class SimulateRequest(BaseModel):
    years: int
    water_availability: float = Field(description = "Annual water availability in liters")
    land_availability: Optional[float] = Field(default= None, description = "Land availability in hectares")
    # water_availability_range: Optional[list[float]] = Field(default=None, description = "A range of annual water availability in liters")

class Annual_Projection(BaseModel):
    year: int
    annual_yield: float
    annual_cost: float
    annual_efficiency: float

class SimulateResponse(BaseModel):
    crop: Crop
    annual_data: list[Annual_Projection]
    summary: dict[str, float]

class CompareRequest(BaseModel):
    option: str
    crop1_id: str
    crop2_id: str
    years: int 
    water_availability: float = Field(description = "Annual water availability in liters")
    land_availabiliy: Optional[float] = Field(default= None,description = "Land availability in hectares")


