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

print("=" * 80)
print("RUNNING MIGRATION 005 DIRECTLY")
print("=" * 80)

# Read and execute the migration
with open('src/database/migrations/005-enhance-students-comprehensive.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    # Execute the entire migration
    cursor.execute(sql)
    conn.commit()
    print("Migration 005 executed successfully")
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

# Check columns again
cursor.execute("""
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'students'
""")
count = cursor.fetchone()[0]
print(f"\nStudents table now has {count} columns")

# Check for specific transport columns
cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'students' 
    AND column_name LIKE '%route%'
    ORDER BY column_name
""")
transport_cols = cursor.fetchall()
print(f"\nTransport-related columns ({len(transport_cols)}):")
for col in transport_cols:
    print(f"  - {col[0]}")

cursor.close()
conn.close()
