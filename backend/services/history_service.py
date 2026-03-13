from datetime import datetime, timedelta, timezone
from services.data_store import data_store

class HistoryService:
    def get_history(self, parameter: str, days: int) -> dict:
        history = data_store.get_history(parameter, days)
        return {"parameter": parameter, "days": days, "data": history}

    def get_alerts(self) -> dict:
        return {"alerts": data_store.alerts}


    # get_fertilization_history moved to services/npk_service.py

    def get_ph_predictions(self) -> dict:
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

    def get_ph_history(self) -> dict:
        return {"history": data_store.ph_history}

history_service = HistoryService()
