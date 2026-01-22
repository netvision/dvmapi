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

# Get students table columns
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'students'
    ORDER BY ordinal_position
""")

print("STUDENTS TABLE COLUMNS:")
print("="*80)
for col in cursor.fetchall():
    print(f"{col[0]:50} {col[1]}")

print(f"\n\nTotal columns: {cursor.rowcount}")

cursor.close()
conn.close()
