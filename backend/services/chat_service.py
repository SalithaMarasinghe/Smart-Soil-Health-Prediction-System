import google.generativeai as genai
from fastapi import HTTPException
from config import settings
import logging

import requests
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)

# Initialize Gemini client
if not settings.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing or empty in environment configuration.")

genai.configure(api_key=settings.GEMINI_API_KEY)

from services.dashboard_service import dashboard_service

def get_waterlogging_context_block() -> str:
    """
    Fetch latest waterlogging risk and sensor status to build a context block for the AI.
    """
    try:
        # Call service directly to avoid internal HTTP deadlock
        data = dashboard_service.get_waterlogging_risk()
        print(f"[FULL API RESPONSE] {data}")
        
        # Get Colombo time
        colombo_tz = pytz.timezone('Asia/Colombo')
        now = datetime.now(colombo_tz).strftime("%Y-%m-%d %H:%M IST")
        
        # We need to handle both dict and object (dashboard_service returns dict)
        risk_level = data.get('risk_level', 'Unknown')
        ml_class = data.get('ml_risk_class', 'Unknown')
        ml_conf = data.get('ml_confidence', 0)
        current_moisture = data.get('current_moisture', 0)
        current_wfps = data.get('current_wfps', 0)
        peak_wfps = data.get('peak_wfps_predicted', 0)
        time_to_event_hours = data.get('time_to_event_hours', 0)
        rain_6h = data.get('rain_next_6h_mm', 0)
        rain_24h = data.get('rain_next_24h_mm', 0)
        rainfall_forecast = data.get('rainfall_forecast_mm', 0)
        cause = data.get('cause', 'No specific cause identified')
        actions = data.get('actions', [])
        
        context = f"""[FIELD STATUS - {now}]
Risk: {risk_level} | ML: {ml_class} ({ml_conf * 100:.0f}% confidence)
Soil moisture: {current_moisture:.1f}% | Current WFPS: {current_wfps:.1f}% | Peak WFPS predicted: {peak_wfps:.1f}%
Hours to waterlogging: {time_to_event_hours}h
Rain (48h forecast): {rainfall_forecast}mm | Next 6h: {rain_6h}mm | Next 24h: {rain_24h}mm
Assessment: {cause}
Actions: {", ".join(actions) if actions else "None required"}"""
        print(f"[CONTEXT BLOCK] {context}")
        return context
    except Exception as e:
        logger.error(f"Failed to fetch waterlogging context: {e}")
        return "[FIELD STATUS UNAVAILABLE - live sensor data could not be retrieved]"

async def get_ai_reply(user_message: str, history: list = None, context_block: str = "") -> str:
    """
    Get AI-generated reply from Gemini with full session memory and field context.
    """
    print(f"[GET_AI_REPLY DEBUG] context_block preview: {context_block[:80] if context_block else 'EMPTY'}")
    
    if history is None:
        history = []
        
    try:
        # Build the message contents list
        contents = []
        
        # 1. Inject context block as a pseudo-conversation start if provided
        if context_block:
            contents.append({"role": "user", "parts": [{"text": f"FIELD STATUS:\n{context_block}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I have the current field status and am ready to assist the farmer."}]})
            
        # 2. Add history
        for item in history:
            # Pydantic models might be passed or dicts
            role = item.role if hasattr(item, 'role') else item.get('role')
            content = item.content if hasattr(item, 'content') else item.get('content')
            
            gemini_role = "user" if role == "user" else "model"
            contents.append({"role": gemini_role, "parts": [{"text": content}]})
            
        # 3. Add current message
        contents.append({"role": "user", "parts": [{"text": user_message}]})
        
        # Initialize model with system instruction
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction="You are an intelligent agricultural assistant for a tomato field monitoring system in Ankumbura, Central Province, Sri Lanka. You help farmers understand waterlogging risk, soil conditions, and weather specifically for tomato crops. At the start of each session you receive a FIELD STATUS block with live IoT sensor data — use it to answer farming questions accurately. Explain things in simple language suitable for a farmer. If asked about something unrelated to farming or the field, answer helpfully but briefly."
        )
        
        response = model.generate_content(contents=contents)
        
        if not response or not response.text:
            return "I couldn't generate a response. Please rephrase your question."
            
        return response.text
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again."
        )
