import google.generativeai as genai
from fastapi import HTTPException
from config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Gemini client
if not settings.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing or empty in environment configuration.")

genai.configure(api_key=settings.GEMINI_API_KEY)

from services.dashboard_service import dashboard_service

async def get_ai_reply(user_message: str) -> str:
    """
    Get AI-generated reply from Gemini with dashboard context.
    """
    try:
        # Fetch current system status for context
        status = dashboard_service.get_status()
        risk = dashboard_service.get_waterlogging_risk()
        
        # Construct detailed context
        context = f"""
System Context:
You are an intelligent agriculture expert assistant for the Smart Soil Monitoring System.
The user is managing a tomato farm in Sri Lanka.

Current Field Status:
- Nitrogen: {status['nitrogen']} mg/kg ({status['npk_status']['nitrogen']})
- Phosphorus: {status['phosphorus']} mg/kg ({status['npk_status']['phosphorus']})
- Potassium: {status['potassium']} mg/kg ({status['npk_status']['potassium']})
- Soil Moisture: {status['soil_moisture']}% (WFPS: {status['wfps']}%)
- pH Level: {status['pH']}
- Waterlogging Risk: {status['waterlogging_risk']} (Predicted peak WFPS: {risk['peak_wfps_predicted']}%)
- Weather: {status['air_temp']}°C, {status['humidity']}% humidity, {risk['rainfall_forecast_mm']}mm rain forecasted.

Dashboard Navigation Guide:
- 'Dashboard': Overview of current levels and active alerts.
- 'NPK': Historical nutrient trends and 14-day fertilization predictions.
- 'Irrigation/Water': Waterlogging risk assessment and drainage action plans.
- 'pH': Soil acidity monitoring and historical data.
- 'History': Raw data exploration over 1-30 days with export options.
- 'Analytics': Advanced agricultural insights and trend explanations.

User Query: {user_message}

Provide a concise, expert response based on the data above.
"""
        
        # Call the model: gemini-2.5-flash
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(context)
        
        if not response or not response.text:
            return "I couldn't generate a response. Please rephrase your question."
            
        return response.text
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again."
        )
