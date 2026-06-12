import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URI = os.getenv('DATABASE_URI')
engine = create_engine(DATABASE_URI)

def fix():
    with engine.connect() as conn:
        try:
            # We use a CASE statement to be extremely explicit about the conversion
            # from SMALLINT (0/1) to BOOLEAN.
            sql = text("""
                ALTER TABLE recipes_contribution 
                ALTER COLUMN accept_contribution 
                TYPE BOOLEAN 
                USING (CASE WHEN accept_contribution = 1 THEN TRUE ELSE FALSE END)
            """)
            conn.execute(sql)
            conn.commit()
            print("Successfully fixed database datatype.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix()
