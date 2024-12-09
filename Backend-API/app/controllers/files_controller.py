from flask import send_from_directory, current_app, abort, jsonify
import os, csv, json
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.models.model import RecipeInfo, RecipeIngredients, RecipesContribution, CSVExportVersion, Config

def getFile(filename):
    # Lấy đường dẫn tuyệt đối của thư mục uploads
    uploads_folder = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
    
    print(f"Uploads folder path: {uploads_folder}")  # Log để kiểm tra đường dẫn tuyệt đối

    # Tạo đường dẫn đầy đủ tới file
    file_path = os.path.join(uploads_folder, filename)
    
    # Kiểm tra xem file có tồn tại không
    if not os.path.exists(file_path):
        # Nếu không tìm thấy file, trả về lỗi 404
        abort(404, description=f"File '{filename}' not found.")
    
    try:
        # Gửi file hình ảnh từ thư mục uploads, hỗ trợ thư mục con
        return send_from_directory(
            uploads_folder,  # Thư mục chứa ảnh
            filename,         # Đảm bảo filename có thể bao gồm cả thư mục con
            as_attachment=False  # Trả về file mà không phải tải xuống
        )
    except Exception as e:
        # Nếu có lỗi xảy ra, trả về lỗi 500
        return f"An error occurred: {str(e)}", 500
    
@jwt_required()
def export_recipes_to_csv():
    try:
        # Lấy current user từ JWT token
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1

        # Tạo tên file với timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'recipes_export_{timestamp}.csv'

        # Tạo đường dẫn đến folder recommend-dataset
        dataset_folder = os.path.abspath(os.path.join(current_app.root_path, '..', 'recommend-dataset'))
        os.makedirs(dataset_folder, exist_ok=True)
        file_path = os.path.join(dataset_folder, filename)

        # Query các recipe đã được duyệt
        approved_recipes = (
            db.session.query(RecipeInfo)
            .join(RecipesContribution)
            .filter(RecipesContribution.accept_contribution == True)
            .all()
        )

        if not approved_recipes:
            return jsonify({'error': 'No approved recipes found to export'}), 404

        # Mở file CSV để ghi
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['id_recipe', 'name_recipe', 'image', 'type', 'status', 'summary', 'ingredients']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for recipe in approved_recipes:
                # Lấy danh sách ingredients
                ingredients = (
                    db.session.query(RecipeIngredients)
                    .filter(RecipeIngredients.id_recipe == recipe.id_recipe)
                    .all()
                )

                ingredients_list = [
                    {
                        'id_ingredient': ing.id_ingredient,
                        'name_ingredient': ing.name_ingredient,
                        'quantity': getattr(ing, 'quantity', None),
                        'unit': getattr(ing, 'unit', None),
                        'image': getattr(ing, 'image', None)
                    }
                    for ing in ingredients
                ]

                status_list = [s.strip() for s in recipe.status.split(',')] if recipe.status else []

                row = {
                    'id_recipe': recipe.id_recipe,
                    'name_recipe': recipe.name_recipe,
                    'image': recipe.image,
                    'type': recipe.type,
                    'status': ','.join(status_list),
                    'summary': recipe.summary,
                    'ingredients': json.dumps(ingredients_list)
                }
                writer.writerow(row)

        # Tạo record trong CSVExportVersion
        file_size = os.path.getsize(file_path) / 1024  # Convert to KB
        export_version = CSVExportVersion(
            filename=filename,
            exported_by=current_user_id,
            total_recipes=len(approved_recipes),
            file_size=file_size,
            status='completed'
        )
        db.session.add(export_version)

        # Lưu tên file CSV vào bảng config
        config_entry = db.session.query(Config).filter_by(config_name='data_recommend_csv').first()
        if config_entry:
            config_entry.config_value = f"recommend-dataset/{filename}"
        else:
            new_config = Config(config_name='data_recommend_csv', config_value=f"recommend-dataset/{filename}")
            db.session.add(new_config)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Recipe dataset has been exported successfully',
            'data': {
                'filename': filename,
                'total_recipes': len(approved_recipes),
                'file_size': f"{file_size:.2f} KB",
                'path': file_path
            }
        }), 200

    except SQLAlchemyError as db_error:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(db_error)}'}), 500

    except OSError as os_error:
        return jsonify({'error': f'File system error: {str(os_error)}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
def get_export_history():
    try:
        exports = CSVExportVersion.query\
            .order_by(CSVExportVersion.created_at.desc())\
            .all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': export.id,
                'filename': export.filename,
                'created_at': export.created_at.isoformat(),
                'total_recipes': export.total_recipes,
                'file_size': export.file_size,
                'status': export.status,
                'error_message': export.error_message
            } for export in exports]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get export history',
            'error': str(e)
        }), 500