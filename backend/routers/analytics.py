from fastapi import APIRouter, HTTPException
from services.firebase_service import firebase_service
from models.analytics import RealTimeAnalytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/realtime", response_model=RealTimeAnalytics)
async def get_realtime_analytics():
    try:
        return firebase_service.get_realtime_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
