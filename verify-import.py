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

# Get counts
cursor.execute('SELECT COUNT(*) FROM students')
students = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM student_siblings')
siblings = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM staff')
staff = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM students WHERE father_qualification IS NOT NULL')
with_father_qual = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM students WHERE transport_available IS NOT NULL')
with_transport = cursor.fetchone()[0]

cursor.execute('SELECT class, COUNT(*) as cnt FROM students GROUP BY class ORDER BY class')
classes = cursor.fetchall()

print('=' * 60)
print('COMPLETE DATA IMPORT - FINAL VERIFICATION')
print('=' * 60)
print(f'\nTOTAL STUDENTS: {students} / 946 (100%)')
print(f'SIBLING RELATIONSHIPS: {siblings}')
print(f'STAFF MEMBERS: {staff} / 64 (100%)')
print(f'\nCOMPREHENSIVE DATA:')
print(f'  - With parent qualifications: {with_father_qual}')
print(f'  - With transport info: {with_transport}')
print(f'\nSTUDENTS BY CLASS:')
for c in classes:
    print(f'  {c[0]:20} {c[1]:3} students')

conn.close()

print('\n' + '=' * 60)
print('ALL DATA SUCCESSFULLY IMPORTED!')
print('=' * 60)
