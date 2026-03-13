from fastapi import APIRouter
from models.dashboard import StatusResponse, WaterloggingRiskResponse
from services.dashboard_service import dashboard_service

router = APIRouter(tags=["Dashboard"])

@router.get("/status", response_model=StatusResponse)
async def get_status():
    """Returns current soil conditions and overall system status"""
    return dashboard_service.get_status()

# @router.get("/npk-predictions", ...) moved to routers/npk.py

@router.get("/waterlogging-risk", response_model=WaterloggingRiskResponse)
async def get_waterlogging_risk():
    """Returns waterlogging prediction and action plan"""
    return dashboard_service.get_waterlogging_risk()
