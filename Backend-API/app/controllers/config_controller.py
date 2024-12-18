import re
from flask import request, jsonify
from app import db
from app.models.model import Config, RecipeInfo, User, RecipesContribution
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
            access_token = create_access_token(identity=stored_username, additional_claims={"role": "admin"})
            refresh_token = create_refresh_token(identity=stored_username, additional_claims={"role": "admin"})
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

    # Tổng số user
    total_users = User.query.filter(or_(User.status != 'hidden', User.status == None)).count()

    # Tổng số contribution (loại trừ contribution của userid 1)
    total_contributions = RecipesContribution.query.filter(RecipesContribution.id_user != 1).count()

    # Tổng số contribution chưa được duyệt (loại trừ contribution của userid 1)
    total_unapproved_contributions = RecipesContribution.query.filter(
        (RecipesContribution.accept_contribution == False) & 
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

