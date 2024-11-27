import re, random
from flask import request, jsonify
from app import db, mail
from app.models.model import User
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity
)
from app.utils.common import get_locale, get_message
from flask_mail import Mail, Message
import secrets
from datetime import datetime, timedelta

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(username)
    print(password)

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id_user)
        refresh_token = create_refresh_token(identity=user.id_user)
        return jsonify(access_token=access_token, refresh_token=refresh_token), 200
    else:
        lang = get_locale()
        return jsonify({"msg": get_message('bad_credentials', lang)}), 401

def is_valid_username(username):
    # Username phải từ 4-16 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
    return re.match("^[a-zA-Z0-9_]{4,16}$", username)

def is_strong_password(password):
    # Mật khẩu phải từ 8 ký tự trở lên, chứa chữ hoa, chữ thường, số và ký tự đặc biệt
    if len(password) < 8:
        return False
    if not re.search("[a-z]", password):
        return False
    if not re.search("[A-Z]", password):
        return False
    if not re.search("[0-9]", password):
        return False
    if not re.search("[@#$%^&+=]", password):
        return False
    return True

def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    lang = get_locale()

    errors = {
        "username": [],
        "password": []
    }

    # Kiểm tra nếu username đã tồn tại
    if User.query.filter_by(username=username).first():
        errors["username"].append(get_message('username_exists', lang))

    # Kiểm tra tính hợp lệ của username
    if not username:
        errors["username"].append(get_message('username_required', lang))
    elif not is_valid_username(username):
        errors["username"].append(get_message('invalid_username', lang))

    # Kiểm tra độ mạnh của mật khẩu
    if not password:
        errors["password"].append(get_message('password_required', lang))
    elif not is_strong_password(password):
        errors["password"].append(get_message('weak_password', lang))

    # Nếu có lỗi, trả về lỗi chi tiết
    if errors["username"] or errors["password"]:
        return jsonify({"errors": errors}), 400

    # Nếu không có lỗi, tiến hành đăng ký người dùng mới
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": get_message('user_registered', lang)}), 201



@jwt_required()
def view_all_users():
    users = User.query.all()
    user_list = [{"id": user.id_user, "username": user.username} for user in users]
    return jsonify(users=user_list), 200

@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if current_user_id != user.id_user:
        lang = get_locale()
        return jsonify({"msg": get_message('permission_denied', lang)}), 403

    db.session.delete(user)
    db.session.commit()
    lang = get_locale()
    return jsonify({"msg": get_message('user_deleted', lang)}), 200

@jwt_required()
def update_user(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)

    if 'username' in data:
        user.username = data['username']
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    lang = get_locale()
    return jsonify({"msg": get_message('user_updated', lang)}), 200

@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token), 200

def send_code_forget_password():
    data = request.get_json()
    email = data.get("email")
    lang = get_locale()
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": get_message('email_does_not_exist', lang)}), 404
    
    # Tạo mã xác thực ngẫu nhiên 6 chữ số
    code = f"{secrets.randbelow(1000000):06}"
    
    # Đặt mã xác thực và thời gian hết hạn
    user.set_reset_code(code)
    db.session.commit()
    
    # Gửi email với mã xác thực
    msg = Message(
        '[Learn for Beginners] - Verify Code',
        sender='liseentocbien@gmail.com',  # Đảm bảo địa chỉ gửi hợp lệ
        recipients=[email]
    )
    msg.body = f"Your verification code is: {code}\n\nPlease use this code to verify your email address."
    try:
        mail.send(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {str(e)}")
    
    return jsonify({"msg": get_message('successfully_send_code', lang)}), 200

def verify_code():
    lang = get_locale()
    data = request.get_json()
    email = data.get("email")
    verify_code = data.get("verifycode")

    # Kiểm tra các trường bắt buộc
    if not email or not verify_code:
        return jsonify({"msg": get_message('missing_fields', lang)}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": get_message('email_does_not_exist', lang)}), 404

    # Kiểm tra mã xác thực
    is_valid, reason = is_verify_code_valid(user, verify_code)
    if not is_valid:
        if reason == "max_attempts_exceeded":
            return jsonify({"msg": get_message('max_attempts_exceeded', lang)}), 403
        elif reason == "invalid_code":
            return jsonify({"msg": get_message('invalid_verify_code', lang)}), 400
        elif reason == "expired_code":
            return jsonify({"msg": get_message('expired_verify_code', lang)}), 400

    return jsonify({"msg": get_message('code_verified', lang)}), 200

def change_password():
    lang = get_locale()
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("newpassword")
    confirm_password = data.get("confirmpassword")
    verify_code = data.get("verifycode")

    # Kiểm tra các trường bắt buộc
    if not email or not new_password or not confirm_password or not verify_code:
        return jsonify({"msg": get_message('missing_fields', lang)}), 400

    # Kiểm tra mật khẩu xác nhận
    if new_password != confirm_password:
        return jsonify({"msg": get_message('passwords_do_not_match', lang)}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": get_message('email_does_not_exist', lang)}), 404

    # Kiểm tra mã xác thực
    is_valid, reason = is_verify_code_valid(user, verify_code)
    if not is_valid:
        if reason == "max_attempts_exceeded":
            return jsonify({"msg": get_message('max_attempts_exceeded', lang)}), 403
        elif reason == "invalid_code":
            return jsonify({"msg": get_message('invalid_verify_code', lang)}), 400
        elif reason == "expired_code":
            return jsonify({"msg": get_message('expired_verify_code', lang)}), 400

    # Kiểm tra độ mạnh của mật khẩu mới
    if not is_strong_password(new_password):
        return jsonify({"msg": get_message('weak_password', lang)}), 400

    # Đặt mật khẩu mới và xóa mã xác thực
    user.set_password(new_password)
    user.clear_reset_code()
    db.session.commit()

    # Gửi email thông báo thay đổi mật khẩu
    msg = Message(
        'Password Changed Successfully',
        sender='noreply@learnforbeginners.com',
        recipients=[email]
    )
    msg.body = "Your password has been successfully changed. If you did not perform this action, please contact support immediately."
    mail.send(msg)

    return jsonify({"msg": get_message('password_changed', lang)}), 200


def is_verify_code_valid(user, verify_code):
    MAX_ATTEMPTS = 5  # Giới hạn số lần thử
    if user.reset_attempts >= MAX_ATTEMPTS:
        return False, "max_attempts_exceeded"
    
    if user.reset_code != verify_code:
        user.reset_attempts += 1
        db.session.commit()
        return False, "invalid_code"
    
    if user.reset_code_expiration < datetime.utcnow():
        return False, "expired_code"
    
    # Nếu mã hợp lệ, reset số lần thử
    user.reset_attempts = 0
    db.session.commit()
    return True, "valid_code"




