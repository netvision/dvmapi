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

cursor.execute("""
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'students' 
    ORDER BY ordinal_position
""")

cols = cursor.fetchall()

print('\n' + '='*100)
print('STUDENTS TABLE SCHEMA')
print('='*100)
print(f'{"Column Name":<40} {"Type":<30} {"Nullable":<10}')
print('-'*100)

for c in cols:
    nullable = "NULL" if c[2] == "YES" else "NOT NULL"
    print(f'{c[0]:<40} {c[1]:<30} {nullable:<10}')

print(f'\nTotal Columns: {len(cols)}')

# Get sample student
cursor.execute("SELECT * FROM students LIMIT 1")
student = cursor.fetchone()
if student:
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'students' ORDER BY ordinal_position")
    column_names = [c[0] for c in cursor.fetchall()]
    print(f'\nSample Student Record (first 50 fields):')
    print('-'*100)
    for i, (col, val) in enumerate(zip(column_names[:50], student[:50])):
        val_str = str(val)[:50] if val is not None else 'NULL'
        print(f'{col:<40} {val_str}')

conn.close()
