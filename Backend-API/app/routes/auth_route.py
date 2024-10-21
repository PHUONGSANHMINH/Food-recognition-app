# app/routes/auth.py
from flask import Blueprint
from app.controllers.users_controller import login, register, send_code_forget_password, change_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login_view():
    return login()

@auth_bp.route('/register', methods=['POST'])
def register_view():
    return register()

@auth_bp.route('/forget-password/send-code', methods=['POST'])
def send_code_forget_password_view():
    return send_code_forget_password()

@auth_bp.route('/forget-password/change', methods=['POST'])
def change_password_view():
    return change_password()
