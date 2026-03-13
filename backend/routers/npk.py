from fastapi import APIRouter
from models.npk import NpkPredictionResponse, FertilizationHistoryResponse
from services.npk_service import npk_service

router = APIRouter(tags=["NPK Management"])

@router.get("/npk-predictions", response_model=NpkPredictionResponse, response_model_by_alias=True)
async def get_npk_predictions():
    """Returns NPK forecast and fertilization recommendation"""
    return npk_service.get_npk_predictions()

@router.get("/fertilization-history", response_model=FertilizationHistoryResponse)
async def get_fertilization_history():
    """Returns past fertilization events"""
    return npk_service.get_fertilization_history()
