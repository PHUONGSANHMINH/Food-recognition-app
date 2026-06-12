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

def fix_datatype():
    with engine.connect() as connection:
        try:
            # Alter column type from SMALLINT to BOOLEAN
            # Note: We use USING cast to convert existing data (0/1) to boolean
            query = text("ALTER TABLE recipes_contribution ALTER COLUMN accept_contribution TYPE BOOLEAN USING (accept_contribution::boolean)")
            connection.execute(query)
            connection.commit()
            print("Successfully altered column recipes_contribution.accept_contribution to TYPE BOOLEAN.")
        except Exception as e:
            print(f"Error altering column: {e}")

if __name__ == "__main__":
    fix_datatype()
    print("Database datatype fix complete.")
