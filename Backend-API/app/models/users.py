# app/models.py

from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(1024), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Các trường mới cho chức năng quên mật khẩu
    reset_code = db.Column(db.String(6), nullable=True)
    reset_code_expiration = db.Column(db.DateTime, nullable=True)
    reset_attempts = db.Column(db.Integer, default=0, nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def set_reset_code(self, code, expiration_minutes=10):
        """Đặt mã xác thực và thời gian hết hạn."""
        self.reset_code = code
        self.reset_code_expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
        self.reset_attempts = 0  # Reset số lần thử khi mã mới được thiết lập
    
    def clear_reset_code(self):
        """Xóa mã xác thực và thời gian hết hạn."""
        self.reset_code = None
        self.reset_code_expiration = None
        self.reset_attempts = 0
