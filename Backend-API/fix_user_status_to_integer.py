from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv(override=True)
db_uri = os.getenv('DATABASE_URI')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

def migrate():
    with app.app_context():
        print(f"Connecting to DB...")
        try:
            # 1. Quoted "user" table name
            # 2. Drop default first to avoid mismatch
            print("Dropping default and preparing data...")
            db.session.execute(text('ALTER TABLE "user" ALTER COLUMN status DROP DEFAULT'))
            
            # Fetch and update all users to ensure they are integer strings
            all_users = db.session.execute(text('SELECT id_user, status FROM "user"')).fetchall()
            for user_id, status in all_users:
                new_status = 3 # Default to Offline
                if status == 'hidden' or status == '1':
                    new_status = 1
                elif status == 'Online' or status == '2':
                    new_status = 2
                elif status == 'Offline' or status == '3' or status is None or status == '':
                    new_status = 3
                
                db.session.execute(text('UPDATE "user" SET status = :s WHERE id_user = :id'), {'s': str(new_status), 'id': user_id})
            
            # Now alter the column with USING
            print("Altering column status to INTEGER...")
            db.session.execute(text('ALTER TABLE "user" ALTER COLUMN status TYPE INTEGER USING (status::integer)'))
            
            # Restore default
            db.session.execute(text('ALTER TABLE "user" ALTER COLUMN status SET DEFAULT 3'))
            
            db.session.commit()
            print("Migration successful: User.status is now INTEGER.")
        except Exception as e:
            db.session.rollback()
            print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
