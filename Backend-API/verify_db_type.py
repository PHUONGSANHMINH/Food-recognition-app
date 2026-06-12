import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

def verify():
    with engine.connect() as conn:
        q = text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'recipes_contribution' AND column_name = 'accept_contribution'")
        row = conn.execute(q).fetchone()
        if row:
            print(f"Column: {row[0]}, Type: {row[1]}")
        else:
            print("Column not found.")

if __name__ == "__main__":
    verify()
