from datetime import datetime, timezone
from services.data_store import data_store
from models.dashboard import StatusResponse, WaterloggingRiskResponse

class DashboardService:
    def get_status(self) -> dict:
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


    # get_npk_predictions moved to services/npk_service.py

    def get_waterlogging_risk(self) -> dict:
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

dashboard_service = DashboardService()
