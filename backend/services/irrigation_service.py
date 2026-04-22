from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
import numpy as np
import joblib

from services.data_store import data_store
from services.weather_service import weather_service
from services.dashboard_service import dashboard_service

ML_DIR = Path(__file__).parent.parent / "ML" / "Irrigation"
MODEL_PATH = ML_DIR / "xgb_regressor.joblib"

# Irrigation agronomy tuning defaults (kept centralized for safe updates).
OPTIMAL_MOISTURE_MIN = 40.0
OPTIMAL_MOISTURE_MAX = 60.0
IRRIGATION_STRESS_THRESHOLD = 35.0
SEVERE_STRESS_THRESHOLD = 28.0
TARGET_MOISTURE = 52.0
LITER_PER_M2_PER_MOISTURE_POINT = 0.65
MIN_IRRIGATION_VOLUME_L_PER_M2 = 8.0
MAX_IRRIGATION_VOLUME_L_PER_M2 = 35.0
PREDICTION_BLEND_WEIGHT = 0.7


@lru_cache(maxsize=1)
def _load_irrigation_model():
    return joblib.load(MODEL_PATH)


class IrrigationService:
    @staticmethod
    def _clamp_moisture(value: float) -> float:
        return float(np.clip(value, 0.0, 100.0))

    @staticmethod
    def _status_from_moisture(moisture: float) -> str:
        if OPTIMAL_MOISTURE_MIN <= moisture <= OPTIMAL_MOISTURE_MAX:
            return "optimal"
        return "low" if moisture < OPTIMAL_MOISTURE_MIN else "high"

    @staticmethod
    def _compute_timing(needs_irrigation: bool, severe_stress: bool, waterlogging_safe: bool, rain_next_6h: float) -> str:
        if not needs_irrigation:
            return "N/A"
        if not waterlogging_safe:
            return "postpone irrigation until risk lowers"
        if severe_stress:
            return "within 6 hours"
        if rain_next_6h > 3.0:
            return "after next 6 hours (rain expected)"
        return "within 12 hours"

    @staticmethod
    def _compute_volume_l_per_m2(pred_24h: float, needs_irrigation: bool) -> float:
        if not needs_irrigation:
            return 0.0
        moisture_gap = max(TARGET_MOISTURE - pred_24h, 0.0)
        raw_volume = moisture_gap * LITER_PER_M2_PER_MOISTURE_POINT
        bounded = float(np.clip(raw_volume, MIN_IRRIGATION_VOLUME_L_PER_M2, MAX_IRRIGATION_VOLUME_L_PER_M2))
        return round(bounded, 2)

    def _predict_moisture_base(self, current: dict, weather: dict) -> float:
        model = _load_irrigation_model()

        avg_temp_24h = (
            float(np.mean(weather["hourly_temp_c"][:24]))
            if weather.get("hourly_temp_c")
            else float(current["air_temp"])
        )
        avg_humidity_24h = (
            float(np.mean(weather["hourly_humidity_pct"][:24]))
            if weather.get("hourly_humidity_pct")
            else float(current["humidity"])
        )

        feature_vector = np.array(
            [[
                float(current["soil_temp"]),
                float(current["pH"]),
                float(current["ec"]),
                float(current["nitrogen"]),
                float(current["phosphorus"]),
                float(current["potassium"]),
                float(avg_temp_24h),
                float(avg_humidity_24h),
            ]],
            dtype=np.float32
        )

        try:
            predicted = float(model.predict(feature_vector)[0])
            return self._clamp_moisture(predicted)
        except Exception as e:
            print(f"WARNING: Irrigation ML prediction failed ({e}), using fallback trend.")
            return self._clamp_moisture(float(current["soil_moisture"]) * 0.9)

    def get_predictions(self) -> dict:
        current = data_store.get_current_data()
        weather = weather_service.get_weather_forecast()
        waterlogging = dashboard_service.get_waterlogging_risk()

        base_24h_prediction = self._predict_moisture_base(current, weather)
        current_moisture = float(current["soil_moisture"])
        rain_48h = float(weather.get("rain_next_48h_mm", 0.0))

        retention_boost = float(np.clip(rain_48h / 120.0, 0.0, 0.35))
        horizon_factors = {
            "1h": 0.995 + (retention_boost * 0.15),
            "6h": 0.970 + (retention_boost * 0.20),
            "24h": 1.000,
            "3d": 0.900 + (retention_boost * 0.40),
            "7d": 0.780 + (retention_boost * 0.50),
        }

        blended_24h = (PREDICTION_BLEND_WEIGHT * base_24h_prediction) + ((1 - PREDICTION_BLEND_WEIGHT) * current_moisture)

        predictions = {
            "1h": round(self._clamp_moisture(current_moisture * horizon_factors["1h"]), 1),
            "6h": round(self._clamp_moisture(current_moisture * horizon_factors["6h"]), 1),
            "24h": round(self._clamp_moisture(blended_24h), 1),
            "3d": round(self._clamp_moisture(blended_24h * horizon_factors["3d"]), 1),
            "7d": round(self._clamp_moisture(blended_24h * horizon_factors["7d"]), 1),
        }

        needs_irrigation = predictions["7d"] < IRRIGATION_STRESS_THRESHOLD
        severe_stress = predictions["24h"] < SEVERE_STRESS_THRESHOLD
        waterlogging_safe = waterlogging.get("risk_level", "LOW").upper() not in {"HIGH", "CRITICAL"}
        action = "irrigate" if needs_irrigation and waterlogging_safe else "monitor"

        water_volume_per_m2 = self._compute_volume_l_per_m2(predictions["24h"], needs_irrigation)
        water_volume_hectare = int(round(water_volume_per_m2 * 10000))

        traditional_cost = round(water_volume_hectare * 0.0055, 2)
        optimized_cost = round(traditional_cost * (0.74 if needs_irrigation else 1.0), 2)
        savings = round(max(traditional_cost - optimized_cost, 0.0), 2)

        rain_next_6h = float(weather.get("rain_next_6h_mm", 0.0))
        timing = self._compute_timing(
            needs_irrigation=needs_irrigation,
            severe_stress=severe_stress,
            waterlogging_safe=waterlogging_safe,
            rain_next_6h=rain_next_6h,
        )

        confidence_band = float(np.clip(1.2 + (rain_48h * 0.03), 1.2, 4.0))
        trend = "decreasing" if predictions["7d"] < predictions["24h"] else "stable"

        coordination_message = (
            f"Safe to irrigate - Waterlogging risk is {waterlogging.get('risk_level', 'LOW')}"
            if waterlogging_safe
            else f"Irrigation postponed - Waterlogging risk is {waterlogging.get('risk_level', 'HIGH')}"
        )

        reason = (
            f"ML forecast indicates moisture near {predictions['7d']}% by day 7, below the {IRRIGATION_STRESS_THRESHOLD:.0f}% stress threshold."
            if needs_irrigation
            else f"Moisture remains around {predictions['7d']}% over 7 days under current weather."
        )

        return {
            "current_status": {
                "soil_moisture": round(current_moisture, 1),
                "status": self._status_from_moisture(current_moisture),
                "range": "40-60%"
            },
            "predictions": predictions,
            "trend": trend,
            "confidence": f"±{confidence_band:.1f}%",
            "recommendation": {
                "action": action,
                "timing": timing if action == "irrigate" else "N/A",
                "reason": reason,
                "water_volume_per_m2": water_volume_per_m2,
                "water_volume_hectare": water_volume_hectare,
                "optimal_time": "6:00-8:00 AM (low evaporation)",
                "cost_traditional": traditional_cost,
                "cost_optimized": optimized_cost,
                "savings": savings
            },
            "coordination": {
                "waterlogging_safe": waterlogging_safe,
                "message": coordination_message
            }
        }

    def get_history(self, days: int = 30) -> dict:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        events = [
            e for e in data_store.irrigation_history
            if datetime.fromisoformat(e["date"]) >= cutoff
        ]
        return {"events": events}

    def log_event(self, data: dict) -> dict:
        return data_store.log_irrigation(data)


irrigation_service = IrrigationService()
