# app/controllers/detect_controller.py

import re
import os
import requests
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from dotenv import load_dotenv
import logging

# Cấu hình logging để ghi lại các lỗi
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tải biến môi trường từ file .env
load_dotenv()

# Tải mô hình YOLOv8
MODEL_PATH = os.getenv('YOLOV8_MODEL_PATH', 'yolov8n.pt')
model = YOLO(MODEL_PATH)

# Cấu hình API của Spoonacular
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')
SPOONACULAR_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch'
SPOONACULAR_NUTRITION_URL = 'https://api.spoonacular.com/recipes/{id}/nutritionWidget.json'

# Khởi tạo mô hình gợi ý riêng (nếu có)
# RECOMMENDER = RecipeRecommender('app/data/processed_recipes.csv')  # Nếu sử dụng mô hình gợi ý riêng

# Hỗ trợ các định dạng file hợp lệ
def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@jwt_required()
def detect_recommend_spoonacular():
    if 'image' not in request.files:
        return jsonify({'msg': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        try:
            # Chạy YOLOv8 để phát hiện đối tượng
            results = model.predict(source=filepath, save=False)
            detected_labels = set()

            # Lấy kết quả từ mô hình
            for result in results:
                for cls in result.boxes.cls:
                    label = model.names[int(cls)]
                    clean_label = re.sub(r'^\d+\s+', '', label)
                    detected_labels.add(clean_label)

            detected_labels = list(detected_labels)
            os.remove(filepath)

            if not detected_labels:
                return jsonify({'msg': 'No objects detected'}), 200

            # Gợi ý từ Spoonacular
            ingredients = ','.join(detected_labels)
            params = {
                'apiKey': SPOONACULAR_API_KEY,
                'includeIngredients': ingredients,
                'number': 5,
                'ranking': 1,
                'addRecipeInformation': True
            }

            response = requests.get(SPOONACULAR_SEARCH_URL, params=params)

            if response.status_code != 200:
                return jsonify({'msg': 'Failed to fetch recommendations from Spoonacular', 'error': response.text}), 500

            data = response.json()
            recipes = data.get('results', [])

            if not recipes:
                return jsonify({'msg': 'No recipes found for detected ingredients'}), 200

            recommendations = []
            for recipe in recipes:
                # Lấy thông tin dinh dưỡng chính xác từ nutritionWidget.json
                recipe_info = get_recipe_info(recipe.get('id'))
                # Kết hợp thông tin cơ bản từ recipe search với thông tin dinh dưỡng
                combined_info = {
                    'id': recipe_info.get('id'),
                    'title': recipe.get('title'),
                    'image': recipe.get('image'),
                    'calories': recipe_info.get('calories'),
                    'summary': recipe.get('summary'),
                    'sourceUrl': recipe.get('sourceUrl'),
                }
                recommendations.append(combined_info)

            return jsonify({
                'detected_objects': detected_labels,
                'recommendations': recommendations
            }), 200

        except Exception as e:
            logger.error(f"Error during processing: {str(e)}")
            return jsonify({'msg': 'An error occurred during processing', 'error': str(e)}), 500
    else:
        return jsonify({'msg': 'Unsupported file type'}), 400

def get_recipe_info(recipe_id):
    """Lấy thông tin dinh dưỡng của công thức món ăn bao gồm calo."""
    url = SPOONACULAR_NUTRITION_URL.format(id=recipe_id)
    params = {
        'apiKey': SPOONACULAR_API_KEY
    }
    
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        # Trích xuất calo từ dữ liệu phản hồi
        calories = data.get('calories', 'N/A')
        
        return {
            'id': recipe_id,
            'calories': calories,  # Thêm thông tin calo đúng
        }
    else:
        logger.error(f"Failed to fetch nutrition info for Recipe ID {recipe_id}: {response.text}")
        return {
            'id': recipe_id,
            'error': 'Không lấy được thông tin dinh dưỡng công thức'
        }

@jwt_required()
def get_recipe_by_id():
    """
    API để lấy thông tin chi tiết của một công thức dựa trên recipe_id.
    Yêu cầu: GET /api/get_recipe/<int:recipe_id>
    """
    recipe_id = request.view_args.get('recipe_id')
    if not recipe_id:
        return jsonify({'msg': 'Recipe ID is required'}), 400

    try:
        recipe_info = get_recipe_info(recipe_id)
        return jsonify({'recipe': recipe_info}), 200
    except Exception as e:
        logger.error(f"Error fetching recipe by ID {recipe_id}: {str(e)}")
        return jsonify({'msg': 'An error occurred while fetching recipe information', 'error': str(e)}), 500

def get_recipe_instructions(recipe_id):
    """Lấy hướng dẫn nấu ăn của công thức món ăn."""
    url = f"https://api.spoonacular.com/recipes/{recipe_id}/analyzedInstructions"
    params = {
        'apiKey': SPOONACULAR_API_KEY
    }
    
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        # Trích xuất các bước hướng dẫn nấu ăn
        instructions = []
        if data:
            for instruction in data:
                steps = instruction.get('steps', [])
                for step in steps:
                    instructions.append({
                        'step_number': step.get('number'),
                        'instruction': step.get('step'),
                        'ingredients': [ingredient.get('name') for ingredient in step.get('ingredients', [])],
                        'equipment': [equip.get('name') for equip in step.get('equipment', [])]
                    })
        return {
            'recipe_id': recipe_id,
            'instructions': instructions
        }
    else:
        logger.error(f"Failed to fetch instructions for Recipe ID {recipe_id}: {response.text}")
        return {
            'recipe_id': recipe_id,
            'error': 'Can not fetch instructions'
        }
