from fastapi import APIRouter, Query
from models.history import HistoryResponse, AlertsResponse
from services.history_service import history_service

router = APIRouter(tags=["History"])

@router.get("/history", response_model=HistoryResponse)
async def get_history(
    parameter: str = Query(..., description="Parameter to fetch (nitrogen, phosphorus, potassium, soil_moisture, pH)"),
    days: int = Query(7, description="Number of days of history")
):
    """Returns historical data for charts"""
    return history_service.get_history(parameter, days)

@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts():
    """Returns active alerts"""
    return history_service.get_alerts()

# @router.get("/fertilization-history", ...) moved to routers/npk.py

@router.get("/ph-predictions")
async def get_ph_predictions():
    """Returns pH predictions and correction recommendations"""
    return history_service.get_ph_predictions()

@router.get("/ph-history")
async def get_ph_history():
    """Returns historical pH with fertilization markers"""
    return history_service.get_ph_history()
