from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime

class NpkValue(BaseModel):
    N: float
    P: float
    K: float

class Recommendation(BaseModel):
    action: str
    timing: str
    fertilizer_type: str
    amount_kg: float
    reason: str
    cost_savings: float

class NpkPredictionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    current: NpkValue
    seven_days: NpkValue = Field(alias="7_days")
    fourteen_days: NpkValue = Field(alias="14_days")
    recommendation: Recommendation

class FertilizationEvent(BaseModel):
    id: str
    date: str
    type: str
    amount_kg: float
    cost: float

class FertilizationHistoryResponse(BaseModel):
    events: List[FertilizationEvent]
