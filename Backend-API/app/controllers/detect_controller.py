# app/controllers/detect_controller.py
import json, re, os, requests, random, json, logging
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from app.models.model import Config, CSVExportVersion, db

# Cấu hình logging để ghi lại các lỗi
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tải biến môi trường từ file .env
load_dotenv()

# Tải mô hình YOLOv8
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.getenv('YOLOV8_MODEL_PATH', 'yolov8-model/best.pt')
FULL_MODEL_PATH = os.path.join(BASE_DIR, MODEL_PATH)
model = YOLO(FULL_MODEL_PATH)

# CSV recommend system
# CSV_PATH = os.getenv('CSV_RECOMMEND_PATH', 'recommend-dataset/recipes.csv')
# Lấy đường dẫn CSV từ bảng Config
config = Config.query.filter_by(config_name='data_recommend_csv').first()

if not config:
    # Nếu config không tồn tại, lấy từ bảng CSVExportVersion và thiết lập config mới
    csv_export = CSVExportVersion.query.order_by(CSVExportVersion.created_at.desc()).first()
    if csv_export:
        CSV_PATH = "recommend-dataset/" + csv_export.filename
        # Thêm cấu hình mới vào bảng Config
        new_config = Config(config_name='data_recommend_csv', config_value=CSV_PATH)
        db.session.add(new_config)
        db.session.commit()
    else:
        CSV_PATH = "recommend-dataset/recipes.csv"
        new_config = Config(config_name='data_recommend_csv', config_value=CSV_PATH)
        db.session.add(new_config)
        db.session.commit()
else:
    CSV_PATH = config.config_value

FULL_CSV_PATH = os.path.join(BASE_DIR, CSV_PATH)

# Cấu hình API của Spoonacular
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY', '').split(',')
SPOONACULAR_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch'
SPOONACULAR_NUTRITION_URL = 'https://api.spoonacular.com/recipes/{id}/nutritionWidget.json'

# Kiểm tra nếu danh sách API_KEYS trống
if not SPOONACULAR_API_KEY or SPOONACULAR_API_KEY == ['']:
    raise ValueError("API keys are required. Please set the SPOONACULAR_API_KEY environment variable.")
limited_api_keys = set()

# Khởi tạo mô hình gợi ý riêng (nếu có)
# RECOMMENDER = RecipeRecommender('app/data/processed_recipes.csv')  # Nếu sử dụng mô hình gợi ý riêng

# Hỗ trợ các định dạng file hợp lệ
def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Đọc dữ liệu từ CSV với các trường mới
df = pd.read_csv(FULL_CSV_PATH)

# Chuyển đổi cột 'ingredients' từ chuỗi JSON sang danh sách các thành phần
df['ingredients'] = df['ingredients'].apply(lambda x: ' '.join([ingredient['name_ingredient'] for ingredient in json.loads(x.replace("'", '"'))]))

# Tạo cột văn bản tổng hợp từ 'name_recipe', 'summary' và 'ingredients'
df['text'] = df['name_recipe'] + " " + df['summary'].fillna('') + " " + df['ingredients']

# Tạo ma trận TF-IDF cho các cột văn bản
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['text'])

# Tính toán độ tương đồng cosine cho văn bản
cosine_sim_text = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Tạo Series chỉ số dựa vào 'id_recipe'
indices = pd.Series(df.index, index=df['id_recipe']).drop_duplicates()

# Hàm recommend dựa trên các nhãn từ khóa
def recommend_recipes_by_labels(labels, threshold=0.3):  # threshold: ngưỡng độ tương đồng
    recommendations = []
    for label in labels:
        keyword_tfidf = tfidf.transform([label])
        sim_scores = cosine_similarity(keyword_tfidf, tfidf_matrix).flatten()
        # Lọc các công thức có độ tương đồng lớn hơn ngưỡng
        filtered_indices = [i for i, score in enumerate(sim_scores) if score > threshold]
        # Lấy thông tin công thức tương ứng với các chỉ số đã lọc
        recommended_recipes = df.iloc[filtered_indices].to_dict(orient='records')
        recommendations.extend(recommended_recipes)
    
    return recommendations


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
            # Chạy YOLOv8 để phát hiện vật thể
            results = model.predict(source=filepath, save=False)
            detected_labels = set()

            # Lấy kết quả từ model
            for result in results:
                for cls in result.boxes.cls:
                    label = model.names[int(cls)]
                    clean_label = re.sub(r'^\d+\s+', '', label)
                    detected_labels.add(clean_label)

            detected_labels = list(detected_labels)
            os.remove(filepath)

            if not detected_labels:
                return jsonify({'msg': 'No objects detected'}), 200

            # Recommendations từ Spoonacular
            ingredients = ','.join(detected_labels)
            params = {
                'includeIngredients': ingredients,
                'number': 5,
                'ranking': 1,
                'addRecipeInformation': True
            }

            # Thử từng APIKey trong list
            for api_key in SPOONACULAR_API_KEY:
                # Trường hợp key tồn tại trong list limited thì sẽ không gọi đến.
                if api_key in limited_api_keys:
                    continue
                params['apiKey'] = api_key.strip()

                try:
                    response = requests.get(SPOONACULAR_SEARCH_URL, params=params)

                    if response.status_code == 200:
                        data = response.json()
                        recipes = data.get('results', [])

                        if not recipes:
                            return jsonify({'msg': 'No recipes found for detected ingredients'}), 200

                        recommendations = []
                        for recipe in recipes:
                            # Gọi hàm để lấy ra thông tin calories.
                            recipe_info = get_recipe_info(recipe.get('id'))
                            # Gọi hàm để lấy hướng dẫn chế biến
                            instructions_result = get_recipe_instructions(recipe.get('id'))
                            # Kết hợp data trả về
                            print(recipe)
                            combined_info = {
                                'id': recipe_info.get('id'),
                                'title': recipe.get('title'),
                                'image': recipe.get('image'),
                                'cookingMinutes': recipe.get('cookingMinutes'),
                                'summary': recipe.get('summary'),
                                'sourceUrl': recipe.get('sourceUrl'),
                                'calories': recipe_info.get('calories'),
                                'nutrients': recipe_info.get('nutrients'),
                                'ingredients': recipe_info.get('ingredients'),
                                'instructions': instructions_result.get('instructions', []),
                            }
                            recommendations.append(combined_info)

                        return jsonify({
                            'detected_objects': detected_labels,
                            'recommendations': recommendations
                        }), 200

                    elif response.status_code == 402:
                        # Thêm key vào list limited do giới hạn do key hết số lượt request theo ngày.
                        limited_api_keys.add(api_key)
                        logging.warning(f"API key {api_key} has reached the request limit. Trying the next API key.")
                    else:
                        logging.error(f"Unexpected error with API key {api_key}: {response.text}")
                
                except requests.RequestException as e:
                    logging.error(f"Request error with API key {api_key}: {str(e)}")

            # If all API keys fail
            return jsonify({'msg': 'All API keys have reached their limits or encountered an error'}), 500

        except Exception as e:
            logger.error(f"Error during processing: {str(e)}")
            return jsonify({'msg': 'An error occurred during processing', 'error': str(e)}), 500
    else:
        return jsonify({'msg': 'Unsupported file type'}), 400

def get_recipe_info(recipe_id):
    """Lấy thông tin dinh dưỡng của công thức món ăn bao gồm calo."""
    url = SPOONACULAR_NUTRITION_URL.format(id=recipe_id)
    params = {}

    # Thử từng APIKey trong list
    for api_key in SPOONACULAR_API_KEY:
        # Trường hợp key tồn tại trong list thì sẽ không gọi đến.
        if api_key in limited_api_keys:
            continue
        params['apiKey'] = api_key.strip()

        try:
            response = requests.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                calories = data.get('calories', 'N/A')
                nutrients = data.get('nutrients', [])
                ingredients = data.get('ingredients', [])
                return {
                    'id': recipe_id,
                    'calories': calories,
                    'nutrients': nutrients,
                    'ingredients': ingredients
                }
            elif response.status_code == 402:
                # Thêm key vào list limited do giới hạn do key hết số lượt request theo ngày.
                limited_api_keys.add(api_key)
                logging.warning(f"API key {api_key} has reached the request limit. Trying the next API key.")
            else:
                logging.error(f"Unexpected error with API key {api_key} for Recipe ID {recipe_id}: {response.text}")
        
        except requests.RequestException as e:
            logging.error(f"Request error with API key {api_key} for Recipe ID {recipe_id}: {str(e)}")

    # If all API keys fail
    return {
        'id': recipe_id,
        'error': 'Unable to fetch nutrition info after trying all API keys'
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
    params = {}

    for api_key in SPOONACULAR_API_KEY:
        # Trường hợp key có trong list limited thì sẽ không gọi đến.
        if api_key in limited_api_keys:
            continue
        params['apiKey'] = api_key.strip()

        try:
            response = requests.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
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
            elif response.status_code == 402:
                # Thêm key vào list limited do giới hạn do key hết số lượt request theo ngày.
                limited_api_keys.add(api_key)
                logging.warning(f"API key {api_key} has reached the request limit. Trying the next API key.")
            else:
                logging.error(f"Unexpected error with API key {api_key} for Recipe ID {recipe_id}: {response.text}")
        
        except requests.RequestException as e:
            logging.error(f"Request error with API key {api_key} for Recipe ID {recipe_id}: {str(e)}")
    return {
        'recipe_id': recipe_id,
        'error': 'Unable to fetch instructions after trying all API keys'
    }

from flask import jsonify
import random

# Function to generate a nutritious daily meal plan
def get_daily_meal_plan(target_calories=2000):
    try:
        # Lấy các công thức từ CSV
        recipes = df.to_dict(orient='records')

        # Chia các công thức theo loại món ăn
        breakfast_recipes = [recipe for recipe in recipes if 'breakfast' in recipe['type'].lower()]
        lunch_recipes = [recipe for recipe in recipes if 'lunch' in recipe['type'].lower()]
        dinner_recipes = [recipe for recipe in recipes if 'dinner' in recipe['type'].lower()]

        # Kiểm tra nếu có công thức sẵn có cho mỗi loại món ăn
        if not breakfast_recipes:
            raise ValueError("No breakfast recipes available.")
        if not lunch_recipes:
            raise ValueError("No lunch recipes available.")
        if not dinner_recipes:
            raise ValueError("No dinner recipes available.")

        # Chọn ngẫu nhiên công thức cho bữa sáng, trưa và tối
        breakfast = random.choice(breakfast_recipes)
        lunch = random.choice(lunch_recipes)
        dinner = random.choice(dinner_recipes)

        # Tính toán tổng lượng calories
        total_calories = (breakfast.get('calories', 0) +
                          lunch.get('calories', 0) +
                          dinner.get('calories', 0))

        # Nếu tổng calories không đủ, thêm bữa ăn nhẹ để đảm bảo đủ calories
        snacks = []
        while total_calories < target_calories:
            snack = random.choice(recipes)
            total_calories += snack.get('calories', 0)
            snacks.append({
                'recipe': snack['name_recipe'],
                'ingredients': snack['ingredients'],
                'calories': snack.get('calories', 'N/A'),
                'protein': snack.get('protein', 'N/A'),
                'carbohydrates': snack.get('carbohydrates', 'N/A'),
                'fat': snack.get('fat', 'N/A'),
                'sugar': snack.get('sugar', 'N/A')
            })

        # Tạo khẩu phần ăn cho 1 ngày
        daily_meal_plan = {
            'breakfast': {
                'recipe': breakfast['name_recipe'],
                'ingredients': breakfast['ingredients'],
                'calories': breakfast.get('calories', 'N/A'),
                'protein': breakfast.get('protein', 'N/A'),
                'carbohydrates': breakfast.get('carbohydrates', 'N/A'),
                'fat': breakfast.get('fat', 'N/A'),
                'sugar': breakfast.get('sugar', 'N/A')
            },
            'lunch': {
                'recipe': lunch['name_recipe'],
                'ingredients': lunch['ingredients'],
                'calories': lunch.get('calories', 'N/A'),
                'protein': lunch.get('protein', 'N/A'),
                'carbohydrates': lunch.get('carbohydrates', 'N/A'),
                'fat': lunch.get('fat', 'N/A'),
                'sugar': lunch.get('sugar', 'N/A')
            },
            'dinner': {
                'recipe': dinner['name_recipe'],
                'ingredients': dinner['ingredients'],
                'calories': dinner.get('calories', 'N/A'),
                'protein': dinner.get('protein', 'N/A'),
                'carbohydrates': dinner.get('carbohydrates', 'N/A'),
                'fat': dinner.get('fat', 'N/A'),
                'sugar': dinner.get('sugar', 'N/A')
            },
            'snacks': snacks
        }

        return jsonify({'daily_meal_plan': daily_meal_plan})

    except ValueError as ve:
        logger.error(f"Error in generating daily meal plan: {ve}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Error in generating daily meal plan: {e}")
        return jsonify({'error': 'Unable to generate daily meal plan'}), 500
