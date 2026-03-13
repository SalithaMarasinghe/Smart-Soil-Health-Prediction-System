from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class IrrigationStatus(BaseModel):
    soil_moisture: float
    status: str
    range: str

class IrrigationRecommendation(BaseModel):
    action: str
    timing: str
    reason: str
    water_volume_per_m2: float
    water_volume_hectare: int
    optimal_time: str
    cost_traditional: float
    cost_optimized: float
    savings: float

class Coordination(BaseModel):
    waterlogging_safe: bool
    message: str

class IrrigationPredictionResponse(BaseModel):
    current_status: IrrigationStatus
    predictions: Dict[str, float]
    trend: str
    confidence: str
    recommendation: IrrigationRecommendation
    coordination: Coordination

class IrrigationEvent(BaseModel):
    id: str
    date: str
    volume_liters: int
    moisture_before: float
    moisture_after: float
    cost: float

class IrrigationHistoryResponse(BaseModel):
    events: List[IrrigationEvent]

class IrrigationLogRequest(BaseModel):
    volume_liters: int
    moisture_before: Optional[float] = None
    moisture_after: Optional[float] = None
    cost: Optional[float] = None
