import re
from flask import request, jsonify
from app import db
from app.models.model import Config, RecipeInfo, User, RecipesContribution, UserDailyNutritionGoal, UserDailyLog
from app.utils.common import get_locale, get_message
from sqlalchemy import or_, func
from datetime import datetime, timedelta
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

def superadmin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Truy vấn bảng Config để lấy thông tin đăng nhập của superadmin
    username_config = Config.query.filter_by(config_name='superadmin_username').first()
    password_config = Config.query.filter_by(config_name='superadmin_password').first()

    if username_config and password_config:
        stored_username = username_config.config_value
        stored_password = password_config.config_value

        # Kiểm tra thông tin đăng nhập
        if stored_username == username and stored_password == password:
            # Fetch the user to get their id_user for consistent JWT identity
            user = User.query.filter_by(username=stored_username).first()
            identity = user.id_user if user else stored_username
            
            access_token = create_access_token(identity=identity, additional_claims={"role": "admin", "username": stored_username})
            refresh_token = create_refresh_token(identity=identity, additional_claims={"role": "admin", "username": stored_username})
            return jsonify(access_token=access_token, refresh_token=refresh_token), 200
        else:
            lang = get_locale()
            return jsonify({"msg": get_message('bad_credentials', lang)}), 401
    else:
        lang = get_locale()
        return jsonify({"msg": get_message('config_not_found', lang)}), 404


@jwt_required()
def get_config():
    config_name = request.args.get('config_name')

    if not config_name:
        lang = get_locale()
        return jsonify({"msg": get_message('invalid_input', lang)}), 400

    # Tìm cấu hình hiện tại
    config = Config.query.filter_by(config_name=config_name).first()
    
    if not config:
        lang = get_locale()
        return jsonify({"msg": get_message('config_not_found', lang)}), 404

    return jsonify({
        'config_name': config.config_name,
        'config_value': config.config_value
    }), 200

@jwt_required()
def update_config():
    data = request.get_json()
    config_name = data.get('config_name')
    config_value = data.get('config_value')

    if not config_name or not config_value:
        lang = get_locale()
        return jsonify({"msg": get_message('invalid_input', lang)}), 400

    # Tìm cấu hình hiện tại
    config = Config.query.filter_by(config_name=config_name).first()
    
    if not config:
        lang = get_locale()
        return jsonify({"msg": get_message('config_not_found', lang)}), 404

    # Cập nhật giá trị
    config.config_value = config_value
    db.session.commit()

    return jsonify({"msg": "Config updated successfully"}), 200

@jwt_required()
def get_statistics():
    # Tổng số recipe
    total_recipes = RecipeInfo.query.count()

    # Tổng số user (loại trừ status 0 và 1)
    total_users = User.query.filter(User.status.notin_([0, 1])).count()

    # Tổng số contribution (loại trừ contribution của userid 1)
    total_contributions = RecipesContribution.query.filter(RecipesContribution.id_user != 1).count()

    # Tổng số contribution chưa được duyệt (loại trừ contribution của userid 1)
    total_unapproved_contributions = RecipesContribution.query.filter(
        (RecipesContribution.accept_contribution == 0) & 
        (RecipesContribution.id_user != 1)
    ).count()

    # Trả về dữ liệu dưới dạng JSON
    result = {
        "total_recipes": total_recipes,
        "total_users": total_users,
        "total_contributions": total_contributions,
        "total_unapproved_contributions": total_unapproved_contributions
    }

    return jsonify(result), 200

def get_monthly_contributions():
    try:
        # Tính toán ngày bắt đầu của 1 năm trước
        one_year_ago = datetime.now() - timedelta(days=365)

        # Truy vấn đóng góp theo tháng bằng DATE_FORMAT trong MySQL
        contributions = db.session.query(
            func.date_format(RecipesContribution.date, '%Y-%m').label('month'),
            func.count(RecipesContribution.id_recipe).label('contributions')
        ).filter(
            RecipesContribution.id_user != 1,  # Loại trừ userid 1
            RecipesContribution.date >= one_year_ago  # Chỉ lấy record trong 1 năm qua
        ).group_by(
            func.date_format(RecipesContribution.date, '%Y-%m')  # Nhóm theo tháng
        ).order_by(
            func.date_format(RecipesContribution.date, '%Y-%m')  # Sắp xếp theo thứ tự tháng
        ).all()

        # Chuyển đổi dữ liệu thành định dạng dễ sử dụng
        monthly_data = [{
            'month': contribution[0],  # Tháng dưới dạng 'YYYY-MM'
            'contributions': contribution[1]
        } for contribution in contributions]

        return jsonify(monthly_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def get_calorie_observation():
    """Lấy dữ liệu quan sát calo: trung bình mục tiêu vs trung bình tiêu thụ 7 ngày qua"""
    try:
        # 1. Tính trung bình calo mục tiêu của tất cả người dùng
        avg_goal = db.session.query(func.avg(UserDailyNutritionGoal.calories_goal)).scalar() or 0
        
        # 2. Lấy trung bình calo tiêu thụ của tất cả người dùng theo từng ngày trong 7 ngày qua
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        
        # Tạo danh sách các ngày trong khoảng
        date_list = [start_date + timedelta(days=i) for i in range(7)]
        date_labels = [d.strftime('%Y-%m-%d') for d in date_list]
        
        # Truy vấn dữ liệu tiêu thụ trung bình theo ngày
        daily_averages = db.session.query(
            UserDailyLog.log_date,
            func.avg(UserDailyLog.calories_intake).label('avg_intake')
        ).filter(
            UserDailyLog.log_date >= start_date,
            UserDailyLog.log_date <= end_date
        ).group_by(UserDailyLog.log_date).all()
        
        # Mapping dữ liệu vào label
        avg_intake_map = {str(row.log_date): row.avg_intake for row in daily_averages}
        intake_data = [round(avg_intake_map.get(label, 0), 2) for label in date_labels]
        goal_data = [round(avg_goal, 2)] * 7
        
        return jsonify({
            "labels": date_labels,
            "goal_data": goal_data,
            "intake_data": intake_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def get_recent_contributions():
    """Lấy 5 công thức đóng góp mới nhất"""
    try:
        recent = db.session.query(
            RecipeInfo.name_recipe,
            RecipesContribution.accept_contribution,
            User.username
        ).join(
            RecipesContribution, RecipeInfo.id_recipe == RecipesContribution.id_recipe
        ).join(
            User, RecipesContribution.id_user == User.id_user
        ).order_by(RecipesContribution.date.desc()).limit(5).all()

        result = [{
            'name_recipe': r.name_recipe,
            'status': 'Approved' if r.accept_contribution == 1 else 'Pending Review' if r.accept_contribution == 0 else 'Rejected',
            'username': r.username
        } for r in recent]

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def get_user_status():
    """Lấy trạng thái online/offline của 5 user mới nhất"""
    try:
        users = User.query.filter(User.status.notin_([0, 1])).order_by(User.id_user.desc()).limit(5).all()
        
        status_map = {
            2: 'Online',
            3: 'Offline'
        }

        result = [{
            'username': u.username,
            'status': status_map.get(u.status, 'Offline')
        } for u in users]

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
