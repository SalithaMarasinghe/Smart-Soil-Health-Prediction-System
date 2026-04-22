import sys
sys.path.insert(0, 'd:\\PEnDrive Data\\IOT Project\\backend')

from services.data_store import data_store

current = data_store.get_current_data()
print("Current data loaded by data_store:")
for key, value in sorted(current.items()):
    print(f"  {key}: {value}")

print(f"\nTotal historical records: {len(data_store.historical_data)}")
print("\nLast 5 records:")
for record in data_store.historical_data[-5:]:
    print(f"  {record.get('timestamp')}: moisture={record.get('soil_moisture')}, wfps={record.get('wfps')}")
