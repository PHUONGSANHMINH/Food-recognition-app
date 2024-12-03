# app/controllers/csv_controller.py

from flask import jsonify, request
from app import db
from app.models.model import CSVExportVersion, Config
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os

@jwt_required()
def get_csv_versions():
    versions = CSVExportVersion.query.all()
    result = [
        {
            "id": version.id,
            "filename": version.filename,
            "created_at": version.created_at,
            "exported_by": version.exported_by,
            "total_recipes": version.total_recipes,
            "file_size": version.file_size,
            "status": version.status,
            "error_message": version.error_message
        } for version in versions
    ]
    return jsonify(result), 200

@jwt_required()
def get_csv_version(version_id):
    version = CSVExportVersion.query.filter_by(id=version_id).first()
    if not version:
        return jsonify({"msg": "Version not found"}), 404

    result = {
        "id": version.id,
        "filename": version.filename,
        "created_at": version.created_at,
        "exported_by": version.exported_by,
        "total_recipes": version.total_recipes,
        "file_size": version.file_size,
        "status": version.status,
        "error_message": version.error_message
    }
    return jsonify(result), 200


@jwt_required()
def set_csv_config():
    try:
        # Lấy current user từ JWT token
        current_user_id = get_jwt_identity()
        
        # Lấy dữ liệu từ request
        data = request.get_json()
        config_name = data.get('config_name', 'data_recommend_csv')
        config_value = data.get('config_value')
        
        if not config_value:
            return jsonify({'error': 'Config value is required'}), 400
        
        # Kiểm tra xem tệp có tồn tại trong thư mục recommend-dataset không
        file_path = os.path.join('recommend-dataset', config_value)
        if not os.path.exists(file_path):
            return jsonify({'error': f'File {file_path} does not exist'}), 404

        # Cập nhật giá trị trong bảng config
        config_entry = Config.query.filter_by(config_name=config_name).first()
        if config_entry:
            config_entry.config_value = file_path
        else:
            new_config = Config(config_name=config_name, config_value=file_path)
            db.session.add(new_config)
        
        db.session.commit()
        
        return jsonify({'message': 'Config updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

