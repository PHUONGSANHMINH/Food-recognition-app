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

tables_and_sequences = [
    ('recipe_info', 'id_recipe', 'recipe_info_id_recipe_seq'),
    ('recipe_ingredients', 'id_ingredient', 'recipe_ingredients_id_ingredient_seq'),
    ('recipe_nutrition', 'id_nutrition', 'recipe_nutrition_id_nutrition_seq'),
    ('recipe_vitamin', 'id_vitamin', 'recipe_vitamin_id_vitamin_seq'),
    ('recipe_steps', 'id_step', 'recipe_steps_id_step_seq'),
    ('user', 'id_user', 'user_id_user_seq'),
    ('diary_entry', 'id_entry', 'diary_entry_id_entry_seq'),
    ('recipes_favourite', 'id', 'recipes_favourite_id_seq'),
    ('rating', 'id_rate', 'rating_id_rate_seq'),
    ('csv_export_version', 'id', 'csv_export_version_id_seq'),
    ('user_daily_nutrition_goal', 'id_goal', 'user_daily_nutrition_goal_id_goal_seq'),
    ('user_daily_log', 'id_log', 'user_daily_log_id_log_seq'),
    ('search_history', 'id', 'search_history_id_seq'),
]

def fix_sequences():
    with engine.connect() as connection:
        for table, col, seq in tables_and_sequences:
            try:
                # Get max ID
                max_id_query = text(f"SELECT MAX({col}) FROM {table}")
                max_id = connection.execute(max_id_query).scalar() or 0
                
                # Reset sequence
                reset_query = text(f"SELECT setval('{seq}', {max_id + 1}, false)")
                connection.execute(reset_query)
                connection.commit()
                print(f"Successfully reset sequence {seq} for table {table} to {max_id + 1}")
            except Exception as e:
                print(f"Error resetting {seq} for {table}: {e}")

if __name__ == "__main__":
    fix_sequences()
    print("Database sequences fix complete.")
