import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Get connection string
db_uri = os.getenv('DATABASE_URI')

print(f"Testing connection to: {db_uri}")

try:
    # Create engine and connect
    engine = create_engine(db_uri)
    with engine.connect() as connection:
        # Execute simple SQL
        result = connection.execute(text("SELECT 1"))
        print("\nSUCCESS! Connected to Render Database.")
except OperationalError as e:
    print("\nFAILED! Connection error:")
    print(e)
except Exception as e:
    print("\nERROR:")
    print(e)
