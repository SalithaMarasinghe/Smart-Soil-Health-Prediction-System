from datetime import datetime, timedelta, timezone
import random
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any

SOIL_CSV = Path(__file__).parent.parent / "data" / "soil_node1_full-1-2.csv"
AIR_CSV  = Path(__file__).parent.parent / "data" / "air_node2_full-1.csv"

class DataStore:
    def __init__(self):
        try:
            self.historical_data = self._load_real_data()
            print(f"Loaded {len(self.historical_data)} real sensor records")
        except Exception as e:
            print(f"WARNING: Could not load real data ({e}), falling back to mock data")
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

    def _load_real_data(self):
        """Load real sensor data from CSV files"""
        # 1. Read SOIL_CSV
        soil_df = pd.read_csv(SOIL_CSV)
        soil_df = soil_df.rename(columns={'hour': 'timestamp'})
        soil_df['timestamp'] = pd.to_datetime(soil_df['timestamp'])
        
        # 2. Read AIR_CSV
        air_df = pd.read_csv(AIR_CSV)
        air_df = air_df.rename(columns={'hour': 'timestamp'})
        air_df['timestamp'] = pd.to_datetime(air_df['timestamp'])
        
        # 3. Rename air temperature column
        # Possible names: air_temp_c, temperature, temp, air_temperature
        air_rename_map = {}
        for col in ['air_temp_c', 'temperature', 'temp', 'air_temperature']:
            if col in air_df.columns:
                air_rename_map[col] = 'air_temp'
                break
        
        # Rename humidity if needed (using 'humidity' as target for internal dict)
        if 'humidity_pct' in air_df.columns:
            air_rename_map['humidity_pct'] = 'humidity'
            
        air_df = air_df.rename(columns=air_rename_map)
        
        # 4. Merge DataFrames on timestamp
        # Drop overlapping columns from air_df except timestamp to avoid _x/_y suffixes
        cols_to_drop = [c for c in air_df.columns if c in soil_df.columns and c != 'timestamp']
        air_df_clean = air_df.drop(columns=cols_to_drop)
        
        merged = pd.merge(soil_df, air_df_clean, on='timestamp', how='inner')
        
        # 5. Sort and reset index
        merged = merged.sort_values('timestamp').reset_index(drop=True)
        
        # 6. Ensure required columns exist
        col_map = {
            'moisture_pct': 'soil_moisture',
            'soil_temp_c': 'soil_temp',
            'ec_mscm': 'ec',
            'nitrogen_mgkg': 'nitrogen',
            'phosphorus_mgkg': 'phosphorus',
            'potassium_mgkg': 'potassium'
        }
        merged = merged.rename(columns={k: v for k, v in col_map.items() if k in merged.columns})
        
        # Add missing columns or fill NaNs with defaults
        defaults = {
            'nitrogen': 180,
            'phosphorus': 35,
            'potassium': 220,
            'ec': 1.2,
            'pH': 6.5,
            'soil_moisture': 35.0,
            'soil_temp': 26.0,
            'air_temp': 28.0,
            'humidity': 75.0
        }
        
        for col, val in defaults.items():
            if col not in merged.columns:
                merged[col] = val
            else:
                merged[col] = merged[col].fillna(val)
                
        # 7. Convert timestamp to ISO format strings
        merged['timestamp'] = merged['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')
        
        # 8. Convert to records
        return merged.to_dict(orient='records')
    
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
        """Get historical data for a specific parameter (Used by Charting)"""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        filtered = [d for d in self.historical_data if datetime.fromisoformat(d["timestamp"]) >= cutoff]
        
        return [{"timestamp": d["timestamp"], "value": d.get(parameter, 0)} for d in filtered]

    def get_history_df(self, hours: int = 72):
        """Get historical sensor data as a formatted DataFrame for ML"""
        # Slice last N hours by position to avoid timestamp filtering issues
        raw = self.historical_data[-hours:]
        
        # Step 3 — Add a row count safety check
        if not raw:
            return pd.DataFrame(columns=['timestamp', 'wfps_pct', 'temperature_c', 'humidity_pct', 'rain_mm'])
            
        df = pd.DataFrame(raw)
        
        # Convert timestamp to datetime objects
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Compute wfps_pct: (soil_moisture / 50) * 100
        df['wfps_pct'] = (df['soil_moisture'] / 50) * 100
        
        # required: timestamp, wfps_pct, temperature_c, humidity_pct, rain_mm
        df = df.rename(columns={
            'air_temp': 'temperature_c',
            'humidity': 'humidity_pct'
        })
        
        # Deduplicate columns if any (e.g. if humidity_pct existed in both)
        df = df.loc[:, ~df.columns.duplicated()]
        
        # Handle rain_mm (add zeros if missing)
        if 'rain_mm' not in df.columns:
            df['rain_mm'] = 0.0
            
        # Return only the required 5 columns
        required_cols = ['timestamp', 'wfps_pct', 'temperature_c', 'humidity_pct', 'rain_mm']
        return df[required_cols]

    def get_all_history(self, hours: int):
        """Get all historical sensor data for the last X hours (Deprecated - use get_history_df)"""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        filtered = [d for d in self.historical_data if datetime.fromisoformat(d["timestamp"]) >= cutoff]
        return filtered

# Singleton instance
data_store = DataStore()
