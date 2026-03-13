from datetime import datetime, timedelta, timezone
import random
from typing import List, Dict, Any

class DataStore:
    def __init__(self):
        self.historical_data = self._generate_historical_data()
        self.alerts = self._generate_alerts()
        self.irrigation_history = self._generate_irrigation_history()
        self.ph_history = self._generate_ph_history()

    def _generate_historical_data(self):
        """Generate 30 days of historical sensor data"""
        data = []
        base_time = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Baseline values
        n_base = 210
        p_base = 52
        k_base = 360
        moisture_base = 40
        
        for i in range(720):  # 30 days * 24 hours
            timestamp = base_time + timedelta(hours=i)
            
            # Simulate fertilization event 12 days ago (288 hours ago)
            if i == 432:
                n_base += 80
                p_base += 25
                k_base += 60
            
            # NPK depletion rates per hour
            n_depletion = 0.167  # ~4 mg/kg per day
            p_depletion = 0.075  # ~1.8 mg/kg per day
            k_depletion = 0.133  # ~3.2 mg/kg per day
            
            nitrogen = max(n_base - (n_depletion * (i if i < 432 else i - 432)), 120)
            phosphorus = max(p_base - (p_depletion * (i if i < 432 else i - 432)), 30)
            potassium = max(k_base - (k_depletion * (i if i < 432 else i - 432)), 200)
            
            # Moisture varies with some randomness
            moisture = moisture_base + random.uniform(-10, 15)
            
            data.append({
                "timestamp": timestamp.isoformat(),
                "nitrogen": round(nitrogen, 1),
                "phosphorus": round(phosphorus, 1),
                "potassium": round(potassium, 1),
                "soil_moisture": round(moisture, 1),
                "pH": round(6.5 + random.uniform(-0.3, 0.3), 1),
                "ec": round(1.2 + random.uniform(-0.2, 0.2), 2),
                "soil_temp": round(26 + random.uniform(-2, 2), 1),
                "air_temp": round(28 + random.uniform(-3, 3), 1),
                "humidity": round(75 + random.uniform(-10, 10), 1),
                "light_intensity": random.randint(3000, 8000) if 6 <= timestamp.hour <= 18 else random.randint(0, 100)
            })
        
        return data
    
    def _generate_alerts(self):
        """Generate active alerts"""
        return [
            {
                "id": "alert_001",
                "type": "waterlogging_risk",
                "severity": "high",
                "message": "Heavy rain in 48h - waterlogging likely",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "alert_002",
                "type": "npk_level",
                "severity": "medium",
                "message": "Nitrogen will drop below threshold in 5-7 days",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        
    def _generate_irrigation_history(self):
        """Generate mock irrigation history"""
        history = []
        base_time = datetime.now(timezone.utc)
        
        # Generate 5 events over the last 30 days
        for i in range(5):
            days_ago = (i * 6) + 2
            event_time = base_time - timedelta(days=days_ago)
            volume = random.randint(30000, 50000) # liters per hectare
            
            history.append({
                "id": f"irr_{i}",
                "date": event_time.isoformat(),
                "volume_liters": volume,
                "moisture_before": round(random.uniform(25, 30), 1),
                "moisture_after": round(random.uniform(55, 65), 1),
                "cost": round(volume * 0.035, 2) # approx cost calculation
            })
            
        return sorted(history, key=lambda x: x['date'], reverse=True)

    def _generate_ph_history(self):
        """Generate 90 days of pH history showing gradual acidification"""
        history = []
        base_time = datetime.now(timezone.utc)
        
        current_ph = 6.8
        
        for i in range(90):
            days_ago = i
            timestamp = base_time - timedelta(days=days_ago)
            
            if days_ago <= 12:
                ph_val = 6.8 + (days_ago * 0.0035) 
            else:
                ph_val = 6.84 + ((days_ago - 12) * 0.002)
                
            ph_val += random.uniform(-0.02, 0.02)
            
            event_type = None
            if days_ago == 12:
                event_type = "fertilization"
            elif days_ago == 60:
                event_type = "lime_application" 
            
            history.append({
                "timestamp": timestamp.isoformat(),
                "pH": round(ph_val, 2),
                "event_type": event_type
            })
            
        return sorted(history, key=lambda x: x['timestamp'])

    def log_irrigation(self, data: dict):
        """Log a new irrigation event"""
        new_event = {
            "id": f"irr_{len(self.irrigation_history) + 1}",
            "date": datetime.now(timezone.utc).isoformat(),
            **data
        }
        if "cost" not in new_event:
            new_event["cost"] = round(new_event.get("volume_liters", 0) * 0.035, 2)
            
        if "moisture_before" not in new_event:
             current = self.get_current_data()
             new_event["moisture_before"] = current["soil_moisture"]
        if "moisture_after" not in new_event:
             new_event["moisture_after"] = min(new_event["moisture_before"] + 20, 85.0)

        self.irrigation_history.insert(0, new_event)
        return new_event
    
    def get_current_data(self):
        """Get the most recent sensor reading"""
        return self.historical_data[-1]
    
    def get_history(self, parameter: str, days: int):
        """Get historical data for a specific parameter"""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        filtered = [d for d in self.historical_data if datetime.fromisoformat(d["timestamp"]) >= cutoff]
        
        return [{"timestamp": d["timestamp"], "value": d.get(parameter, 0)} for d in filtered]

# Singleton instance
data_store = DataStore()
