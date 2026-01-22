import pandas as pd
import pg8000
from dotenv import load_dotenv
import os
import re

load_dotenv()

conn = pg8000.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
cursor = conn.cursor()

# Get admin user ID
cursor.execute("SELECT id FROM users WHERE email = 'admin@institute.com'")
admin_id = cursor.fetchone()[0]

# Clear staff
cursor.execute("DELETE FROM staff")
conn.commit()

df_staff = pd.read_excel('stafflist.xls', skiprows=5)
print(f"Importing {len(df_staff)} staff members...")

staff_count = 0

for idx, row in df_staff.iterrows():
    try:
        name = str(row.get('Name', '')).strip()
        if not name or name == 'nan':
            continue
            
        # Split name
        name_parts = name.split()
        first_name = name_parts[0] if len(name_parts) > 0 else 'Staff'
        last_name = name_parts[-1] if len(name_parts) > 1 else 'Member'
        middle_name = ' '.join(name_parts[1:-1]) if len(name_parts) > 2 else None
        
        employee_id = str(row.get('Staff Code', f'EMP{str(idx+1).zfill(4)}')).strip()
        
        dob_str = row.get('Date of Birth')
        dob = '1990-01-01'
        if pd.notna(dob_str):
            try:
                if isinstance(dob_str, pd.Timestamp):
                    dob = dob_str.strftime('%Y-%m-%d')
            except:
                pass
                
        joining_date_str = row.get('Joining Date')
        joining_date = '2020-04-01'
        if pd.notna(joining_date_str):
            try:
                if isinstance(joining_date_str, pd.Timestamp):
                    joining_date = joining_date_str.strftime('%Y-%m-%d')
            except:
                pass
        
        gender = str(row.get('Gender', 'male')).strip().lower()
        if gender not in ['male', 'female', 'other']:
            gender = 'male'
            
        email = str(row.get('Personal Email Id', f'{first_name.lower()}.{last_name.lower()}@institute.com')).strip()
        phone = str(row.get('Mobile No.', '')).strip() if pd.notna(row.get('Mobile No.')) else None
        if phone:
            phone = re.sub(r'[^\d]', '', phone)[:10]
            
        designation = str(row.get('Designation', 'Teacher')).strip() if pd.notna(row.get('Designation')) else 'Teacher'
        department = str(row.get('Department', 'General')).strip() if pd.notna(row.get('Department')) else None
        
        # Determine staff type
        staff_type = 'teaching'
        if pd.notna(row.get('Staff Type')):
            st = str(row.get('Staff Type')).strip().lower()
            if 'non-teaching' in st or 'non teaching' in st:
                staff_type = 'non-teaching'
            elif 'admin' in st:
                staff_type = 'administrative'
            elif 'support' in st:
                staff_type = 'support'
                
        city = str(row.get('City', 'Chirawa')).strip() if pd.notna(row.get('City')) else 'Chirawa'
        state = str(row.get('State', 'Rajasthan')).strip() if pd.notna(row.get('State')) else 'Rajasthan'
        
        cursor.execute("""
            INSERT INTO staff (
                employee_id, first_name, middle_name, last_name, date_of_birth, gender,
                email, phone, city, state,
                staff_type, designation, department, date_of_joining, employment_type, status,
                nationality, created_by
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            employee_id, first_name, middle_name, last_name, dob, gender,
            email, phone, city, state,
            staff_type, designation, department, joining_date, 'permanent', 'active',
            'Indian', admin_id
        ))
        
        staff_count += 1
            
    except Exception as e:
        print(f"  Error at row {idx}: {str(e)[:200]}")
        continue

conn.commit()
print(f"Imported {staff_count} staff members")

cursor.close()
conn.close()
