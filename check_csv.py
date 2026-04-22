import pandas as pd

# Load the soil data
df = pd.read_csv('backend/data/soil_node1_full-1-2.csv')

print("Columns:", df.columns.tolist())
print("\n=== Last 20 rows ===")
print(df.tail(20))

print("\n=== Last valid (non-NaN) row ===")
for idx in range(len(df)-1, -1, -1):
    row = df.iloc[idx]
    if row.notna().any() and pd.notna(row.get('moisture_pct')):
        print(f"Index {idx} - {row['hour']}")
        print(row)
        break

# Also check the soil moisture and wfps_pct specifically
print("\n=== WFPS % values (last 20) ===")
print(df[['hour', 'moisture_pct', 'wfps_pct']].tail(20))
