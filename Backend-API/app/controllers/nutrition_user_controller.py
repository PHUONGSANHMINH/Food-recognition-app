from app.models.model import User, UserDailyNutritionGoal
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app import db

@jwt_required()  # Chắc chắn rằng người dùng đã đăng nhập và có token hợp lệ
def update_calories():
    data = request.get_json()
    calories_goal = data.get('calories_goal')

    # Lấy user_id từ JWT token
    id_user = get_jwt_identity()
    if id_user == 'admin': user_id = 1

    # Kiểm tra xem người dùng có mục tiêu dinh dưỡng chưa
    nutrition_goal = UserDailyNutritionGoal.query.filter_by(id_user=id_user).first()

    if nutrition_goal:
        # Cập nhật calories_goal nếu người dùng đã có mục tiêu dinh dưỡng
        nutrition_goal.calories_goal = calories_goal
        db.session.commit()
        return jsonify({"msg": "Calories goal updated successfully."}), 200
    else:
        # Nếu không có mục tiêu dinh dưỡng, tạo mục tiêu mới với calories_goal
        new_goal = UserDailyNutritionGoal(
            id_user=id_user,
            calories_goal=calories_goal
        )
        db.session.add(new_goal)
        db.session.commit()
        return jsonify({"msg": "Calories goal created successfully."}), 201
    
@jwt_required()
def get_calories_goal():
    # Lấy user_id từ JWT token
    id_user = get_jwt_identity()
    
    # Kiểm tra quyền admin (nếu cần)
    if id_user == 'admin':
        id_user = 1

    # Truy vấn mục tiêu dinh dưỡng của user
    nutrition_goal = UserDailyNutritionGoal.query.filter_by(id_user=id_user).first()

    if nutrition_goal:
        return jsonify({"calories_goal": nutrition_goal.calories_goal}), 200
    else:
        return jsonify({"msg": "No calories goal found for this user."}), 404
