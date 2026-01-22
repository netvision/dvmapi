import pandas as pd
import pg8000
from dotenv import load_dotenv
import os
from datetime import datetime
import re

load_dotenv()

# Database connection
conn = pg8000.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
cursor = conn.cursor()

print("=" * 80)
print("IMPORTING REAL STUDENT & STAFF DATA")
print("=" * 80)

# Get admin user ID
cursor.execute("SELECT id FROM users WHERE email = 'admin@institute.com'")
admin_id = cursor.fetchone()[0]

# Clear existing dummy data
print("\n🗑️  Clearing dummy data...")
cursor.execute("DELETE FROM staff")
cursor.execute("DELETE FROM students")
conn.commit()
print("✅ Dummy data cleared")

# Import Students
print("\n📚 Importing students from studentlist.xls...")
df_students = pd.read_excel('studentlist.xls', skiprows=4)  # Skip header rows

# Check the actual column names
print(f"\nFound {len(df_students)} student records")
print("Column mapping:")

# Map Excel columns to database columns (adjust based on actual data)
student_count = 0
errors = []

for idx, row in df_students.iterrows():
    try:
        # Extract data with fallbacks
        sr_no = row.get('Sr No.', idx + 1)
        admission_no = str(row.get('Admission No.', f'2025{str(sr_no).zfill(4)}')).strip()
        first_name = str(row.get('Student First Name', '')).strip()
        middle_name = str(row.get('Student Middle Name', '')).strip() if pd.notna(row.get('Student Middle Name')) else None
        last_name = str(row.get('Student Last Name', '')).strip()
        
        # Skip if name is empty
        if not first_name or first_name == 'nan':
            continue
            
        # Date fields
        dob_str = row.get('Date Of Birth')
        dob = None
        if pd.notna(dob_str):
            try:
                if isinstance(dob_str, pd.Timestamp):
                    dob = dob_str.strftime('%Y-%m-%d')
                else:
                    dob = pd.to_datetime(str(dob_str), format='%d-%m-%Y', errors='coerce')
                    if pd.notna(dob):
                        dob = dob.strftime('%Y-%m-%d')
            except:
                dob = '2015-01-01'  # Default if parsing fails
        else:
            dob = '2015-01-01'
            
        admission_date_str = row.get('Date of Admission')
        admission_date = '2025-04-01'
        if pd.notna(admission_date_str):
            try:
                if isinstance(admission_date_str, pd.Timestamp):
                    admission_date = admission_date_str.strftime('%Y-%m-%d')
                else:
                    adm = pd.to_datetime(str(admission_date_str), format='%d-%m-%Y', errors='coerce')
                    if pd.notna(adm):
                        admission_date = adm.strftime('%Y-%m-%d')
            except:
                pass
        
        # Other fields
        gender = str(row.get('Gender', 'male')).strip().lower()
        if gender == 'boy':
            gender = 'male'
        elif gender == 'girl':
            gender = 'female'
            
        email = str(row.get('Primary Email ID', '')).strip() if pd.notna(row.get('Primary Email ID')) else None
        phone = str(row.get('Primary Mobile No.', '')).strip() if pd.notna(row.get('Primary Mobile No.')) else None
        
        # Clean phone number
        if phone:
            phone = re.sub(r'[^\d]', '', phone)[:10]
            if len(phone) < 10:
                phone = None
                
        address = str(row.get('Address', '')).strip() if pd.notna(row.get('Address')) else None
        city = str(row.get('City', 'Chirawa')).strip() if pd.notna(row.get('City')) else 'Chirawa'
        state = str(row.get('State', 'Rajasthan')).strip() if pd.notna(row.get('State')) else 'Rajasthan'
        pincode = str(row.get('Pincode', '')).strip() if pd.notna(row.get('Pincode')) else None
        
        # Class info
        class_name = str(row.get('Class Name', 'I')).strip()
        section = str(row.get('Section Name', 'A')).strip() if pd.notna(row.get('Section Name')) else 'A'
        
        # Parent info
        parent1_name = str(row.get('Father Name', 'Guardian')).strip() if pd.notna(row.get('Father Name')) else 'Guardian'
        parent1_phone = str(row.get('Father Primary Contact', phone)).strip() if pd.notna(row.get('Father Primary Contact')) else phone
        if parent1_phone:
            parent1_phone = re.sub(r'[^\d]', '', parent1_phone)[:10]
            
        parent2_name = str(row.get('Mother Name', '')).strip() if pd.notna(row.get('Mother Name')) else None
        parent2_phone = str(row.get('Mother Primary Contact', '')).strip() if pd.notna(row.get('Mother Primary Contact')) else None
        if parent2_phone:
            parent2_phone = re.sub(r'[^\d]', '', parent2_phone)[:10]
        
        blood_group = str(row.get('Blood Group', '')).strip() if pd.notna(row.get('Blood Group')) else None
        aadhar = str(row.get('Aadhaar No.', '')).strip() if pd.notna(row.get('Aadhaar No.')) else None
        if aadhar:
            aadhar = re.sub(r'[^\d]', '', aadhar)[:12]
            if len(aadhar) < 12:
                aadhar = None
        
        # Insert student
        cursor.execute("""
            INSERT INTO students (
                admission_number, first_name, middle_name, last_name, date_of_birth, gender,
                blood_group, email, phone, address, city, state, pincode,
                class, section, academic_year, admission_date, status,
                parent1_name, parent1_relation, parent1_phone,
                parent2_name, parent2_relation, parent2_phone,
                aadhar_number, nationality, created_by
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            admission_no, first_name, middle_name, last_name, dob, gender,
            blood_group, email, phone, address, city, state, pincode,
            class_name, section, '2025-2026', admission_date, 'active',
            parent1_name, 'Father', parent1_phone,
            parent2_name, 'Mother', parent2_phone,
            aadhar, 'Indian', admin_id
        ))
        
        student_count += 1
        if student_count % 100 == 0:
            print(f"  Imported {student_count} students...")
            conn.commit()
            
    except Exception as e:
        errors.append(f"Row {idx}: {str(e)}")
        continue

conn.commit()
print(f"✅ Imported {student_count} students")

if errors:
    print(f"\n⚠️  {len(errors)} errors encountered (showing first 5):")
    for err in errors[:5]:
        print(f"  - {err}")

# Import Staff
print("\n👥 Importing staff from stafflist.xls...")
df_staff = pd.read_excel('stafflist.xls', skiprows=5)  # Skip header rows

print(f"\nFound {len(df_staff)} staff records")

staff_count = 0
staff_errors = []

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
        
        # Staff code becomes employee ID
        employee_id = str(row.get('Staff Code', f'EMP{str(idx+1).zfill(4)}')).strip()
        
        # Date fields
        dob_str = row.get('Date of Birth')
        dob = '1990-01-01'
        if pd.notna(dob_str):
            try:
                if isinstance(dob_str, pd.Timestamp):
                    dob = dob_str.strftime('%Y-%m-%d')
                else:
                    dob_date = pd.to_datetime(str(dob_str), errors='coerce')
                    if pd.notna(dob_date):
                        dob = dob_date.strftime('%Y-%m-%d')
            except:
                pass
                
        joining_date_str = row.get('Joining Date')
        joining_date = '2020-04-01'
        if pd.notna(joining_date_str):
            try:
                if isinstance(joining_date_str, pd.Timestamp):
                    joining_date = joining_date_str.strftime('%Y-%m-%d')
                else:
                    join_date = pd.to_datetime(str(joining_date_str), errors='coerce')
                    if pd.notna(join_date):
                        joining_date = join_date.strftime('%Y-%m-%d')
            except:
                pass
        
        # Other fields
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
                
        address = str(row.get('Address', '')).strip() if pd.notna(row.get('Address')) else None
        city = str(row.get('City', 'Chirawa')).strip() if pd.notna(row.get('City')) else 'Chirawa'
        state = str(row.get('State', 'Rajasthan')).strip() if pd.notna(row.get('State')) else 'Rajasthan'
        pincode = str(row.get('Permanent Pin', '')).strip() if pd.notna(row.get('Permanent Pin')) else None
        
        qualification = str(row.get('Qualification', '')).strip() if pd.notna(row.get('Qualification')) else None
        blood_group = str(row.get('Blood Group', '')).strip() if pd.notna(row.get('Blood Group')) else None
        
        aadhar = str(row.get('Aadhaar No.', '')).strip() if pd.notna(row.get('Aadhaar No.')) else None
        if aadhar:
            aadhar = re.sub(r'[^\d]', '', aadhar)[:12]
            if len(aadhar) < 12:
                aadhar = None
                
        pan = str(row.get('Pan No', '')).strip() if pd.notna(row.get('Pan No')) else None
        
        # Insert staff
        cursor.execute("""
            INSERT INTO staff (
                employee_id, first_name, middle_name, last_name, date_of_birth, gender,
                blood_group, email, phone, address, city, state, pincode,
                staff_type, designation, department, date_of_joining, employment_type, status,
                highest_qualification, aadhar_number, pan_number, nationality, created_by
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """, (
            employee_id, first_name, middle_name, last_name, dob, gender,
            blood_group, email, phone, address, city, state, pincode,
            staff_type, designation, department, joining_date, 'permanent', 'active',
            qualification, aadhar, pan, 'Indian', admin_id
        ))
        
        staff_count += 1
        if staff_count % 20 == 0:
            print(f"  Imported {staff_count} staff...")
            conn.commit()
            
    except Exception as e:
        staff_errors.append(f"Row {idx}: {str(e)}")
        continue

conn.commit()
print(f"✅ Imported {staff_count} staff members")

if staff_errors:
    print(f"\n⚠️  {len(staff_errors)} errors encountered (showing first 5):")
    for err in staff_errors[:5]:
        print(f"  - {err}")

# Summary
print("\n" + "=" * 80)
print("IMPORT COMPLETE")
print("=" * 80)
print(f"✅ Students: {student_count} imported")
print(f"✅ Staff: {staff_count} imported")
print("\n🎉 Your real data is now in the system!")

cursor.close()
conn.close()
