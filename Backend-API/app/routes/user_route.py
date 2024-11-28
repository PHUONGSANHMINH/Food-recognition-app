# app/routes/user.py
from flask import Blueprint
from app.controllers.users_controller import view_all_users, delete_user, update_user

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def view_all_users_view():
    return view_all_users()

@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user_view(user_id):
    return delete_user(user_id)

@user_bp.route('/user/<int:user_id>', methods=['PUT'])
def update_user_view(user_id):
    return update_user(user_id)
