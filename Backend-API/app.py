# run.py

from app import create_app, db
from app.models.model import User
from flask_cors import CORS

app = create_app()
CORS(app)

with app.app_context():
    db.create_all()
    # Tạo người dùng mẫu nếu chưa có
    if not User.query.filter_by(username='test').first():
        user = User(username='test', email='test@gmail.com')
        user.set_password('testpassword')
        db.session.add(user)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
