import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URI = os.getenv('DATABASE_URI')

if not DATABASE_URI:
    print("Error: DATABASE_URI not found in .env")
    exit(1)

# Connect to database
engine = create_engine(DATABASE_URI)

def migrate_to_integer():
    with engine.connect() as connection:
        try:
            print("Beginning migration of accept_contribution column to INTEGER...")
            
            # 1. Alter column type from BOOLEAN to INTEGER
            # Using cast to convert TRUE to 1 and FALSE to 0
            query = text("""
                ALTER TABLE recipes_contribution 
                ALTER COLUMN accept_contribution TYPE INTEGER 
                USING (CASE WHEN accept_contribution THEN 1 ELSE 0 END)
            """)
            connection.execute(query)
            connection.commit()
            print("Successfully altered column recipes_contribution.accept_contribution to TYPE INTEGER.")
            
        except Exception as e:
            connection.rollback()
            print(f"Error migrating column: {e}")

if __name__ == "__main__":
    migrate_to_integer()
    print("Database migration complete.")
