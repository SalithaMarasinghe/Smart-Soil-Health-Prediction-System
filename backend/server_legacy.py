from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Mock data storage
class DataStore:
    def __init__(self):
        self.historical_data = self._generate_historical_data()
        self.alerts = self._generate_alerts()
        self.irrigation_history = self._generate_irrigation_history()
        self.ph_history = self._generate_ph_history()

    def _generate_historical_data(self):
        """Generate 30 days of historical sensor data"""
        data = []
        base_time = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Baseline values
        n_base = 210
        p_base = 52
        k_base = 360
        moisture_base = 40
        
        for i in range(720):  # 30 days * 24 hours
            timestamp = base_time + timedelta(hours=i)
            
            # Simulate fertilization event 12 days ago (288 hours ago)
            if i == 432:
                n_base += 80
                p_base += 25
                k_base += 60
            
            # NPK depletion rates per hour
            n_depletion = 0.167  # ~4 mg/kg per day
            p_depletion = 0.075  # ~1.8 mg/kg per day
            k_depletion = 0.133  # ~3.2 mg/kg per day
            
            nitrogen = max(n_base - (n_depletion * (i if i < 432 else i - 432)), 120)
            phosphorus = max(p_base - (p_depletion * (i if i < 432 else i - 432)), 30)
            potassium = max(k_base - (k_depletion * (i if i < 432 else i - 432)), 200)
            
            # Moisture varies with some randomness
            moisture = moisture_base + random.uniform(-10, 15)
            
            data.append({
                "timestamp": timestamp.isoformat(),
                "nitrogen": round(nitrogen, 1),
                "phosphorus": round(phosphorus, 1),
                "potassium": round(potassium, 1),
                "soil_moisture": round(moisture, 1),
                "pH": round(6.5 + random.uniform(-0.3, 0.3), 1),
                "ec": round(1.2 + random.uniform(-0.2, 0.2), 2),
                "soil_temp": round(26 + random.uniform(-2, 2), 1),
                "air_temp": round(28 + random.uniform(-3, 3), 1),
                "humidity": round(75 + random.uniform(-10, 10), 1),
                "light_intensity": random.randint(3000, 8000) if 6 <= timestamp.hour <= 18 else random.randint(0, 100)
            })
        
        return data
    
    def _generate_alerts(self):
        """Generate active alerts"""
        return [
            {
                "id": "alert_001",
                "type": "waterlogging_risk",
                "severity": "high",
                "message": "Heavy rain in 48h - waterlogging likely",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "alert_002",
                "type": "npk_level",
                "severity": "medium",
                "message": "Nitrogen will drop below threshold in 5-7 days",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        
    def _generate_irrigation_history(self):
        """Generate mock irrigation history"""
        history = []
        base_time = datetime.now(timezone.utc)
        
        # Generate 5 events over the last 30 days
        for i in range(5):
            days_ago = (i * 6) + 2
            event_time = base_time - timedelta(days=days_ago)
            volume = random.randint(30000, 50000) # liters per hectare
            
            history.append({
                "id": f"irr_{i}",
                "date": event_time.isoformat(),
                "volume_liters": volume,
                "moisture_before": round(random.uniform(25, 30), 1),
                "moisture_after": round(random.uniform(55, 65), 1),
                "cost": round(volume * 0.035, 2) # approx cost calculation
            })
            
        return sorted(history, key=lambda x: x['date'], reverse=True)

    def _generate_ph_history(self):
        """Generate 90 days of pH history showing gradual acidification"""
        history = []
        base_time = datetime.now(timezone.utc)
        
        # Start at 7.0 (90 days ago) and drift down to 6.8 (today)
        # 12 days ago: Fertilization event accelerated the drop
        
        current_ph = 6.8
        
        for i in range(90):
            days_ago = i
            timestamp = base_time - timedelta(days=days_ago)
            
            # Linear drift calculation (reversed)
            # 0 days ago (today): 6.8
            # 12 days ago: ~6.84
            # 90 days ago: ~7.0
            
            if days_ago <= 12:
                # Steeper drop recently (due to urea)
                ph_val = 6.8 + (days_ago * 0.0035) 
            else:
                # Slower natural drift before that
                ph_val = 6.84 + ((days_ago - 12) * 0.002)
                
            # Add some noise
            ph_val += random.uniform(-0.02, 0.02)
            
            # Events
            event_type = None
            if days_ago == 12:
                event_type = "fertilization"
            elif days_ago == 60:
                event_type = "lime_application" # Just a historic marker
            
            history.append({
                "timestamp": timestamp.isoformat(),
                "pH": round(ph_val, 2),
                "event_type": event_type
            })
            
        return sorted(history, key=lambda x: x['timestamp'])

    def log_irrigation(self, data: dict):
        """Log a new irrigation event"""
        new_event = {
            "id": f"irr_{len(self.irrigation_history) + 1}",
            "date": datetime.now(timezone.utc).isoformat(),
            **data
        }
        # If cost not provided, calculate it
        if "cost" not in new_event:
            new_event["cost"] = round(new_event.get("volume_liters", 0) * 0.035, 2)
            
        # Add basic defaults if missing
        if "moisture_before" not in new_event:
             # Get current moisture from latest data
             current = self.get_current_data()
             new_event["moisture_before"] = current["soil_moisture"]
        if "moisture_after" not in new_event:
             # Estimate after moisture
             new_event["moisture_after"] = min(new_event["moisture_before"] + 20, 85.0)

        self.irrigation_history.insert(0, new_event)
        return new_event
    
    def get_current_data(self):
        """Get the most recent sensor reading"""
        return self.historical_data[-1]
    
    def get_history(self, parameter: str, days: int):
        """Get historical data for a specific parameter"""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        filtered = [d for d in self.historical_data if datetime.fromisoformat(d["timestamp"]) >= cutoff]
        
        return [{"timestamp": d["timestamp"], "value": d.get(parameter, 0)} for d in filtered]

# Initialize data store
data_store = DataStore()

@api_router.get("/status")
async def get_status():
    """Returns current soil conditions and overall system status"""
    current = data_store.get_current_data()
    
    # Determine NPK status
    npk_status = {
        "nitrogen": "adequate" if current["nitrogen"] >= 150 else "low",
        "phosphorus": "adequate" if current["phosphorus"] >= 30 else "low",
        "potassium": "adequate" if current["potassium"] >= 200 else "low"
    }
    
    # Calculate WFPS (Water-Filled Pore Space)
    wfps = (current["soil_moisture"] / 100) * 2 * 100  # Simplified calculation
    waterlogging_risk = "high" if wfps > 85 else "medium" if wfps > 70 else "low"
    
    return {
        "nitrogen": current["nitrogen"],
        "phosphorus": current["phosphorus"],
        "potassium": current["potassium"],
        "soil_moisture": current["soil_moisture"],
        "pH": current["pH"],
        "ec": current["ec"],
        "soil_temp": current["soil_temp"],
        "air_temp": current["air_temp"],
        "humidity": current["humidity"],
        "npk_status": npk_status,
        "waterlogging_risk": waterlogging_risk,
        "wfps": round(wfps, 1),
        "last_updated": current["timestamp"]
    }

@api_router.get("/npk-predictions")
async def get_npk_predictions():
    """Returns NPK forecast and fertilization recommendation"""
    current = data_store.get_current_data()
    
    # Predict 7 and 14 days ahead
    n_7d = max(current["nitrogen"] - (4 * 7), 120)
    p_7d = max(current["phosphorus"] - (1.8 * 7), 30)
    k_7d = max(current["potassium"] - (3.2 * 7), 200)
    
    n_14d = max(current["nitrogen"] - (4 * 14), 120)
    p_14d = max(current["phosphorus"] - (1.8 * 14), 30)
    k_14d = max(current["potassium"] - (3.2 * 14), 200)
    
    # Determine recommendation
    action = "fertilize" if n_7d < 150 or p_7d < 30 or k_7d < 200 else "monitor"
    
    recommendation = {
        "action": action,
        "timing": "within 5-7 days" if action == "fertilize" else "no action needed",
        "fertilizer_type": "NPK 20-10-10" if action == "fertilize" else "N/A",
        "amount_kg": 45 if action == "fertilize" else 0,
        "reason": "Nitrogen will drop below 150 mg/kg threshold" if n_7d < 150 else "Nutrient levels adequate",
        "cost_savings": 1050
    }
    
    return {
        "current": {
            "N": round(current["nitrogen"], 1),
            "P": round(current["phosphorus"], 1),
            "K": round(current["potassium"], 1)
        },
        "7_days": {
            "N": round(n_7d, 1),
            "P": round(p_7d, 1),
            "K": round(k_7d, 1)
        },
        "14_days": {
            "N": round(n_14d, 1),
            "P": round(p_14d, 1),
            "K": round(k_14d, 1)
        },
        "recommendation": recommendation
    }

@api_router.get("/waterlogging-risk")
async def get_waterlogging_risk():
    """Returns waterlogging prediction and action plan"""
    current = data_store.get_current_data()
    
    # Calculate current WFPS
    current_wfps = (current["soil_moisture"] / 100) * 2 * 100
    
    # Simulate heavy rain forecast in 48 hours
    rainfall_forecast = 25  # mm
    peak_wfps_predicted = current_wfps + (rainfall_forecast * 2)  # Simplified calculation
    
    risk_level = "HIGH" if peak_wfps_predicted > 100 else "MEDIUM" if peak_wfps_predicted > 85 else "LOW"
    
    actions = []
    if risk_level in ["HIGH", "MEDIUM"]:
        actions = [
            "Cancel irrigation scheduled for tomorrow",
            "Prepare drainage channels",
            "Delay fertilization until soil drains",
            "Monitor field conditions closely"
        ]
    
    return {
        "current_wfps": round(current_wfps, 1),
        "current_moisture": current["soil_moisture"],
        "risk_level": risk_level,
        "time_to_event_hours": 48,
        "peak_wfps_predicted": round(peak_wfps_predicted, 1),
        "duration_hours": 12,
        "rainfall_forecast_mm": rainfall_forecast,
        "cause": f"Heavy rain ({rainfall_forecast}mm) forecasted",
        "actions": actions,
        "potential_loss": 20000 if risk_level == "HIGH" else 10000
    }

@api_router.get("/history")
async def get_history(
    parameter: str = Query(..., description="Parameter to fetch (nitrogen, phosphorus, potassium, soil_moisture, pH)"),
    days: int = Query(7, description="Number of days of history")
):
    """Returns historical data for charts"""
    history = data_store.get_history(parameter, days)
    return {"parameter": parameter, "days": days, "data": history}

@api_router.get("/alerts")
async def get_alerts():
    """Returns active alerts"""
    return {"alerts": data_store.alerts}

@api_router.get("/irrigation-predictions")
async def get_irrigation_predictions():
    """Returns moisture predictions and irrigation recommendations"""
    current = data_store.get_current_data()
    
    # Generate mock predictions (declining trend)
    predictions = {
        "1h": round(current["soil_moisture"] * 0.98, 1),
        "6h": round(current["soil_moisture"] * 0.94, 1),
        "24h": round(current["soil_moisture"] * 0.84, 1), # Drops significantly
        "3d": round(current["soil_moisture"] * 0.72, 1),
        "7d": round(current["soil_moisture"] * 0.63, 1)  # Ends up around 28% if current is 45%
    }
    
    # Recommendation logic
    needs_irrigation = predictions["7d"] < 30.0
    
    return {
        "current_status": {
            "soil_moisture": current["soil_moisture"],
            "status": "optimal" if 40 <= current["soil_moisture"] <= 60 else "low" if current["soil_moisture"] < 40 else "high",
            "range": "40-60%"
        },
        "predictions": predictions,
        "trend": "decreasing",
        "confidence": "±2.1%",
        "recommendation": {
            "action": "irrigate" if needs_irrigation else "monitor",
            "timing": "within 24 hours" if needs_irrigation else "N/A",
            "reason": f"Moisture will drop to {predictions['7d']}% in 7 days (below 30% stress threshold)",
            "water_volume_per_m2": 35.4,
            "water_volume_hectare": 354000,
            "optimal_time": "6:00-8:00 AM (low evaporation)",
            "cost_traditional": 1680,
            "cost_optimized": 1200,
            "savings": 480
        },
        "coordination": {
            "waterlogging_safe": True,
            "message": "Safe to irrigate - no waterlogging risk detected"
        }
    }

@api_router.get("/irrigation-history")
async def get_irrigation_history(days: int = 30):
    """Returns past irrigation events"""
    # Simple filtering by days if needed, currently returns all mock data
    return {"events": data_store.irrigation_history}

@api_router.post("/irrigation/log")
async def log_irrigation(event: Dict[str, Any]):
    """Log a new irrigation event"""
    new_event = data_store.log_irrigation(event)
    return {"status": "success", "event": new_event}

@api_router.get("/fertilization-history")
async def get_fertilization_history():
    """Returns past fertilization events"""
    return {
        "events": [
            {
                "id": "fert_001",
                "date": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat(),
                "type": "NPK 20-10-10",
                "amount_kg": 50,
                "cost": 1200
            },
            {
                "id": "fert_002",
                "date": (datetime.now(timezone.utc) - timedelta(days=42)).isoformat(),
                "type": "NPK 15-15-15",
                "amount_kg": 45,
                "cost": 1100
            }
        ]
    }

@api_router.get("/ph-predictions")
async def get_ph_predictions():
    """Returns pH predictions and correction recommendations"""
    current_ph = 6.8
    
    return {
        "current_status": {
            "pH": current_ph,
            "status": "optimal",
            "range": "6.0-7.0",
            "trend": "slowly_decreasing",
            "buffer_capacity": "moderate (CEC 15, OM 3.2%)"
        },
        "predictions": {
            "7d": 6.75,
            "30d": 6.5,
            "90d": 6.2
        },
        "drift_analysis": {
            "rate": -0.025,
            "unit": "pH units per week",
            "cause": "Recent urea fertilization",
            "time_to_critical": "120 days until pH 6.0"
        },
        "nutrient_availability": {
            "current_pH_6_8": {
                "nitrogen": "95%",
                "phosphorus": "98%",
                "potassium": "100%"
            },
            "if_pH_drops_to_5_5": {
                "nitrogen": "90%",
                "phosphorus": "60%",
                "potassium": "95%",
                "warning": "40% phosphorus loss, aluminum toxicity risk"
            }
        },
        "recommendations": {
            "short_term": {
                "action": "monitor",
                "description": "No action needed - pH will remain safe for next 60 days",
                "frequency": "Check weekly"
            },
            "medium_term": {
                "action": "prepare_lime",
                "description": "If pH drops to 6.3, apply agricultural lime",
                "amount_kg": 200,
                "cost": 1200,
                "effect": "Raises pH by 0.4-0.6 units over 4-6 weeks"
            },
            "long_term": {
                "action": "switch_fertilizer",
                "description": "Consider switching from Urea → Calcium Ammonium Nitrate",
                "reason": "Reduce long-term soil acidification"
            }
        },
        "coordination": {
            "alert_to_npk": "⚠️ Urea fertilizer is acidifying soil (-0.025 pH/week)",
            "alert_to_irrigation": "✅ pH stable - no impact on irrigation",
            "fertilizer_recommendation": "Consider non-acidifying alternatives"
        }
    }

@api_router.get("/ph-history")
async def get_ph_history(days: int = 90):
    """Returns historical pH with fertilization markers"""
    # In a real scenario we'd filter by days, but we generated exactly 90 days in DataStore
    return {"history": data_store.ph_history}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Smart Soil Health Monitoring System API started")
