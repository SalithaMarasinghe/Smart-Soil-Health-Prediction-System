from fastapi import APIRouter
from models.dashboard import StatusResponse, WaterloggingRiskResponse, SensorHistoryResponse
from services.dashboard_service import dashboard_service
from services.data_store import data_store

router = APIRouter(tags=["Dashboard"])

@router.get("/status", response_model=StatusResponse)
async def get_status():
    """Returns current soil conditions and overall system status"""
    return dashboard_service.get_status()

@router.get("/sensor-history", response_model=SensorHistoryResponse)
async def get_sensor_history(parameter: str, days: int = 7):
    """Returns historical sensor data for a specific parameter"""
    data = data_store.get_history_for_parameter(parameter, days)
    
    if not data:
        return {
            "parameter": parameter,
            "days": days,
            "data": [],
            "count": 0,
            "min_value": 0.0,
            "max_value": 0.0
        }
    
    values = [d["value"] for d in data]
    return {
        "parameter": parameter,
        "days": days,
        "data": data,
        "count": len(data),
        "min_value": min(values),
        "max_value": max(values)
    }

# @router.get("/npk-predictions", ...) moved to routers/npk.py

@router.get("/waterlogging-risk", response_model=WaterloggingRiskResponse)
async def get_waterlogging_risk():
    """Returns waterlogging prediction and action plan"""
    return dashboard_service.get_waterlogging_risk()
