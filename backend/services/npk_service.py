from datetime import datetime, timedelta, timezone
from services.data_store import data_store

class NpkService:
    def get_npk_predictions(self) -> dict:
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
