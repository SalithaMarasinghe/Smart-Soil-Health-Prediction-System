from datetime import datetime, timezone
from services.data_store import data_store
from services.weather_service import weather_service
from models.dashboard import StatusResponse, WaterloggingRiskResponse
import json
import numpy as np
import joblib
import pandas as pd
from pathlib import Path
from functools import lru_cache

ML_DIR = Path(__file__).parent.parent / "ML"
ATM_LEAD = 4

@lru_cache(maxsize=1)
def _load_models():
    rf  = joblib.load(ML_DIR / "rf_classifier.joblib")
    xgb = joblib.load(ML_DIR / "xgb_regressor.joblib")
    with open(ML_DIR / "feature_list.json",  "r") as f: features = json.load(f)
    with open(ML_DIR / "label_encoder.json", "r") as f: le_map   = json.load(f)
    return rf, xgb, features, le_map


def engineer_features_single(history_df: pd.DataFrame) -> dict:
    df = history_df.copy()
    
    # 3a — Sort the DataFrame
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    
    # Pre-calculate WFPS if not present (assuming columns names might differ in history)
    if 'wfps_pct' not in df.columns and 'soil_moisture' in df.columns:
        df['wfps_pct'] = (df['soil_moisture'] / 50) * 100
        
    # Standardize column names for engineering - only if they aren't already correct
    rename_map = {
        'air_temp': 'temperature_c',
        'humidity': 'humidity_pct',
        'rain_mm': 'rain_mm'
    }
    # Avoid creating duplicates by only renaming if target doesn't exist
    for old_col, new_col in rename_map.items():
        if old_col in df.columns and new_col not in df.columns:
            df = df.rename(columns={old_col: new_col})
            
    # Deduplicate again just in case
    df = df.loc[:, ~df.columns.duplicated()]

    # 3b — WFPS rolling statistics
    for w in [3, 6, 12, 24, 48]:
        df[f'wfps_mean_{w}h'] = df['wfps_pct'].rolling(window=w, min_periods=1).mean()
        df[f'wfps_std_{w}h'] = df['wfps_pct'].rolling(window=w, min_periods=1).std().fillna(0)
        
    # 3c — WFPS rate of change
    df['wfps_rate_1h'] = df['wfps_pct'].diff(periods=1).fillna(0)
    df['wfps_rate_3h'] = df['wfps_pct'].diff(periods=3).fillna(0)
    df['wfps_rate_6h'] = df['wfps_pct'].diff(periods=6).fillna(0)
    
    # 3d — Atmospheric rolling statistics with forecast lead
    for col in ['humidity_pct', 'temperature_c', 'rain_mm']:
        if col in df.columns:
            for w in [3, 6, 12, 24, 48]:
                df[f'{col}_mean_{w}h'] = df[col].shift(ATM_LEAD).rolling(window=w, min_periods=1).mean()
                
    # 3e — Additional derived columns
    if 'humidity_pct' in df.columns:
        df['humidity_rate_1h'] = df['humidity_pct'].diff(periods=1).fillna(0)
    
    if 'rain_mm' in df.columns:
        df['rain_6h_total'] = df['rain_mm'].rolling(window=6, min_periods=1).sum()
        df['rain_24h_total'] = df['rain_mm'].rolling(window=24, min_periods=1).sum()
        df['rain_48h_forecast'] = df['rain_mm'].shift(ATM_LEAD).rolling(window=48, min_periods=1).sum()
        
    # 3f — Drainage lag column
    above_70 = df['wfps_pct'] > 70
    group_id = (~above_70).cumsum()
    df['drainage_lag_h'] = above_70.groupby(group_id).cumsum().where(above_70, 0).fillna(0)
    
    # 3g — Cyclical time features
    df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24)
    df['doy_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.dayofyear / 365)
    df['doy_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.dayofyear / 365)
    
    # 3h — Return the last row
    return df.iloc[-1].to_dict()


class DashboardService:
    def get_status(self) -> dict:
        current = data_store.get_current_data()

        npk_status = {
            "nitrogen":   "adequate" if current["nitrogen"]   >= 150 else "low",
            "phosphorus": "adequate" if current["phosphorus"] >= 30  else "low",
            "potassium":  "adequate" if current["potassium"]  >= 200 else "low",
        }

        # ── FIXED: correct WFPS formula ──────────────────────────
        # soil_moisture is volumetric water content (0–50 range)
        # WFPS = (VWC / total_porosity) * 100
        # Using total_porosity = 0.5 (50%) as default for loam soil
        wfps = (current["soil_moisture"] / 50) * 100
        waterlogging_risk = "high" if wfps > 85 else "medium" if wfps > 70 else "low"

        return {
            "nitrogen":        current["nitrogen"],
            "phosphorus":      current["phosphorus"],
            "potassium":       current["potassium"],
            "soil_moisture":   current["soil_moisture"],
            "pH":              current["pH"],
            "ec":              current["ec"],
            "soil_temp":       current["soil_temp"],
            "air_temp":        current["air_temp"],
            "humidity":        current["humidity"],
            "npk_status":      npk_status,
            "waterlogging_risk": waterlogging_risk,
            "wfps":            round(wfps, 1),
            "last_updated":    current["timestamp"],
        }

    def get_waterlogging_risk(self) -> dict:
        current = data_store.get_current_data()
        history_df = data_store.get_history_df(hours=72)
        
        print("=== WATERLOGGING DEBUG ===")
        print("history_df rows:", len(history_df))
        print("history_df columns:", list(history_df.columns))
        if len(history_df) > 0:
            print("wfps_pct sample:", history_df["wfps_pct"].tail(3).tolist())
            print("wfps_pct mean:", round(history_df["wfps_pct"].mean(), 2))
            
        current_data = engineer_features_single(history_df)
        
        print("wfps_rate_1h:", current_data.get("wfps_rate_1h", "MISSING"))
        print("wfps_mean_24h:", current_data.get("wfps_mean_24h", "MISSING"))
        print("rain_48h_forecast:", current_data.get("rain_48h_forecast", "MISSING"))
        print("=== END DEBUG ===")

        # ── Real Weather Forecast ────────────────────────────────
        forecast = weather_service.get_weather_forecast()
        rainfall_forecast = round(forecast["rain_next_48h_mm"], 1)
        rain_next_6h = round(forecast["rain_next_6h_mm"], 1)
        rain_next_24h = round(forecast["rain_next_24h_mm"], 1)
        peak_rain_hour = forecast.get("peak_rain_hour", "Unknown")

        # ── FIXED: correct WFPS (porosity 0.5) ───────────────────
        current_wfps = (current["soil_moisture"] / 50) * 100

        peak_wfps_predicted = min(current_wfps + (rainfall_forecast * 1.2), 200)

        rule_risk = (
            "HIGH"   if peak_wfps_predicted > 100
            else "MEDIUM" if peak_wfps_predicted > 85
            else "LOW"
        )

        # ── ML Inference ─────────────────────────────────────────
        rf, xgb, features, le_map = _load_models()

        # Use engineered current_data values where available, else 0.0
        feature_values = [current_data.get(f, 0.0) for f in features]
        feature_vector = np.array(feature_values, dtype=np.float32).reshape(1, -1)

        ml_risk_class  = rf.predict(feature_vector)[0]
        ml_risk_proba  = rf.predict_proba(feature_vector)[0]
        ml_hours_until = float(np.clip(xgb.predict(feature_vector)[0], 0, 72))
        ml_confidence  = float(ml_risk_proba.max())

        class_names   = list(rf.classes_)
        ml_proba_dict = {
            name: round(float(prob), 4)
            for name, prob in zip(class_names, ml_risk_proba)
        }

        final_risk = ml_risk_class if ml_confidence >= 0.55 else rule_risk

        # ── FIXED: case-insensitive action trigger ────────────────
        HIGH_RISK_CLASSES = {"high", "critical", "medium"}
        actions = (
            [
                "Cancel irrigation scheduled for tomorrow",
                "Prepare drainage channels",
                "Delay fertilization until soil drains",
                "Monitor field conditions closely",
            ]
            if final_risk.lower() in HIGH_RISK_CLASSES
            else []
        )

        # ── FIXED: case-insensitive potential_loss check ─────────
        potential_loss = (
            20000 if final_risk.lower() in {"high", "critical"}
            else 10000 if final_risk.lower() == "medium"
            else 0
        )

        return {
            "current_wfps"              : round(current_wfps, 1),
            "current_moisture": current["soil_moisture"],
            "risk_level":      final_risk.upper(),
            "time_to_event_hours": int(ml_hours_until),
            "peak_wfps_predicted": round(peak_wfps_predicted, 1),
            "duration_hours"            : 12,
            "rainfall_forecast_mm"      : rainfall_forecast,
            "rain_next_6h_mm"           : rain_next_6h,
            "rain_next_24h_mm"          : rain_next_24h,
            "peak_rain_hour"            : peak_rain_hour,
            "cause"                     : f"Real forecast: {rainfall_forecast}mm rain expected in 48h (peak: {peak_rain_hour})",
            "actions"                   : actions,
            "potential_loss"            : potential_loss,
            "ml_risk_class"             : ml_risk_class,
            "ml_confidence"             : round(ml_confidence, 4),
            "ml_risk_probabilities"     : ml_proba_dict,
            "ml_hours_until_waterlogging": round(ml_hours_until, 1),
            "ml_alert_active"           : ml_hours_until <= 24 and final_risk.lower() != "safe",
            "ml_source"                 : "rf_classifier + xgb_regressor",
            "hourly_forecast"           : [
                {"time": t, "rain": r} 
                for t, r in zip(forecast["hourly_time"][:24], forecast["hourly_rain_mm"][:24])
            ]
        }


dashboard_service = DashboardService()