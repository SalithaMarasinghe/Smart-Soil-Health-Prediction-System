import httpx
import json
from datetime import datetime
from functools import lru_cache

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
LAT = 7.4333
LON = 80.5667

class WeatherService:
    @lru_cache(maxsize=1)
    def _get_cached_forecast(self, timestamp_hour):
        """Cache results for the current hour to avoid redundant API calls."""
        try:
            params = {
                "latitude": LAT,
                "longitude": LON,
                "hourly": "precipitation,temperature_2m,relativehumidity_2m",
                "forecast_days": 3,
                "timezone": "Asia/Colombo"
            }
            response = httpx.get(OPEN_METEO_URL, params=params, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"WARNING: Weather API fetch failed: {e}")
            return None

    def get_weather_forecast(self):
        # Use current hour as cache key
        current_hour = datetime.now().strftime("%Y-%m-%d-%H")
        data = self._get_cached_forecast(current_hour)

        if not data or "hourly" not in data:
            return {
                "hourly_time": [],
                "hourly_rain_mm": [0.0] * 72,
                "hourly_temp_c": [],
                "hourly_humidity_pct": [],
                "rain_next_6h_mm": 0.0,
                "rain_next_24h_mm": 0.0,
                "rain_next_48h_mm": 0.0,
                "peak_rain_hour": "Unknown"
            }

        hourly = data["hourly"]
        times = hourly.get("time", [])
        precip = hourly.get("precipitation", [])
        temps = hourly.get("temperature_2m", [])
        humids = hourly.get("relativehumidity_2m", [])

        # Calculate summaries
        rain_6h = sum(precip[:6]) if len(precip) >= 6 else sum(precip)
        rain_24h = sum(precip[:24]) if len(precip) >= 24 else sum(precip)
        rain_48h = sum(precip[:48]) if len(precip) >= 48 else sum(precip)

        # Find peak rain hour in next 48h
        peak_val = 0.0
        peak_hour = "Unknown"
        for i in range(min(48, len(precip))):
            if precip[i] > peak_val:
                peak_val = precip[i]
                peak_hour = times[i]

        return {
            "hourly_time": times,
            "hourly_rain_mm": precip,
            "hourly_temp_c": temps,
            "hourly_humidity_pct": humids,
            "rain_next_6h_mm": rain_6h,
            "rain_next_24h_mm": rain_24h,
            "rain_next_48h_mm": rain_48h,
            "peak_rain_hour": peak_hour
        }

weather_service = WeatherService()
