from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class NpkStatus(BaseModel):
    nitrogen: str
    phosphorus: str
    potassium: str

class StatusResponse(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    soil_moisture: float
    pH: float
    ec: float
    soil_temp: float
    air_temp: float
    humidity: float
    npk_status: NpkStatus
    waterlogging_risk: str
    wfps: float
    last_updated: str


# NpkValue, Recommendation, NpkPredictionResponse moved to models/npk.py

class WaterloggingRiskResponse(BaseModel):
    current_wfps: float
    current_moisture: float
    risk_level: str
    time_to_event_hours: int
    peak_wfps_predicted: float
    duration_hours: int
    rainfall_forecast_mm: float
    cause: str
    actions: List[str]
    potential_loss: float
    ml_risk_class: str
    ml_confidence: float
    ml_risk_probabilities: Dict[str, float]
    ml_hours_until_waterlogging: float
    ml_alert_active: bool
    ml_source: str
    rain_next_6h_mm: float = 0.0
    rain_next_24h_mm: float = 0.0
    peak_rain_hour: str = ""
    hourly_forecast: Optional[List[Dict]] = None

class SensorHistoryResponse(BaseModel):
    parameter: str
    days: int
    data: List[Dict]
    count: int
    min_value: float = 0.0
    max_value: float = 0.0
