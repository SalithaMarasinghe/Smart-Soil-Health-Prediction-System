from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any

class SoilSensorData(BaseModel):
    model_config = ConfigDict(extra='allow')
    timestamp: Optional[str] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ec: Optional[float] = None
    moisture: Optional[float] = None
    temperature: Optional[float] = None
    ph: Optional[float] = None

class AirData(BaseModel):
    model_config = ConfigDict(extra='allow')
    timestamp: Optional[str] = None
    humidity: Optional[float] = None
    temperature: Optional[float] = None

class AirQualityData(BaseModel):
    model_config = ConfigDict(extra='allow')
    timestamp: Optional[str] = None
    aqi_status: Optional[str] = None
    aqi_value: Optional[int] = None
    ppm: Optional[float] = None
    raw_value: Optional[int] = None

class RealTimeAnalytics(BaseModel):
    model_config = ConfigDict(extra='allow')
    soil: SoilSensorData
    air: AirData
    air_quality: AirQualityData
    raw_debug: Optional[Dict[str, Any]] = None
