import pandas as pd

df = pd.read_excel('studentlist.xls', skiprows=4)
print(f'Total rows in Excel: {len(df)}')

# Check rows 825-836
print('\nChecking problematic rows:')
for idx in range(825, 836):
    if idx < len(df):
        row = df.iloc[idx]
        fname = row.get('Student First Name', 'N/A')
        lname = row.get('Student Last Name', 'N/A')
        class_name = row.get('Class Name', 'N/A')
        
        # Check for long values
        long_fields = []
        for col in df.columns:
            val = str(row[col])
            if len(val) > 100 and val != 'nan':
                long_fields.append(f"{col}={len(val)}chars")
        
        print(f"Row {idx}: {fname} {lname} - {class_name}")
        if long_fields:
            print(f"  Long fields: {', '.join(long_fields[:3])}")
