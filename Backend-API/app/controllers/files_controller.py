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
        
        # Tạo tên file với timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'recipes_export_{timestamp}.csv'
        
        try:
            # Tạo đường dẫn đến folder recommend-dataset
            dataset_folder = os.path.abspath(os.path.join(current_app.root_path, '..', 'recommend-dataset'))
            if not os.path.exists(dataset_folder):
                os.makedirs(dataset_folder)
                
            file_path = os.path.join(dataset_folder, filename)
        except OSError as e:
            raise Exception(f"Failed to create directory or file path: {str(e)}")
        
        try:
            # Query các recipe đã được duyệt
            approved_recipes = db.session.query(RecipeInfo)\
                .join(RecipesContribution)\
                .filter(RecipesContribution.accept_contribution == True)\
                .all()
                
            if not approved_recipes:
                raise Exception("No approved recipes found to export")
                
        except SQLAlchemyError as e:
            raise Exception(f"Database error while fetching recipes: {str(e)}")
        
        try:
            # Mở file CSV để ghi
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id_recipe', 'name_recipe', 'image', 'type', 'status', 'summary', 'ingredients']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for recipe in approved_recipes:
                    try:
                        # Lấy danh sách ingredients
                        ingredients = db.session.query(RecipeIngredients)\
                            .filter(RecipeIngredients.id_recipe == recipe.id_recipe)\
                            .all()
                        
                        ingredients_list = []
                        for ing in ingredients:
                            ingredient_dict = {
                                'id_ingredient': ing.id_ingredient,
                                'name_ingredient': ing.name_ingredient
                            }
                            if hasattr(ing, 'quantity') and ing.quantity is not None:
                                ingredient_dict['quantity'] = ing.quantity
                            if hasattr(ing, 'unit') and ing.unit is not None:
                                ingredient_dict['unit'] = ing.unit
                            if hasattr(ing, 'image') and ing.image is not None:
                                ingredient_dict['image'] = ing.image
                            
                            ingredients_list.append(ingredient_dict)
                        
                        status_list = []
                        if recipe.status:
                            status_list = [s.strip() for s in recipe.status.split(',')]
                        
                        row = {
                            'id_recipe': recipe.id_recipe,
                            'name_recipe': recipe.name_recipe,
                            'image': recipe.image,
                            'type': recipe.type,
                            'status': ','.join(status_list) if status_list else '',
                            'summary': recipe.summary,
                            'ingredients': json.dumps(ingredients_list)
                        }
                        writer.writerow(row)
                        
                    except SQLAlchemyError as e:
                        raise Exception(f"Error processing recipe {recipe.id_recipe}: {str(e)}")
                        
                    except (AttributeError, KeyError) as e:
                        raise Exception(f"Data format error for recipe {recipe.id_recipe}: {str(e)}")
                        
        except IOError as e:
            raise Exception(f"Error writing to CSV file: {str(e)}")
        
        try:
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
            db.session.commit()
            
            # Lưu tên file CSV vào bảng config
            config_entry = db.session.query(Config).filter_by(config_name='data_recommend_csv').first()
            if config_entry:
                config_entry.config_value = "recommend-dataset/" + filename
            else:
                new_config = Config(config_name='data_recommend_csv', config_value= "recommend-dataset/" + filename)
                db.session.add(new_config)
            db.session.commit()
            
        except SQLAlchemyError as e:
            # Nếu lỗi khi lưu record, xóa file đã tạo
            if os.path.exists(file_path):
                os.remove(file_path)
            raise Exception(f"Failed to save export record: {str(e)}")
        
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