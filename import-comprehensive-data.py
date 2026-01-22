import pandas as pd
import pg8000
from dotenv import load_dotenv
import os
from datetime import datetime
import re
import json

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

def safe_str(val, default=''):
    """Safely convert to string, handling NaN and truncating long values"""
    if pd.isna(val) or val == '' or str(val).strip() == 'nan':
        return default if default else None
    result = str(val).strip()
    # Truncate if too long (most varchar fields are 100 or 255)
    if len(result) > 250:
        result = result[:250]
    return result

def safe_int(val, default=None):
    """Safely convert to integer"""
    if pd.isna(val):
        return default
    try:
        return int(float(val))
    except:
        return default

def safe_float(val, default=None):
    """Safely convert to float"""
    if pd.isna(val):
        return default
    try:
        return float(val)
    except:
        return default

def safe_bool(val, default=False):
    """Safely convert to boolean"""
    if pd.isna(val):
        return default
    str_val = str(val).strip().lower()
    return str_val in ['yes', 'true', '1', 'y']

def parse_date(date_val, default='2015-01-01'):
    """Parse date from various formats"""
    if pd.isna(date_val):
        return default
    try:
        if isinstance(date_val, pd.Timestamp):
            return date_val.strftime('%Y-%m-%d')
        date_obj = pd.to_datetime(str(date_val), format='%d-%m-%Y', errors='coerce', dayfirst=True)
        if pd.notna(date_obj):
            return date_obj.strftime('%Y-%m-%d')
    except:
        pass
    return default

def clean_phone(phone_val):
    """Clean phone number"""
    if pd.isna(phone_val):
        return None
    phone = re.sub(r'[^\d]', '', str(phone_val))
    if len(phone) >= 10:
        return phone[:10]
    return None

def clean_aadhar(aadhar_val):
    """Clean Aadhar number"""
    if pd.isna(aadhar_val):
        return None
    aadhar = re.sub(r'[^\d]', '', str(aadhar_val))
    if len(aadhar) == 12:
        return aadhar
    return None

print("=" * 80)
print("IMPORTING COMPREHENSIVE STUDENT & STAFF DATA")
print("=" * 80)

# Get admin user ID
cursor.execute("SELECT id FROM users WHERE email = 'admin@institute.com'")
admin_id = cursor.fetchone()[0]

# Clear existing data
print("\nClearing existing data...")
cursor.execute("DELETE FROM student_siblings")
cursor.execute("DELETE FROM staff_experience")
cursor.execute("DELETE FROM staff_qualifications_detailed")
cursor.execute("DELETE FROM staff")
cursor.execute("DELETE FROM students")
conn.commit()
print("Existing data cleared")

# ====================== IMPORT STUDENTS ======================
print("\nImporting students from studentlist.xls...")
df_students = pd.read_excel('studentlist.xls', skiprows=4)

print(f"Found {len(df_students)} student records with {len(df_students.columns)} columns")

student_count = 0
sibling_count = 0
errors = []

for idx, row in df_students.iterrows():
    try:
        # Basic info
        first_name = safe_str(row.get('Student First Name'))
        if not first_name:
            continue
            
        middle_name = safe_str(row.get('Student Middle Name'), None)
        last_name = safe_str(row.get('Student Last Name'), '')
        # If last_name is empty, use first_name as both (for single-name students)
        if not last_name:
            last_name = first_name
        admission_no = safe_str(row.get('Admission No.', f'2025{str(idx+1).zfill(4)}'))
        
        # Identifiers
        user_id = safe_str(row.get('User ID'), None)
        # Convert user_id to None since database expects UUID, not string
        if user_id and not user_id.startswith(('a', 'b', 'c', 'd', 'e', 'f')):  # Not a UUID
            user_id = None
        family_id = safe_str(row.get('Family ID'), None)
        roll_number = safe_str(row.get('Roll No.'), None)
        pen_number = safe_str(row.get('PEN'), None)
        apaar_id = safe_str(row.get('APAAR ID'), None)
        abha_number = safe_str(row.get('ABHA No.'), None)
        
        # Dates
        dob = parse_date(row.get('Date Of Birth'))
        admission_date = parse_date(row.get('Date of Admission'), '2025-04-01')
        joining_date = parse_date(row.get('Joining Date'), admission_date)
        fee_applicable_date = parse_date(row.get('Fee Applicable Date'), None)
        withdrawn_date = parse_date(row.get('Withdrawn Date'), None)
        
        # Basic details
        gender = 'male' if safe_str(row.get('Gender'), 'boy').lower() in ['boy', 'male'] else 'female'
        blood_group = safe_str(row.get('Blood Group'), None)
        email = safe_str(row.get('Primary Email ID'), None)
        phone = clean_phone(row.get('Primary Mobile No.'))
        
        # Address
        address = safe_str(row.get('Address'), None)
        city = safe_str(row.get('City'), 'Chirawa')
        state = safe_str(row.get('State'), 'Rajasthan')
        pincode = safe_str(row.get('Pincode'), None)
        
        # Correspondence
        corr_address = safe_str(row.get('Correspondence Address'), None)
        corr_city = safe_str(row.get('Correspondence City'), None)
        corr_state = safe_str(row.get('Correspondence State'), None)
        corr_pincode = safe_str(row.get('Correspondence Pincode'), None)
        
        # Academic
        class_name = safe_str(row.get('Class Name'), 'I')
        # Truncate class_name if too long (varchar 100 limit)
        if class_name and len(class_name) > 50:
            class_name = class_name[:50]
        section = safe_str(row.get('Section Name'), 'A')
        academic_year = '2025-2026'
        class_of_first_admission = safe_str(row.get('Class Of First Admission'), None)
        previous_class = safe_str(row.get('Previous Class Name'), None)
        admission_year = safe_str(row.get('Admission Year'), '2025-26')
        is_new_student = safe_bool(row.get('Is New Student'))
        groups = safe_str(row.get('Groups'), None)
        house = safe_str(row.get('House'), None)
        wing = safe_str(row.get('Wing'), None)
        status = 'active' if safe_str(row.get('Status'), 'Active').lower() == 'active' else 'inactive'
        
        # Categories
        category_type = safe_str(row.get('Category'), None)
        student_type = safe_str(row.get('Student Type'), 'Day Scholar')
        boarding_type = safe_str(row.get('Boarding Type'), None)
        fee_category = safe_str(row.get('Fee Category'), None)
        nationality = safe_str(row.get('Nationality'), 'Indian')
        religion = safe_str(row.get('Religion'), None)
        mother_tongue = safe_str(row.get('Mother Tongue'), None)
        
        # Flags
        is_single_child = safe_bool(row.get('Is Single Child'))
        is_single_parent_child = safe_bool(row.get('Is Single Parent Child'))
        special_needs = safe_str(row.get('Special Needs'), None)
        student_tag = safe_str(row.get('Student Tag'), None)
        
        # Subjects - convert to array
        subjects_str = safe_str(row.get('Subjects'), '')
        subjects = [s.strip() for s in subjects_str.split(',')] if subjects_str else []
        
        optional_subjects_str = safe_str(row.get('Optional Subjects'), '')
        optional_subjects = [s.strip() for s in optional_subjects_str.split(',')] if optional_subjects_str else []
        
        subject_codes_str = safe_str(row.get('Subject code'), '')
        subject_codes = [s.strip() for s in subject_codes_str.split(',')] if subject_codes_str else []
        
        scholastic = safe_str(row.get('SCHOLASTIC'), None)
        co_scholastic = safe_str(row.get('CO-SCHOLASTIC'), None)
        main_subject = safe_str(row.get('Subjects'), None)
        
        # Previous school
        prev_school_name = safe_str(row.get('Previous School Name'), None)
        
        # Physical details
        height_cm = safe_float(row.get('Height (cm)'))
        weight_kg = safe_float(row.get('Weight'))
        vision_left = safe_str(row.get('Vision_L'), None)
        vision_right = safe_str(row.get('Vision_R'), None)
        place_of_birth = safe_str(row.get('Place Of Birth'), None)
        birth_state = safe_str(row.get('Birth State'), None)
        
        # Father details
        father_salutation = safe_str(row.get('Father Salutation'), None)
        father_name = safe_str(row.get('Father Name'), 'Guardian')
        father_email = safe_str(row.get('Father Email ID'), None)
        father_phone = clean_phone(row.get('Father Primary Contact'))
        # Ensure parent1_phone has a value (required field)
        if not father_phone:
            father_phone = phone or '0000000000'  # Use student phone or default
        father_dob = parse_date(row.get('Father DOB'), None)
        father_qualification = safe_str(row.get('Father Qualification'), None)
        father_specialization = safe_str(row.get('Father Specialization'), None)
        father_profession = safe_str(row.get('Father Profession'), None)
        father_designation = safe_str(row.get('Father Designation'), None)
        father_office = safe_str(row.get('Father Office Name'), None)
        father_office_address = safe_str(row.get('Father Office Address'), None)
        father_office_contact = clean_phone(row.get('Father Office Contact No.'))
        father_income = safe_float(row.get('Father Annual Income'))
        father_aadhar = clean_aadhar(row.get('Father Aadhaar No.'))
        father_photo = safe_str(row.get('Father Photo'), None)
        father_whatsapp = clean_phone(row.get('Father WhatsApp Number'))
        father_card = safe_str(row.get('Father Card No.'), None)
        father_is_staff = safe_bool(row.get('Father Name If Staff'))
        
        # Mother details
        mother_salutation = safe_str(row.get('Mother Salutation'), None)
        mother_name = safe_str(row.get('Mother Name'), None)
        mother_email = safe_str(row.get('Mother Email ID'), None)
        mother_phone = clean_phone(row.get('Mother Primary Contact'))
        mother_dob = parse_date(row.get('Mother DOB'), None)
        mother_qualification = safe_str(row.get('Mother Qualification'), None)
        mother_specialization = safe_str(row.get('Mother Specialization'), None)
        mother_profession = safe_str(row.get('Mother Profession'), None)
        mother_designation = safe_str(row.get('Mother Designation'), None)
        mother_office = safe_str(row.get('Mother Office Name'), None)
        mother_office_address = safe_str(row.get('Mother Office Address'), None)
        mother_office_contact = clean_phone(row.get('Mother Office Contact No.'))
        mother_income = safe_float(row.get('Mother Annual Income'))
        mother_aadhar = clean_aadhar(row.get('Mother Aadhaar No.'))
        mother_photo = safe_str(row.get('Mother Photo'), None)
        mother_whatsapp = clean_phone(row.get('Mother WhatsApp Number'))
        mother_card = safe_str(row.get('Mother Card No.'), None)
        mother_is_staff = safe_bool(row.get('Mother Name If Staff'))
        
        # Guardian details
        guardian_aunt_name = safe_str(row.get('GUARDIAN AUNT NAME'), None)
        guardian_aunt_contact = clean_phone(row.get('GUARDIAN AUNT MOBILE NO'))
        guardian_uncle_name = safe_str(row.get('GUARDIAN UNCLE NAME'), None)
        guardian_uncle_contact = clean_phone(row.get('GUARDIAN UNCLE MOBILE NO'))
        guardian_grandfather_name = safe_str(row.get('GUARDIAN GRANDFATHER NAME'), None)
        guardian_grandfather_contact = clean_phone(row.get('GUARDIAN GRANDFATHER MOBILE NO'))
        guardian_grandmother_name = safe_str(row.get('GUARDIAN GRANDMOTHER NAME'), None)
        guardian_grandmother_contact = clean_phone(row.get('GUARDIAN GRANDMOTHER MOBILE NO'))
        guardian_driver_name = safe_str(row.get('GUARDIAN DRIVER NAME'), None)
        guardian_driver_contact = clean_phone(row.get('GUARDIAN DRIVER MOBILE NO'))
        
        # Transport
        is_transport = safe_bool(row.get('Is Transport'))
        transport_available = safe_str(row.get('Transport Avail'), None)
        pickup_route = safe_str(row.get('Pickup Route'), None)
        pickup_stop = safe_str(row.get('Pickup Bus Stop'), None)
        pickup_stop_no = safe_str(row.get('Pickup Bus Stop No'), None)
        pickup_time_str = safe_str(row.get('Pickup Time'), None)
        pickup_bus_route_abb = safe_str(row.get('Bus Route Abb (Pickup'), None)
        pickup_sequence = safe_int(row.get('Pick Sequence'))
        
        drop_route = safe_str(row.get('Drop Route'), None)
        drop_stop = safe_str(row.get('Drop Bus Stop'), None)
        drop_stop_no = safe_str(row.get('Drop Bus Stop No'), None)
        drop_time_str = safe_str(row.get('Drop Time'), None)
        drop_bus_route_abb = safe_str(row.get('Bus Route Abb (Drop'), None)
        drop_sequence = safe_int(row.get('Drop Sequence'))
        
        # Bus staff details (pickup)
        pickup_driver = safe_str(row.get('Driver Name (Pickup)'), None)
        pickup_driver_contact = clean_phone(row.get('Driver Mobile No (Pickup)'))
        pickup_driver_license = safe_str(row.get('Driver License No. (Pickup)'), None)
        pickup_driver_address = safe_str(row.get('Driver Address (Pickup)'), None)
        pickup_conductor = safe_str(row.get('Conductor Name (Pickup)'), None)
        pickup_conductor_contact = clean_phone(row.get('Conductor Mobile No (Pickup)'))
        pickup_helper = safe_str(row.get('Helper Name (Pickup)'), None)
        pickup_helper_contact = clean_phone(row.get('Helper Mobile No (Pickup)'))
        pickup_caretaker = safe_str(row.get('Caretaker Name (Pickup)'), None)
        pickup_caretaker_contact = clean_phone(row.get('Caretaker Mobile No (Pickup)'))
        pickup_vehicle = safe_str(row.get('Vehicle Details (Pickup)'), None)
        
        # Bus staff details (drop)
        drop_driver = safe_str(row.get('Driver Name (Drop)'), None)
        drop_driver_contact = clean_phone(row.get('Driver Mobile No (Drop)'))
        drop_driver_license = safe_str(row.get('Driver License No. (Drop)'), None)
        drop_driver_address = safe_str(row.get('Driver Address (Drop)'), None)
        drop_conductor = safe_str(row.get('Conductor Name (Drop)'), None)
        drop_conductor_contact = clean_phone(row.get('Conductor Mobile No (Drop)'))
        drop_helper = safe_str(row.get('Helper Name (Drop)'), None)
        drop_helper_contact = clean_phone(row.get('Helper Mobile No (Drop)'))
        drop_caretaker = safe_str(row.get('Caretaker Name (Drop)'), None)
        drop_caretaker_contact = clean_phone(row.get('Caretaker Mobile No (Drop)'))
        drop_vehicle = safe_str(row.get('Vehicle Details (Drop)'), None)
        
        seat_number = safe_str(row.get('seatno'), None)
        
        # Fee and bank
        is_ecs = safe_bool(row.get('Is ECS'))
        bank_name = safe_str(row.get('Bank Name'), None)
        bank_code = safe_str(row.get('Bank Code'), None)
        bank_branch = safe_str(row.get('Bank Branch'), None)
        bank_account_holder = safe_str(row.get('Bank A/C Holder Name'), None)
        bank_account_number = safe_str(row.get('Bank A/C No'), None)
        bank_account_type = safe_str(row.get('Bank A/C Type'), None)
        bank_micr = safe_str(row.get('Bank MICR'), None)
        bank_umrn = safe_str(row.get('Bank UMRN'), None)
        
        # Devices
        attendance_device_id = safe_str(row.get('Attendance Device ID'), None)
        biometric_device = safe_str(row.get('Device'), None)
        rfid_card = safe_str(row.get('RFID Card No.'), None)
        
        # Mentoring
        class_teacher = safe_str(row.get('Class Teacher Name'), None)
        mentor = safe_str(row.get('Mentor'), None)
        counselor = safe_str(row.get('Counselor'), None)
        
        # Documents and photos
        student_photo = safe_str(row.get('Image'), None)
        student_photo_path = safe_str(row.get('Student Photo Path'), None)
        family_photo = safe_str(row.get('Family User Photo'), None)
        dob_cert_no = safe_str(row.get('DOB Certificate No.'), None)
        aadhar_path = safe_str(row.get('Aadhar Card'), None)
        birth_cert_path = safe_str(row.get('Birth Certificate'), None)
        passport_photo_path = safe_str(row.get('Passport Photo'), None)
        report_card_path = safe_str(row.get('Report Card'), None)
        studying_cert_path = safe_str(row.get('Studying Certificate'), None)
        
        # Family details
        num_sons = safe_int(row.get('No of Sons'), 0)
        num_daughters = safe_int(row.get('No of Daughters'), 0)
        games_played_str = safe_str(row.get('Games Played'), '')
        games_played = [g.strip() for g in games_played_str.split(',')] if games_played_str else []
        
        # Other
        aadhar_number = clean_aadhar(row.get('Aadhaar No.'))
        school_number = safe_str(row.get('School No.'), None)
        section_strength = safe_int(row.get('Section Strength'))
        last_year_class = safe_str(row.get('last year'), None)
        withdrawal_remarks = safe_str(row.get('Withdrawal Remarks'), None)
        
        # Insert student with comprehensive data
        cursor.execute("""
            INSERT INTO students (
                -- Basic info
                admission_number, first_name, middle_name, last_name, date_of_birth, gender,
                blood_group, email, phone, address, city, state, pincode,
                -- Identifiers
                user_id, family_id, roll_number, pen_number, apaar_id, abha_number,
                -- Academic
                class, section, academic_year, admission_date, joining_date, 
                class_of_first_admission, previous_class_name, admission_year, is_new_student,
                groups, house, wing, status, category_type, student_type, boarding_type,
                fee_category, nationality, religion, mother_tongue,
                -- Flags
                is_single_child, is_single_parent_child, special_needs, student_tag,
                -- Subjects
                subjects, optional_subjects, subject_codes, scholastic_subjects, 
                co_scholastic_subjects, main_subject,
                -- Previous school
                previous_school_name,
                -- Physical
                height_cm, weight_kg, vision_left, vision_right, place_of_birth, birth_state,
                -- Father
                father_salutation, parent1_name, father_email, parent1_phone, father_dob,
                father_qualification, father_specialization, father_profession, father_designation,
                father_office_name, father_office_address, father_office_contact, father_annual_income,
                father_aadhar_number, father_photo_url, father_whatsapp_number, father_card_number,
                father_is_staff, parent1_relation,
                -- Mother
                mother_salutation, parent2_name, mother_email, parent2_phone, mother_dob,
                mother_qualification, mother_specialization, mother_profession, mother_designation,
                mother_office_name, mother_office_address, mother_office_contact, mother_annual_income,
                mother_aadhar_number, mother_photo_url, mother_whatsapp_number, mother_card_number,
                mother_is_staff, parent2_relation,
                -- Guardians
                guardian_aunt_name, guardian_aunt_contact,
                guardian_uncle_name, guardian_uncle_contact,
                guardian_grandfather_name, guardian_grandfather_contact,
                guardian_grandmother_name, guardian_grandmother_contact,
                guardian_driver_name, guardian_driver_contact,
                -- Transport
                is_transport, transport_available, pickup_route, pickup_stop, pickup_stop_number,
                pickup_bus_route_abb, pickup_sequence, drop_route, drop_stop, drop_stop_number,
                drop_bus_route_abb, drop_sequence, seat_number,
                -- Bus staff (pickup)
                pickup_driver_name, pickup_driver_contact, pickup_driver_license, pickup_driver_address,
                pickup_conductor_name, pickup_conductor_contact, pickup_helper_name, pickup_helper_contact,
                pickup_caretaker_name, pickup_caretaker_contact, pickup_vehicle_details,
                -- Bus staff (drop)
                drop_driver_name, drop_driver_contact, drop_driver_license, drop_driver_address,
                drop_conductor_name, drop_conductor_contact, drop_helper_name, drop_helper_contact,
                drop_caretaker_name, drop_caretaker_contact, drop_vehicle_details,
                -- Fee and bank
                fee_applicable_date, is_ecs, bank_name, bank_code, bank_branch, bank_account_holder,
                bank_account_number, bank_account_type, bank_micr_code, bank_umrn,
                -- Devices
                attendance_device_id, biometric_device, rfid_card_number,
                -- Mentoring
                class_teacher_name, mentor_name, counselor_name,
                -- Documents
                student_photo_url, student_photo_path, family_photo_url, dob_certificate_number,
                aadhar_card_path, birth_certificate_path, passport_photo_path, report_card_path,
                studying_certificate_path,
                -- Correspondence
                correspondence_address, correspondence_city, correspondence_state, 
                correspondence_pincode,
                -- Family
                number_of_sons, number_of_daughters, games_played,
                -- Other
                aadhar_number, school_number, section_strength, last_year_class,
                withdrawn_date, withdrawal_remarks,
                -- System
                created_by
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s
            )
        """, (
            # Basic info
            admission_no, first_name, middle_name, last_name, dob, gender,
            blood_group, email, phone, address, city, state, pincode,
            # Identifiers
            user_id, family_id, roll_number, pen_number, apaar_id, abha_number,
            # Academic
            class_name, section, academic_year, admission_date, joining_date,
            class_of_first_admission, previous_class, admission_year, is_new_student,
            groups, house, wing, status, category_type, student_type, boarding_type,
            fee_category, nationality, religion, mother_tongue,
            # Flags
            is_single_child, is_single_parent_child, special_needs, student_tag,
            # Subjects
            subjects, optional_subjects, subject_codes, scholastic, co_scholastic, main_subject,
            # Previous school
            prev_school_name,
            # Physical
            height_cm, weight_kg, vision_left, vision_right, place_of_birth, birth_state,
            # Father
            father_salutation, father_name, father_email, father_phone, father_dob,
            father_qualification, father_specialization, father_profession, father_designation,
            father_office, father_office_address, father_office_contact, father_income,
            father_aadhar, father_photo, father_whatsapp, father_card, father_is_staff, 'Father',
            # Mother
            mother_salutation, mother_name, mother_email, mother_phone, mother_dob,
            mother_qualification, mother_specialization, mother_profession, mother_designation,
            mother_office, mother_office_address, mother_office_contact, mother_income,
            mother_aadhar, mother_photo, mother_whatsapp, mother_card, mother_is_staff, 'Mother',
            # Guardians
            guardian_aunt_name, guardian_aunt_contact,
            guardian_uncle_name, guardian_uncle_contact,
            guardian_grandfather_name, guardian_grandfather_contact,
            guardian_grandmother_name, guardian_grandmother_contact,
            guardian_driver_name, guardian_driver_contact,
            # Transport
            is_transport, transport_available, pickup_route, pickup_stop, pickup_stop_no,
            pickup_bus_route_abb, pickup_sequence, drop_route, drop_stop, drop_stop_no,
            drop_bus_route_abb, drop_sequence, seat_number,
            # Bus staff (pickup)
            pickup_driver, pickup_driver_contact, pickup_driver_license, pickup_driver_address,
            pickup_conductor, pickup_conductor_contact, pickup_helper, pickup_helper_contact,
            pickup_caretaker, pickup_caretaker_contact, pickup_vehicle,
            # Bus staff (drop)
            drop_driver, drop_driver_contact, drop_driver_license, drop_driver_address,
            drop_conductor, drop_conductor_contact, drop_helper, drop_helper_contact,
            drop_caretaker, drop_caretaker_contact, drop_vehicle,
            # Fee and bank
            fee_applicable_date, is_ecs, bank_name, bank_code, bank_branch, bank_account_holder,
            bank_account_number, bank_account_type, bank_micr, bank_umrn,
            # Devices
            attendance_device_id, biometric_device, rfid_card,
            # Mentoring
            class_teacher, mentor, counselor,
            # Documents
            student_photo, student_photo_path, family_photo, dob_cert_no,
            aadhar_path, birth_cert_path, passport_photo_path, report_card_path, studying_cert_path,
            # Correspondence
            corr_address, corr_city, corr_state, corr_pincode,
            # Family
            num_sons, num_daughters, games_played,
            # Other
            aadhar_number, school_number, section_strength, last_year_class,
            withdrawn_date, withdrawal_remarks,
            # System
            admin_id
        ))
        
        # Get the inserted student ID for sibling relationships
        cursor.execute("SELECT id FROM students WHERE admission_number = %s", (admission_no,))
        student_id = cursor.fetchone()[0]
        
        # Handle sibling details
        sibling_details_str = safe_str(row.get('Sibling Details'), '')
        if sibling_details_str and sibling_details_str != '-':
            # Sibling details format varies, try to parse
            siblings = sibling_details_str.split(',')
            for sib_info in siblings:
                sib_info = sib_info.strip()
                if sib_info and sib_info != '-':
                    # Insert sibling record
                    cursor.execute("""
                        INSERT INTO student_siblings (
                            student_id, sibling_name, is_studying_in_school
                        ) VALUES (%s, %s, %s)
                    """, (student_id, sib_info, True))
                    sibling_count += 1
        
        student_count += 1
        if student_count % 100 == 0:
            print(f"  Imported {student_count} students...")
            conn.commit()
            
    except Exception as e:
        fname = first_name if 'first_name' in locals() else 'unknown'
        errors.append(f"Row {idx} ({fname}): {str(e)[:100]}")
        print(f"  Error at row {idx} ({fname}): {str(e)[:200]}")
        conn.rollback()  # Rollback failed transaction
        if len(errors) > 50:
            print(f"  Too many errors, stopping import...")
            break
        continue

conn.commit()
print(f"Imported {student_count} students")
print(f"Created {sibling_count} sibling relationships")

if errors:
    print(f"\n{len(errors)} errors encountered (showing first 3):")
    for err in errors[:3]:
        print(f"  - {err}")

# ====================== IMPORT STAFF ======================
print("\nImporting staff from stafflist.xls...")
df_staff = pd.read_excel('stafflist.xls', skiprows=5)

print(f"Found {len(df_staff)} staff records with {len(df_staff.columns)} columns")

staff_count = 0
staff_errors = []

for idx, row in df_staff.iterrows():
    try:
        name = safe_str(row.get('Name'))
        if not name:
            continue
            
        # Split name
        name_parts = name.split()
        first_name = name_parts[0] if len(name_parts) > 0 else 'Staff'
        last_name = name_parts[-1] if len(name_parts) > 1 else 'Member'
        middle_name = ' '.join(name_parts[1:-1]) if len(name_parts) > 2 else None
        
        # Identifiers
        employee_id = safe_str(row.get('Staff Code'), f'EMP{str(idx+1).zfill(4)}')
        staff_code = employee_id
        user_id = safe_str(row.get('User Id'), None)
        # Convert user_id to None since database expects UUID, not string
        if user_id and not user_id.startswith(('a', 'b', 'c', 'd', 'e', 'f')):  # Not a UUID
            user_id = None
        biometric_code = safe_str(row.get('Biometric Code'), None)
        rfid_card = safe_str(row.get('RFID Card No.'), None)
        sequence_number = safe_int(row.get('Sequence No'))
        
        # Personal details
        salutation = safe_str(row.get('Salutation'), None)
        dob = parse_date(row.get('Date of Birth'), '1990-01-01')
        gender = safe_str(row.get('Gender'), 'male').lower()
        if gender not in ['male', 'female', 'other']:
            gender = 'male'
        blood_group = safe_str(row.get('Blood Group'), None)
        place_of_birth = safe_str(row.get('Place of Birth'), None)
        birth_state = safe_str(row.get('Birth State'), None)
        marital_status = safe_str(row.get('Marital Status'), None)
        religion = safe_str(row.get('Religion'), None)
        
        # Family
        spouse_name = safe_str(row.get('Spouse Name'), None)
        spouse_profession = safe_str(row.get('Spouse Profession'), None)
        spouse_organization = safe_str(row.get('Spouse Organization'), None)
        spouse_contact = clean_phone(row.get('Spouse No'))
        date_of_anniversary = parse_date(row.get('Date of Anniversary'), None)
        father_name = safe_str(row.get('Father Name'), None)
        father_contact = clean_phone(row.get('Father No'))
        mother_name = safe_str(row.get('Mother Name'), None)
        mother_contact = clean_phone(row.get('Mother No'))
        
        # Contact
        email = safe_str(row.get('Personal Email Id'), f'{first_name.lower()}.{last_name.lower()}@institute.com')
        official_email = safe_str(row.get('Official Email Id'), None)
        phone = clean_phone(row.get('Phone No.'))
        mobile = clean_phone(row.get('Mobile No.'))
        phone = mobile or phone  # Prefer mobile
        
        # Address
        address = safe_str(row.get('Address'), None)
        city = safe_str(row.get('City'), 'Chirawa')
        state = safe_str(row.get('State'), 'Rajasthan')
        pincode = safe_str(row.get('Permanent Pin'), None)
        
        # Correspondence
        corr_address = safe_str(row.get('Correspondence Address'), None)
        corr_city = safe_str(row.get('Correspondence City'), None)
        corr_state = safe_str(row.get('Correspondence State'), None)
        corr_pincode = safe_str(row.get('Correspondence Pin'), None)
        
        # Professional
        user_type = safe_str(row.get('User Type'), None)
        reporting_authority = safe_str(row.get('Reporting Authority'), None)
        class_teacher_of = safe_str(row.get('Class Teacher of'), None)
        class_incharge = safe_str(row.get('Class Incharge'), None)
        wing = safe_str(row.get('Wing'), None)
        cost_center = safe_str(row.get('Cost Center'), None)
        
        designation = safe_str(row.get('Designation'), 'Teacher')
        department = safe_str(row.get('Department'), None)
        
        # Determine staff type
        staff_type = 'teaching'
        if pd.notna(row.get('Staff Type')):
            st = safe_str(row.get('Staff Type')).lower()
            if 'non-teaching' in st or 'non teaching' in st:
                staff_type = 'non-teaching'
            elif 'admin' in st:
                staff_type = 'administrative'
            elif 'support' in st:
                staff_type = 'support'
        
        # Dates
        joining_date = parse_date(row.get('Joining Date'), '2020-04-01')
        date_of_regular = parse_date(row.get('Date of Regular'), None)
        confirmation_date = parse_date(row.get('Confirmation Date'), None)
        service_end_date = parse_date(row.get('Service End Date'), None)
        relieving_date = parse_date(row.get('Relieving Date'), None)
        relieving_reason = safe_str(row.get('Relieving Reason'), None)
        
        # Experience
        total_experience = safe_str(row.get('Total Working Experience'), None)
        joining_time = safe_str(row.get('Joining time as on today'), None)
        
        # Qualifications
        qualification = safe_str(row.get('Qualification'), None)
        qualification_subject = safe_str(row.get('Qualification Subject'), None)
        main_subject = safe_str(row.get('Main Subject'), None)
        
        # Bank details
        bank_name = safe_str(row.get('Bank'), None)
        bank_branch = safe_str(row.get('Bank Branch'), None)
        bank_account = safe_str(row.get('Account No.'), None)
        bank_ifsc = safe_str(row.get('Ifsc Code'), None)
        payment_type = safe_str(row.get('Payment Type'), None)
        
        # Government IDs
        esi_no = safe_str(row.get('ESI No.'), None)
        pf_no = safe_str(row.get('PF No.'), None)
        uan_no = safe_str(row.get('UAN No'), None)
        pan_no = safe_str(row.get('Pan No'), None)
        aadhar_no = clean_aadhar(row.get('Aadhaar No.'))
        election_card = safe_str(row.get('Election Card No'), None)
        pension_contribution = safe_str(row.get('No Contribution in Pension fund'), None)
        
        # Transport
        pickup_route = safe_str(row.get('Pickup Bus Route'), None)
        pickup_stop = safe_str(row.get('Pickup Bus Stop'), None)
        drop_route = safe_str(row.get('Drop Bus Route'), None)
        drop_stop = safe_str(row.get('Drop Bus Stop'), None)
        
        # Documents
        is_upload_photo = safe_bool(row.get('Is Upload Employee Photo'))
        is_upload_signature = safe_bool(row.get('Is Upload Employee Signature'))
        photo_url = safe_str(row.get('Employee Photo URL'), None)
        
        # Other
        age_as_of_today = safe_str(row.get('Age as on Today'), None)
        
        # Insert staff with comprehensive data
        cursor.execute("""
            INSERT INTO staff (
                -- Basic
                employee_id, staff_code, first_name, middle_name, last_name, date_of_birth, gender,
                blood_group, email, official_email, phone, address, city, state, pincode,
                -- Identifiers
                user_id, biometric_code, rfid_card_number, sequence_number,
                -- Personal
                salutation, place_of_birth, birth_state, marital_status, religion,
                spouse_name, spouse_profession, spouse_organization, spouse_contact,
                date_of_anniversary, father_name, father_contact, mother_name, mother_contact,
                -- Professional
                user_type, reporting_authority, class_teacher_of, class_incharge, wing, cost_center,
                staff_type, designation, department, date_of_joining, employment_type, status,
                -- Dates
                date_of_regular, confirmation_date, service_end_date, relieving_date, relieving_reason,
                -- Experience & qualifications
                total_working_experience, joining_time, highest_qualification, qualification_subject, main_subject,
                -- Bank
                bank_name, bank_branch, bank_account_number, bank_ifsc_code, payment_type,
                -- Govt IDs
                esi_number, pf_number, uan_number, pan_number, aadhar_number, election_card_number,
                pension_fund_contribution,
                -- Transport
                pickup_bus_route, pickup_bus_stop, drop_bus_route, drop_bus_stop,
                -- Documents
                is_upload_photo, is_upload_signature, employee_photo_url,
                -- Correspondence
                correspondence_address, correspondence_city, correspondence_state, 
                correspondence_pincode, permanent_pincode,
                -- Other
                age_as_of_today, nationality, created_by
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s
            )
        """, (
            # Basic
            employee_id, staff_code, first_name, middle_name, last_name, dob, gender,
            blood_group, email, official_email, phone, address, city, state, pincode,
            # Identifiers
            user_id, biometric_code, rfid_card, sequence_number,
            # Personal
            salutation, place_of_birth, birth_state, marital_status, religion,
            spouse_name, spouse_profession, spouse_organization, spouse_contact,
            date_of_anniversary, father_name, father_contact, mother_name, mother_contact,
            # Professional
            user_type, reporting_authority, class_teacher_of, class_incharge, wing, cost_center,
            staff_type, designation, department, joining_date, 'permanent', 'active',
            # Dates
            date_of_regular, confirmation_date, service_end_date, relieving_date, relieving_reason,
            # Experience & qualifications
            total_experience, joining_time, qualification, qualification_subject, main_subject,
            # Bank
            bank_name, bank_branch, bank_account, bank_ifsc, payment_type,
            # Govt IDs
            esi_no, pf_no, uan_no, pan_no, aadhar_no, election_card, pension_contribution,
            # Transport
            pickup_route, pickup_stop, drop_route, drop_stop,
            # Documents
            is_upload_photo, is_upload_signature, photo_url,
            # Correspondence
            corr_address, corr_city, corr_state, corr_pincode, pincode,
            # Other
            age_as_of_today, 'Indian', admin_id
        ))
        
        staff_count += 1
        if staff_count % 20 == 0:
            print(f"  Imported {staff_count} staff...")
            conn.commit()
            
    except Exception as e:
        ename = name if 'name' in locals() else 'unknown'
        staff_errors.append(f"Row {idx} ({ename}): {str(e)[:100]}")
        print(f"  Error at row {idx} ({ename}): {str(e)[:200]}")
        conn.rollback()  # Rollback failed transaction
        if len(staff_errors) > 10:
            print(f"  Too many errors, stopping import...")
            break
        continue

conn.commit()
print(f"Imported {staff_count} staff members")

if staff_errors:
    print(f"\n{len(staff_errors)} errors encountered (showing first 3):")
    for err in staff_errors[:3]:
        print(f"  - {err}")

# Summary
print("\n" + "=" * 80)
print("COMPREHENSIVE IMPORT COMPLETE")
print("=" * 80)
print(f"Students: {student_count} imported with full details")
print(f"Sibling relationships: {sibling_count} created")
print(f"Staff: {staff_count} imported with full details")
print("\nDatabase now contains:")
print("  - Complete transport information (routes, stops, drivers)")
print("  - Family details (parents, guardians, siblings)")
print("  - Financial information (fees, bank details)")
print("  - Academic history and mentoring assignments")
print("  - Physical measurements and health data")
print("  - Documents and photos")
print("  - And much more!")
print("\nYour comprehensive school data is now in the system!")

cursor.close()
conn.close()
