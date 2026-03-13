from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

class HistoryItem(BaseModel):
    timestamp: str
    value: float

class HistoryResponse(BaseModel):
    parameter: str
    days: int
    data: List[HistoryItem]

class Alert(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    timestamp: str

class AlertsResponse(BaseModel):
    alerts: List[Alert]


# FertilizationEvent and FertilizationHistoryResponse moved to models/npk.py
