import pandas as pd

print("=" * 80)
print("STUDENT DATA ANALYSIS")
print("=" * 80)

df = pd.read_excel('studentlist.xls')
print(f"\nTotal Students: {len(df)}")
print(f"\nColumns ({len(df.columns)}):")
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. {col}")

print(f"\n\nFirst 5 rows preview:")
print(df.head(5).to_string())

print("\n\n" + "=" * 80)
print("STAFF DATA ANALYSIS")
print("=" * 80)

df2 = pd.read_excel('stafflist.xls')
print(f"\nTotal Staff: {len(df2)}")
print(f"\nColumns ({len(df2.columns)}):")
for i, col in enumerate(df2.columns, 1):
    print(f"  {i}. {col}")

print(f"\n\nFirst 5 rows preview:")
print(df2.head(5).to_string())

print("\n\n" + "=" * 80)
print("DATA SUMMARY")
print("=" * 80)
print(f"Students: {len(df)} records")
print(f"Staff: {len(df2)} records")
