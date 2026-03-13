from services.data_store import data_store

class IrrigationService:
    def get_predictions(self) -> dict:
        current = data_store.get_current_data()
        
        # Generate mock predictions (declining trend)
        predictions = {
            "1h": round(current["soil_moisture"] * 0.98, 1),
            "6h": round(current["soil_moisture"] * 0.94, 1),
            "24h": round(current["soil_moisture"] * 0.84, 1), 
            "3d": round(current["soil_moisture"] * 0.72, 1),
            "7d": round(current["soil_moisture"] * 0.63, 1)  
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

    def get_history(self) -> dict:
        return {"events": data_store.irrigation_history}

    def log_event(self, data: dict) -> dict:
        return data_store.log_irrigation(data)

irrigation_service = IrrigationService()
