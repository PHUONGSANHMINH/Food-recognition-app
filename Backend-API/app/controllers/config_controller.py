import re
from flask import request, jsonify
from app import db
from app.models.model import Config
from app.utils.common import get_locale, get_message
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
