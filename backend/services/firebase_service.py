import os
import json
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
from models.analytics import SoilSensorData, AirData, AirQualityData, RealTimeAnalytics

from pathlib import Path

# Load environment variables from the backend directory
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")

class FirebaseService:
    def __init__(self):
        env_path = ROOT_DIR / ".env"
        print(f"Loading .env from: {env_path}")
        print(f"File exists: {env_path.exists()}")
        
        self.db_url = os.getenv("FIREBASE_URL")
        self.service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebaseServiceAccount.json")
        self.service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        
        print(f"FIREBASE_URL from env: {self.db_url}")
        
        if not self.db_url:
            print("ERROR: FIREBASE_URL not found in environment variables.")
            return

        try:
            if not firebase_admin._apps:
                if self.service_account_json:
                    print("Initializing Firebase using JSON from environment variable...")
                    service_account_info = json.loads(self.service_account_json)
                    cred = credentials.Certificate(service_account_info)
                elif os.path.exists(self.service_account_path):
                    print(f"Initializing Firebase using file: {self.service_account_path}")
                    cred = credentials.Certificate(self.service_account_path)
                else:
                    print(f"ERROR: No Firebase credentials found (checked ENV and {self.service_account_path})")
                    return

                firebase_admin.initialize_app(cred, {
                    'databaseURL': self.db_url
                })
                print("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            print(f"CRITICAL: Failed to initialize Firebase Admin SDK: {e}")

    def get_realtime_analytics(self) -> RealTimeAnalytics:
        if not firebase_admin._apps:
            if not self.db_url:
                raise Exception("FIREBASE_URL is missing in .env file. Please add it and restart the backend.")
            raise Exception("Firebase Admin SDK failed to initialize. Check your service account file.")

        try:
            print("Fetching real-time data from Firebase...")
            soil_ref = db.reference('soil_data/latest')
            air_ref = db.reference('air_data/latest')
            aq_ref = db.reference('air_quality/latest')

            soil_data = soil_ref.get()
            air_data = air_ref.get()
            aq_data = aq_ref.get()

            print(f"DEBUG: Raw Soil Data: {soil_data}")
            print(f"DEBUG: Raw Air Data: {air_data}")
            print(f"DEBUG: Raw AQ Data: {aq_data}")

            if not all([soil_data, air_data, aq_data]):
                missing = [k for k, v in {"soil": soil_data, "air": air_data, "aq": aq_data}.items() if not v]
                raise Exception(f"Missing data in Firebase nodes: {', '.join(missing)}")

            # Map to models with flexible key matching
            def flexible_map(data, model_class, mapping=None):
                if not data: return model_class()
                
                # Standardize keys based on common variations
                standardized = {}
                
                # Copy everything first (permissive model will handle extra fields)
                for k, v in data.items():
                    standardized[k.lower()] = v
                
                # Apply specific mappings if provided
                if mapping:
                    for target, alternatives in mapping.items():
                        for alt in alternatives:
                            if alt in standardized and standardized[alt] is not None:
                                standardized[target] = standardized[alt]
                                break
                
                # Special handle for timestamp
                ts = data.get('timestamp') or data.get('entry_time') or data.get('date') or data.get('last_updated') or "N/A"
                if 'timestamp' not in standardized: standardized['timestamp'] = str(ts)
                
                return model_class(**standardized)

            # Define EXACT mappings based on discovered keys
            soil_mapping = {
                "nitrogen": ["nitrogen_mgkg", "n"],
                "phosphorus": ["phosphorus_mgkg", "p"],
                "potassium": ["potassium_mgkg", "k"],
                "ec": ["ec_mscm", "ec"],
                "moisture": ["moisture_pct", "moisture"],
                "temperature": ["temperature_c", "temperature"],
                "ph": ["ph", "soil_ph"]
            }

            air_mapping = {
                "humidity": ["humidity_pct", "humidity"],
                "temperature": ["temperature_c", "temperature"]
            }

            soil = flexible_map(soil_data, SoilSensorData, soil_mapping)
            air = flexible_map(air_data, AirData, air_mapping)
            aq = flexible_map(aq_data, AirQualityData)

            return RealTimeAnalytics(
                soil=soil,
                air=air,
                air_quality=aq
            )
        except Exception as e:
            print(f"Error fetching Firebase data: {e}")
            raise e

# Global instance
firebase_service = FirebaseService()
