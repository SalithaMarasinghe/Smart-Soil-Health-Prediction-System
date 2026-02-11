import requests
import sys
from datetime import datetime
import json

class SmartSoilAPITester:
    def __init__(self, base_url="https://farmsoiltech.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, params=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse JSON response
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    
                    self.test_results.append({
                        "test": name,
                        "status": "PASS",
                        "response_keys": list(response_data.keys()) if isinstance(response_data, dict) else [],
                        "data_sample": str(response_data)[:200] + "..." if len(str(response_data)) > 200 else str(response_data)
                    })
                    
                    return True, response_data
                except json.JSONDecodeError:
                    print(f"   Warning: Response is not valid JSON")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
                self.test_results.append({
                    "test": name,
                    "status": "FAIL",
                    "expected_status": expected_status,
                    "actual_status": response.status_code,
                    "error": response.text[:200]
                })
                
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.test_results.append({
                "test": name,
                "status": "ERROR",
                "error": str(e)
            })
            return False, {}

    def test_status_endpoint(self):
        """Test /api/status endpoint"""
        success, response = self.run_test(
            "System Status",
            "GET",
            "status",
            200
        )
        
        if success and isinstance(response, dict):
            # Validate required fields
            required_fields = ['nitrogen', 'phosphorus', 'potassium', 'soil_moisture', 'pH', 'npk_status', 'waterlogging_risk']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
                return False
            else:
                print(f"   ✅ All required fields present")
                print(f"   📊 NPK Status: N={response.get('nitrogen')}, P={response.get('phosphorus')}, K={response.get('potassium')}")
                print(f"   💧 Waterlogging Risk: {response.get('waterlogging_risk')}")
                return True
        
        return success

    def test_npk_predictions_endpoint(self):
        """Test /api/npk-predictions endpoint"""
        success, response = self.run_test(
            "NPK Predictions",
            "GET",
            "npk-predictions",
            200
        )
        
        if success and isinstance(response, dict):
            # Validate prediction structure
            required_sections = ['current', '7_days', '14_days', 'recommendation']
            missing_sections = [section for section in required_sections if section not in response]
            
            if missing_sections:
                print(f"   ⚠️  Missing sections: {missing_sections}")
                return False
            else:
                print(f"   ✅ All prediction sections present")
                print(f"   📈 Current NPK: N={response['current'].get('N')}, P={response['current'].get('P')}, K={response['current'].get('K')}")
                print(f"   🎯 Recommendation: {response['recommendation'].get('action')}")
                return True
        
        return success

    def test_waterlogging_risk_endpoint(self):
        """Test /api/waterlogging-risk endpoint"""
        success, response = self.run_test(
            "Waterlogging Risk",
            "GET",
            "waterlogging-risk",
            200
        )
        
        if success and isinstance(response, dict):
            # Validate risk assessment structure
            required_fields = ['current_wfps', 'risk_level', 'time_to_event_hours', 'actions']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
                return False
            else:
                print(f"   ✅ All risk assessment fields present")
                print(f"   🌧️  Risk Level: {response.get('risk_level')}")
                print(f"   ⏰ Time to Event: {response.get('time_to_event_hours')}h")
                print(f"   📋 Actions Count: {len(response.get('actions', []))}")
                return True
        
        return success

    def test_history_endpoint(self):
        """Test /api/history endpoint with different parameters"""
        parameters = ['nitrogen', 'phosphorus', 'potassium', 'soil_moisture', 'pH']
        all_passed = True
        
        for param in parameters:
            success, response = self.run_test(
                f"History - {param}",
                "GET",
                "history",
                200,
                params={'parameter': param, 'days': 7}
            )
            
            if success and isinstance(response, dict):
                if 'data' in response and isinstance(response['data'], list):
                    data_count = len(response['data'])
                    print(f"   📊 Data points: {data_count}")
                    
                    if data_count > 0:
                        sample_point = response['data'][0]
                        if 'timestamp' in sample_point and 'value' in sample_point:
                            print(f"   ✅ Valid data structure")
                        else:
                            print(f"   ⚠️  Invalid data point structure")
                            all_passed = False
                    else:
                        print(f"   ⚠️  No data points returned")
                        all_passed = False
                else:
                    print(f"   ⚠️  Invalid response structure")
                    all_passed = False
            else:
                all_passed = False
        
        return all_passed

    def test_alerts_endpoint(self):
        """Test /api/alerts endpoint"""
        success, response = self.run_test(
            "Active Alerts",
            "GET",
            "alerts",
            200
        )
        
        if success and isinstance(response, dict):
            if 'alerts' in response and isinstance(response['alerts'], list):
                alerts_count = len(response['alerts'])
                print(f"   🚨 Active alerts: {alerts_count}")
                
                if alerts_count > 0:
                    sample_alert = response['alerts'][0]
                    required_alert_fields = ['id', 'type', 'severity', 'message']
                    missing_alert_fields = [field for field in required_alert_fields if field not in sample_alert]
                    
                    if missing_alert_fields:
                        print(f"   ⚠️  Missing alert fields: {missing_alert_fields}")
                        return False
                    else:
                        print(f"   ✅ Valid alert structure")
                        return True
                else:
                    print(f"   ℹ️  No active alerts (this is okay)")
                    return True
            else:
                print(f"   ⚠️  Invalid alerts response structure")
                return False
        
        return success

    def test_fertilization_history_endpoint(self):
        """Test /api/fertilization-history endpoint"""
        success, response = self.run_test(
            "Fertilization History",
            "GET",
            "fertilization-history",
            200
        )
        
        if success and isinstance(response, dict):
            if 'events' in response and isinstance(response['events'], list):
                events_count = len(response['events'])
                print(f"   🌱 Fertilization events: {events_count}")
                
                if events_count > 0:
                    sample_event = response['events'][0]
                    required_event_fields = ['id', 'date', 'type', 'amount_kg', 'cost']
                    missing_event_fields = [field for field in required_event_fields if field not in sample_event]
                    
                    if missing_event_fields:
                        print(f"   ⚠️  Missing event fields: {missing_event_fields}")
                        return False
                    else:
                        print(f"   ✅ Valid fertilization event structure")
                        return True
                else:
                    print(f"   ⚠️  No fertilization events found")
                    return False
            else:
                print(f"   ⚠️  Invalid fertilization history response structure")
                return False
        
        return success

def main():
    print("🌱 Smart Soil Health Monitoring System - API Testing")
    print("=" * 60)
    
    tester = SmartSoilAPITester()
    
    # Run all API tests
    test_methods = [
        tester.test_status_endpoint,
        tester.test_npk_predictions_endpoint,
        tester.test_waterlogging_risk_endpoint,
        tester.test_history_endpoint,
        tester.test_alerts_endpoint,
        tester.test_fertilization_history_endpoint
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.test_results.append({
                "test": test_method.__name__,
                "status": "ERROR",
                "error": str(e)
            })

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed successfully!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        
        # Print failed tests summary
        failed_tests = [result for result in tester.test_results if result['status'] != 'PASS']
        if failed_tests:
            print("\n❌ Failed Tests Summary:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['status']}")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())