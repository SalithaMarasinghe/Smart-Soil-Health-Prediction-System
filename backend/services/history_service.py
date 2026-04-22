from services.data_store import data_store
from services.weather_service import weather_service
from services.dashboard_service import dashboard_service

class HistoryService:
    def get_history(self, parameter: str, days: int) -> dict:
        history = data_store.get_history(parameter, days)
        return {"parameter": parameter, "days": days, "data": history}

    def get_alerts(self) -> dict:
        return {"alerts": data_store.alerts}


    # get_fertilization_history moved to services/npk_service.py

    def get_ph_predictions(self) -> dict:
        current = data_store.get_current_data()
        weather = weather_service.get_weather_forecast()
        mgmt = data_store.get_management_features()
        
        current_ph = current.get("pH", 6.5)
        
        # ── Real ML Inference ─────────────────────────────────────
        ml_forecast = dashboard_service.get_npk_ph_forecast()
        ph_7d = ml_forecast["pH"]
        
        # Calculate drift rate based on ML delta
        total_drift_per_week = ph_7d - current_ph
        
        predictions = {
            "7d": ph_7d,
            "30d": current_ph + (total_drift_per_week * 4.2),
            "90d": current_ph + (total_drift_per_week * 12.8)
        }

        
        status = "optimal" if 6.0 <= current_ph <= 7.0 else "acidic" if current_ph < 6.0 else "alkaline"
        
        return {
            "current_status": {
                "pH": current_ph,
                "status": status,
                "range": "6.0-7.0 (Optimal)",
                "trend": "decreasing" if total_drift_per_week < 0 else "increasing",
                "buffer_capacity": mgmt.get("buffer_capacity", "Moderate (CEC 15)")
            },
            "predictions": predictions,
            "drift_analysis": {
                "rate": total_drift_per_week,
                "unit": "pH units per week",
                "cause": "Historical drift + Management impact" if total_drift_per_week < 0 else "Balanced stabilization",
                "time_to_critical": f"{int((current_ph - 6.0) / abs(total_drift_per_week))} weeks until critical (6.0)" if current_ph > 6.0 else "Already below critical"
            },
            "nutrient_availability": {
                "current_pH_6_8": { # Label as general optimal
                    "nitrogen": "95%",
                    "phosphorus": "98%",
                    "potassium": "100%"
                },
                "if_pH_drops_to_5_5": {
                    "nitrogen": "90%",
                    "phosphorus": "60%",
                    "potassium": "95%",
                    "warning": "Phosphorus availability drops significantly below pH 5.8"
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
