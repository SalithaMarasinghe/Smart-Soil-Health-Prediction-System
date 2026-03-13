from fastapi import APIRouter
from models.irrigation import IrrigationPredictionResponse, IrrigationHistoryResponse, IrrigationLogRequest
from services.irrigation_service import irrigation_service

router = APIRouter(tags=["Irrigation"])

@router.get("/irrigation-predictions", response_model=IrrigationPredictionResponse)
async def get_irrigation_predictions():
    """Returns moisture predictions and irrigation recommendations"""
    return irrigation_service.get_predictions()

@router.get("/irrigation-history", response_model=IrrigationHistoryResponse)
async def get_irrigation_history():
    """Returns past irrigation events"""
    return irrigation_service.get_history()

@router.post("/irrigation/log")
async def log_irrigation(event: IrrigationLogRequest):
    """Log a new irrigation event"""
    new_event = irrigation_service.log_event(event.dict(exclude_none=True))
    return {"status": "success", "event": new_event}
