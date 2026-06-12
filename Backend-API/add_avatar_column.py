import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

def add_avatar_column():
    with engine.connect() as conn:
        try:
            # Check if column exists
            check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='user' AND column_name='avatar_image'")
            res = conn.execute(check_sql).fetchone()
            
            if not res:
                sql = text("ALTER TABLE \"user\" ADD COLUMN avatar_image TEXT")
                conn.execute(sql)
                conn.commit()
                print("Successfully added avatar_image column to user table.")
            else:
                print("Column avatar_image already exists.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_avatar_column()
