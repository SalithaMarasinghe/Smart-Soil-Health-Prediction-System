from services.data_store import data_store
from services.weather_service import weather_service
from services.dashboard_service import dashboard_service
import numpy as np

class NpkService:
    def get_npk_predictions(self) -> dict:
        current = data_store.get_current_data()
        weather = weather_service.get_weather_forecast()
        
        # ── Real ML Inference ─────────────────────────────────────
        # Bridge the gap by calling the Multi-Output Regressor
        ml_forecast = dashboard_service.get_npk_ph_forecast()
        
        # ── Weather Integration (Leaching) ────────────────────────
        # The ML model doesn't have 'rain' as an input, so we adjust the output
        leaching_multiplier = 1.0
        if weather["rain_next_48h_mm"] > 25:
            leaching_multiplier = 0.85 # 15% reduction due to predicted leaching
        elif weather["rain_next_48h_mm"] > 10:
            leaching_multiplier = 0.95
            
        n_7d = ml_forecast["N"] * leaching_multiplier
        p_7d = ml_forecast["P"] # P doesn't leach easily
        k_7d = ml_forecast["K"] * leaching_multiplier
        
        # 14-day is estimated by extending the 7-day trend from ML
        # (This keeps the 14-day projection consistent with the ML logic)
        n_14d = max(current["nitrogen"] + (n_7d - current["nitrogen"]) * 2, 0)
        p_14d = max(current["phosphorus"] + (p_7d - current["phosphorus"]) * 2, 0)
        k_14d = max(current["potassium"] + (k_7d - current["potassium"]) * 2, 0)
        
        # 2. Smart Recommendation Logic (Unchanged from dynamic implementation)
        
        # 4. Smart Recommendation Logic
        thresholds = {"N": 150, "P": 30, "K": 200}
        needs_n = n_7d < thresholds["N"]
        needs_p = p_7d < thresholds["P"]
        needs_k = k_7d < thresholds["K"]
        
        action = "fertilize" if needs_n or needs_p or needs_k else "monitor"
        
        # Dynamic Timing based on depletion speed
        timing = "Immediate" if any([current["nitrogen"] < thresholds["N"], current["phosphorus"] < thresholds["P"]]) else "within 3-5 days"
        
        reasons = []
        if needs_n: 
            risk = "leaching risk" if leaching_multiplier > 1.0 else "natural depletion"
            reasons.append(f"Nitrogen dropping due to {risk}")
        
        recommendation = {
            "action": action,
            "timing": timing if action == "fertilize" else "N/A",
            "fertilizer_type": "NPK 20-10-10" if action == "fertilize" else "N/A",
            "amount_kg": 50.0 if action == "fertilize" else 0.0,
            "reason": " | ".join(reasons) if reasons else "Nutrient levels are stable under current weather conditions.",
            "cost_savings": 1450.0 if action == "fertilize" else 0.0
        }
        
        return {
            "current": {"N": current["nitrogen"], "P": current["phosphorus"], "K": current["potassium"]},
            "7_days": {"N": n_7d, "P": p_7d, "K": k_7d},
            "14_days": {"N": n_14d, "P": p_14d, "K": k_14d},
            "recommendation": recommendation,
            "environmental_factors": {
                "leaching_risk": "high" if leaching_multiplier > 1.4 else "medium" if leaching_multiplier > 1.1 else "low",
                "biological_activity": "high" if activity_multiplier > 1.1 else "normal"
            }
        }


    def get_fertilization_history(self) -> dict:
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

npk_service = NpkService()
