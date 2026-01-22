import pg8000
from dotenv import load_dotenv
import os

load_dotenv()

conn = pg8000.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
cursor = conn.cursor()

# Get schema
cursor.execute("""
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('classes', 'sections') 
    ORDER BY table_name, ordinal_position
""")
results = cursor.fetchall()

print('\n' + '='*60)
print('CLASSES & SECTIONS SCHEMA')
print('='*60)

print('\nCLASSES TABLE:')
for r in results:
    if r[0] == 'classes':
        print(f'  {r[1]:30} {r[2]}')

print('\nSECTIONS TABLE:')
for r in results:
    if r[0] == 'sections':
        print(f'  {r[1]:30} {r[2]}')

# Get counts
cursor.execute('SELECT COUNT(*) FROM classes')
print(f'\n{"Total Classes:":<30} {cursor.fetchone()[0]}')

cursor.execute('SELECT COUNT(*) FROM sections')
print(f'{"Total Sections:":<30} {cursor.fetchone()[0]}')

# Get sections per class
cursor.execute('''
    SELECT c.name, COUNT(s.id) as section_count 
    FROM classes c 
    LEFT JOIN sections s ON s.class_id = c.id 
    GROUP BY c.name, c.sequence_order 
    ORDER BY c.sequence_order
''')

print('\nSECTIONS PER CLASS:')
for r in cursor.fetchall():
    print(f'  {r[0]:20} {r[1]} sections')

# Sample section details
cursor.execute('''
    SELECT c.name as class, s.name as section, s.class_teacher_id, 
           s.total_students, s.wing
    FROM sections s
    JOIN classes c ON c.id = s.class_id
    ORDER BY c.sequence_order, s.name
    LIMIT 10
''')

print('\nSAMPLE SECTION DETAILS:')
print(f'  {"Class":<15} {"Section":<10} {"Teacher ID":<40} {"Students":<10} {"Wing"}')
print('  ' + '-'*90)
for r in cursor.fetchall():
    teacher = str(r[2])[:36] if r[2] else 'Not assigned'
    print(f'  {r[0]:<15} {r[1]:<10} {teacher:<40} {r[3] or 0:<10} {r[4] or "N/A"}')

conn.close()
print('\n' + '='*60)
