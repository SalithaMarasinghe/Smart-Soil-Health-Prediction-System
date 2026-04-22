import sys
sys.path.insert(0, 'd:\\PEnDrive Data\\IOT Project\\backend')

from services.dashboard_service import dashboard_service

data = dashboard_service.get_waterlogging_risk()
print("Waterlogging Risk Data from dashboard_service:")
print(f"  current_moisture: {data.get('current_moisture')}")
print(f"  current_wfps: {data.get('current_wfps')}")
print(f"  rainfall_forecast_mm: {data.get('rainfall_forecast_mm')}")
print(f"  rain_next_6h_mm: {data.get('rain_next_6h_mm')}")
print(f"  rain_next_24h_mm: {data.get('rain_next_24h_mm')}")
print(f"  risk_level: {data.get('risk_level')}")
print(f"  ml_risk_class: {data.get('ml_risk_class')}")
print(f"  time_to_event_hours: {data.get('time_to_event_hours')}")
