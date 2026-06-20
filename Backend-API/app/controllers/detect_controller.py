# app/controllers/detect_controller.py
import json, re, os, requests, random, json, logging
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import date as date_type, datetime
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import pandas as pd
from sqlalchemy.exc import SQLAlchemyError
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from inference_sdk import InferenceHTTPClient
from app.models.model import Config, CSVExportVersion, RecipeInfo, RecipesContribution, RecipeNutrition, RecipeIngredients, UserDailyNutritionGoal, UserDailyLog, DiaryEntry, RecipesFavourite, ScanLog, User, db
# Use specific import for modern SDK to avoid conflict with old one
try:
    from google import genai as modern_genai
except ImportError:
    modern_genai = None

global tfidf, tfidf_matrix, cosine_sim_text, indices, df
global CSV_PATH, FULL_CSV_PATH
# Cấu hình logging để ghi lại các lỗi
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tải biến môi trường từ file .env
load_dotenv()

# Tải mô hình YOLOv8
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.getenv('YOLOV8_MODEL_PATH', 'yolov8-model/model_121824.pt')
FULL_MODEL_PATH = os.path.join(BASE_DIR, MODEL_PATH)
print(FULL_MODEL_PATH)
model = YOLO(FULL_MODEL_PATH)
# Cấu hình API của Spoonacular
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY', '').split(',')
SPOONACULAR_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch'
SPOONACULAR_FIND_BY_INGREDIENTS_URL = 'https://api.spoonacular.com/recipes/findByIngredients'
SPOONACULAR_NUTRITION_URL = 'https://api.spoonacular.com/recipes/{id}/nutritionWidget.json'

# Cấu hình Roboflow (Scan Food)
ROBOFLOW_API_KEY            = os.getenv('ROBOFLOW_API_KEY', 'Wre9TGGWweRBqiO0MvIL')
ROBOFLOW_MODEL_ID           = os.getenv('ROBOFLOW_FOOD_MODEL_ID', 'food-yklgo/3')
ROBOFLOW_INGREDIENT_MODEL_ID= os.getenv('ROBOFLOW_INGREDIENT_MODEL_ID', 'ingredient-j9nuw/1')
ROBOFLOW_API_URL            = os.getenv('ROBOFLOW_API_URL', 'https://serverless.roboflow.com')
roboflow_client = InferenceHTTPClient(
    api_url=ROBOFLOW_API_URL,
    api_key=ROBOFLOW_API_KEY,
)

# Gemini API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
_gemini_client_new = None
if GEMINI_API_KEY and modern_genai:
    try:
        _gemini_client_new = modern_genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Modern Gemini genai.Client initialized.")
    except Exception as e:
        logger.error(f"Error initializing modern Gemini client: {e}")
else:
    logger.warning("GEMINI_API_KEY not found or modern_genai package not available.")
    logger.warning("GEMINI_API_KEY not found in environment variables.")

# ── Confidence threshold cho Roboflow predictions ─────────────────────────────
CONF_THRESHOLD = float(os.getenv('ROBOFLOW_CONF_THRESHOLD', '0.45'))

# ── Map tên class → tên chuẩn Spoonacular-friendly ───────────────────────────
LABEL_MAP = {
    # General food normalization
    'spring_roll':      'spring roll',
    'fried_rice':       'fried rice',
    'banh_mi':          'vietnamese sandwich',
    'pho':              'pho noodle soup',
    'bun_bo_hue':       'spicy beef noodle soup',
    'com_tam':          'broken rice',
    'banh_xeo':         'vietnamese crepe',
    'hu_tieu':          'clear noodle soup',
    'bun_rieu':         'crab noodle soup',
    'banh_cuon':        'steamed rice rolls',
    'hot_pot':          'hot pot',
    'dim_sum':          'dim sum',
    'fried_chicken':    'fried chicken',
    'grilled_chicken':  'grilled chicken',
    'stir_fry':         'stir fry',
    'pad_thai':         'pad thai',
    'ramen':            'ramen noodles',
    'sushi':            'sushi',
    'pizza':            'pizza',
    'hamburger':        'hamburger',
    'sandwich':         'sandwich',
    'salad':            'salad',
    'soup':             'soup',
    'pasta':            'pasta',
    'steak':            'steak',
    'fish':             'fish',
    'shrimp':           'shrimp',
    'crab':             'crab',
    'chicken':          'chicken',
    'pork':             'pork',
    'beef':             'beef',
    'tofu':             'tofu',
    'egg':              'egg',
    'rice':             'rice',
    'noodle':           'noodles',
    'bread':            'bread',
    'cake':             'cake',
    'ice_cream':        'ice cream',
    'fruit_salad':      'fruit salad',
    'french_fries':     'french fries',
}

def normalize_label(label: str) -> str:
    """Normalize a detection label to a Spoonacular-friendly name."""
    key = label.lower().replace(' ', '_').replace('-', '_')
    return LABEL_MAP.get(key, label.replace('_', ' ').replace('-', ' '))


# CSV recommend system
def update_csv_path():   
    global tfidf, tfidf_matrix, cosine_sim_text, indices, df
    global CSV_PATH, FULL_CSV_PATH
    # Ưu tiên kiếm tra từ bảng Config trước
    config = Config.query.filter_by(config_name='data_recommend_csv').first()
    
    if config:
        CSV_PATH = config.config_value
    else:
        # Nếu không có config, kiểm tra bảng CSVExportVersion
        csv_export = CSVExportVersion.query.order_by(CSVExportVersion.created_at.desc()).first()
        
        if csv_export:
            CSV_PATH = "recommend-dataset/" + csv_export.filename
            
            # Tạo config mới nếu chưa tồn tại
            new_config = Config(config_name='data_recommend_csv', config_value=CSV_PATH)
            db.session.add(new_config)
            db.session.commit()
        else:
            # Fallback về giá trị mặc định
            CSV_PATH = "recommend-dataset/recipes.csv"
            new_config = Config(config_name='data_recommend_csv', config_value=CSV_PATH)
            db.session.add(new_config)
            db.session.commit()
    
    # Cập nhật đường dẫn đầy đủ
    FULL_CSV_PATH = os.path.join(BASE_DIR, CSV_PATH)
    
    # Nạp lại DataFrame và tái tạo ma trận TF-IDF
    df = pd.read_csv(FULL_CSV_PATH)
    df['ingredients'] = df['ingredients'].apply(lambda x: ' '.join([ingredient['name_ingredient'] for ingredient in json.loads(x.replace("'", '"'))]))
    df['text'] = df['name_recipe'] + " " + df['summary'].fillna('') + " " + df['ingredients']
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['text'])
    cosine_sim_text = cosine_similarity(tfidf_matrix, tfidf_matrix)
    indices = pd.Series(df.index, index=df['id_recipe']).drop_duplicates()
    
    return CSV_PATH

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

def log_scan_event(user_id, food_name, confidence, image_path, status):
    """
    Lưu dự đoán của AI vào bảng scan_logs và di chuyển ảnh sang thư mục lâu dài.
    """
    try:
        # Tạo thư mục scan-logs nếu chưa có
        log_folder = os.path.join(os.getcwd(), 'uploads', 'scan-logs')
        os.makedirs(log_folder, exist_ok=True)

        if image_path and os.path.exists(image_path):
            filename = os.path.basename(image_path)
            new_path = os.path.join(log_folder, filename)
            # Di chuyển ảnh thay vì xóa
            import shutil
            shutil.copy2(image_path, new_path)
            # Lưu đường dẫn tương đối để dễ hiển thị ở frontend (getFile sẽ tự prepend uploads/)
            relative_image_url = f"scan-logs/{filename}"
        else:
            relative_image_url = None

        new_log = ScanLog(
            id_user=user_id,
            food_name=food_name,
            confidence=float(confidence * 100) if confidence else 0,
            image_url=relative_image_url,
            status=status
        )
        db.session.add(new_log)
        db.session.commit()
        logger.info(f"Scan log created for user {user_id}: {food_name} ({status})")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error logging scan event: {str(e)}")

# Hàm recommend dựa trên các nhãn từ khóa
def recommend_recipes_by_labels(labels, threshold=0.3):  # threshold: ngưỡng độ tương đồng
    global tfidf, tfidf_matrix, df
    csv = update_csv_path()
    print(f"CSV path updated to: {csv}")
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

def detect_objects():
    """Phát hiện nguyên liệu qua Roboflow (thay thế YOLOv8 local)."""
    if 'image' not in request.files:
        logger.warning('No image part in the request')
        return jsonify({'msg': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        logger.warning('No selected file')
        return jsonify({'msg': 'No selected file'}), 400

    if not allowed_file(file.filename):
        logger.warning(f'Unsupported file type: {file.filename}')
        return jsonify({'msg': 'Unsupported file type'}), 400

    upload_folder = os.path.join(os.getcwd(), 'uploads', 'detect-images')
    os.makedirs(upload_folder, exist_ok=True)
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1

        # Kiểm tra kích thước file
        file_size = os.path.getsize(filepath)
        if file_size > 10 * 1024 * 1024:
            return jsonify({'msg': 'File is too large'}), 400

        # ── Gọi Roboflow Ingredient Detection ────────────────────────────────
        result = roboflow_client.infer(filepath, model_id=ROBOFLOW_INGREDIENT_MODEL_ID)
        predictions = result.get('predictions', [])
        logger.info(f"Roboflow raw: {[(p['class'], round(p.get('confidence',0),3)) for p in predictions]}")

        # Lọc confidence threshold
        filtered = [p for p in predictions if p.get('confidence', 0) >= CONF_THRESHOLD]

        # Normalize & deduplicate (ưu tiên confidence cao nhất)
        seen: dict = {}
        for p in sorted(filtered, key=lambda x: x.get('confidence', 0), reverse=True):
            norm = normalize_label(p['class'])
            if norm not in seen:
                seen[norm] = p.get('confidence', 0)

        detected_labels    = list(seen.keys())
        detected_with_conf = [{'class': k, 'confidence': round(v, 4)} for k, v in seen.items()]

        best_p = max(filtered, key=lambda x: x.get('confidence', 0)) if filtered else (
                 max(predictions, key=lambda x: x.get('confidence', 0)) if predictions else None)

        if not detected_labels:
            low_hints = [
                {'class': normalize_label(p['class']), 'confidence': round(p.get('confidence', 0), 4)}
                for p in sorted(predictions, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
            ] if predictions else []
            log_scan_event(current_user_id, "Unknown", 0, filepath, 0)
            return jsonify({
                'msg': 'No ingredients detected with sufficient confidence',
                'conf_threshold': CONF_THRESHOLD,
                'low_confidence_hints': low_hints,
            }), 200

        best_label = best_p['class'] if best_p else 'Unknown'
        best_conf  = best_p.get('confidence', 0) if best_p else 0
        log_scan_event(current_user_id, best_label, best_conf, filepath, 1)

        return jsonify({
            'detected_objects':         detected_labels,
            'detected_with_confidence': detected_with_conf,
            'conf_threshold':           CONF_THRESHOLD,
        }), 200

    except Exception as e:
        logger.error(f"detect_objects error: {str(e)}")
        return jsonify({'msg': 'An error occurred during detection', 'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

def recommend_recipes_spoonacular():
    try:
        detected_labels = request.json.get('detected_objects', [])
        logger.info(f"Recommending recipes for labels: {detected_labels}")
        if not detected_labels:
            return jsonify({'msg': 'No detected objects provided'}), 400

        # Combine all ingredients into a comma-separated string for combined search
        ingredients = ','.join(detected_labels)
        params = {
            'ingredients': ingredients,
            'number': 10,
            'ranking': 1,
            'ignorePantry': True
        }

        recommendations = []
        for api_key in SPOONACULAR_API_KEY:
            if api_key in limited_api_keys:
                continue
            params['apiKey'] = api_key.strip()
            logger.info(f"Searching for combined ingredients using Spoonacular API key: {api_key.strip()[:5]}...")

            try:
                response = requests.get(SPOONACULAR_FIND_BY_INGREDIENTS_URL, params=params)
                logger.info(f"Spoonacular response status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    # data is a list in findByIngredients
                    recipes_list = data if isinstance(data, list) else []
                    
                    for recipe in recipes_list:
                        recipe_id = recipe.get('id')
                        if recipe_id:
                            # Fetch additional details for each recipe
                            recipe_info = get_recipe_info(recipe_id)
                            instructions_result = get_recipe_instructions(recipe_id)

                            combined_info = {
                                'id': recipe_id,
                                'title': recipe.get('title'),
                                'image': recipe.get('image'),
                                'cookingMinutes': recipe_info.get('cookingMinutes', 0), # Added fallback
                                'summary': recipe_info.get('summary', ''),
                                'sourceUrl': recipe_info.get('sourceUrl', ''),
                                'calories': recipe_info.get('calories'),
                                'nutrients': recipe_info.get('nutrients'),
                                'ingredients': recipe_info.get('ingredients'),
                                'instructions': instructions_result.get('instructions', []),
                                'usedIngredientCount': recipe.get('usedIngredientCount'),
                                'missedIngredientCount': recipe.get('missedIngredientCount')
                            }
                            recommendations.append(combined_info)
                    
                    # Break API key loop if success
                    break

                elif response.status_code == 402:
                    limited_api_keys.add(api_key)
                    logger.warning(f"API key {api_key} has reached the request limit.")
                else:
                    logger.error(f"Unexpected error with API key {api_key}: {response.status_code} - {response.text}")

            except requests.RequestException as e:
                logger.error(f"Request error with API key {api_key}: {str(e)}")

        if not recommendations:
            return jsonify({'msg': 'No recipes found for combined ingredients'}), 200

        return jsonify({'recommendations': recommendations}), 200

    except Exception as e:
        logger.error(f"Unhandled error in recommend_recipes_spoonacular: {str(e)}")
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500


@jwt_required()
def detect_recommend_spoonacular():
    """Phát hiện nguyên liệu qua Roboflow rồi gợi ý công thức qua Spoonacular."""
    if 'image' not in request.files:
        return jsonify({'msg': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'msg': 'Unsupported file type'}), 400

    upload_folder = os.path.join(os.getcwd(), 'uploads', 'detect-images')
    os.makedirs(upload_folder, exist_ok=True)
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1

        # ── 1. Gọi Roboflow Ingredient Detection ─────────────────────────────
        result = roboflow_client.infer(filepath, model_id=ROBOFLOW_INGREDIENT_MODEL_ID)
        predictions = result.get('predictions', [])
        logger.info(f"Roboflow raw: {[(p['class'], round(p.get('confidence',0),3)) for p in predictions]}")

        filtered = [p for p in predictions if p.get('confidence', 0) >= CONF_THRESHOLD]

        seen: dict = {}
        for p in sorted(filtered, key=lambda x: x.get('confidence', 0), reverse=True):
            norm = normalize_label(p['class'])
            if norm not in seen:
                seen[norm] = p.get('confidence', 0)

        detected_labels    = list(seen.keys())
        detected_with_conf = [{'class': k, 'confidence': round(v, 4)} for k, v in seen.items()]

        best_p = max(filtered, key=lambda x: x.get('confidence', 0)) if filtered else (
                 max(predictions, key=lambda x: x.get('confidence', 0)) if predictions else None)

        if not detected_labels:
            log_scan_event(current_user_id, "Unknown", 0, filepath, 0)
            return jsonify({
                'msg': 'No ingredients detected with sufficient confidence',
                'conf_threshold': CONF_THRESHOLD,
            }), 200

        # ── 2. Gọi Spoonacular complexSearch ─────────────────────────────────
        primary_query = detected_labels[0]
        include_ingr  = ','.join(detected_labels)
        params = {
            'query':              primary_query,
            'includeIngredients': include_ingr,
            'number':             10,
            'ranking':            2,
            'addRecipeInformation': True,
        }

        for api_key in SPOONACULAR_API_KEY:
            if api_key in limited_api_keys:
                continue
            params['apiKey'] = api_key.strip()

            try:
                response = requests.get(SPOONACULAR_SEARCH_URL, params=params)

                if response.status_code == 200:
                    data    = response.json()
                    recipes = data.get('results', [])

                    # Fallback: thử lại chỉ với query nếu không có kết quả
                    if not recipes and len(detected_labels) > 1:
                        fb = requests.get(SPOONACULAR_SEARCH_URL, params={
                            'query': primary_query, 'number': 10,
                            'addRecipeInformation': True, 'apiKey': api_key.strip()
                        })
                        if fb.status_code == 200:
                            recipes = fb.json().get('results', [])

                    if not recipes:
                        best_label = best_p['class'] if best_p else 'Unknown'
                        log_scan_event(current_user_id, best_label,
                                       best_p.get('confidence', 0) if best_p else 0, filepath, 2)
                        return jsonify({'msg': 'No recipes found for detected ingredients',
                                        'detected_objects': detected_with_conf}), 200

                    best_label = best_p['class'] if best_p else 'Unknown'
                    log_scan_event(current_user_id, best_label,
                                   best_p.get('confidence', 0) if best_p else 0, filepath, 1)

                    recommendations = []
                    for recipe in recipes:
                        recipe_info  = get_recipe_info(recipe.get('id'))
                        instructions = get_recipe_instructions(recipe.get('id'))
                        recommendations.append({
                            'id':             recipe_info.get('id'),
                            'title':          recipe.get('title'),
                            'image':          recipe.get('image'),
                            'cookingMinutes': recipe.get('cookingMinutes'),
                            'summary':        recipe.get('summary'),
                            'sourceUrl':      recipe.get('sourceUrl'),
                            'calories':       recipe_info.get('calories'),
                            'nutrients':      recipe_info.get('nutrients'),
                            'ingredients':    recipe_info.get('ingredients'),
                            'instructions':   instructions.get('instructions', []),
                        })

                    return jsonify({
                        'detected_objects':         list({p['class'] for p in filtered}),
                        'detected_with_confidence': detected_with_conf,
                        'conf_threshold':           CONF_THRESHOLD,
                        'recommendations':          recommendations,
                    }), 200

                elif response.status_code == 402:
                    limited_api_keys.add(api_key)
                    logging.warning(f"API key {api_key} reached limit.")
                else:
                    logging.error(f"Spoonacular error: {response.text}")

            except requests.RequestException as e:
                logging.error(f"Request error with API key {api_key}: {str(e)}")

        return jsonify({'msg': 'All API keys have reached their limits or encountered an error'}), 500

    except Exception as e:
        logger.error(f"detect_recommend_spoonacular error: {str(e)}")
        return jsonify({'msg': 'An error occurred during processing', 'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

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
@jwt_required()
def get_daily_meal_plan(default_calories=2000):
    try:
         # Lấy lượng calo mục tiêu của người dùng, trường hợp người dùng chưa có calories target tại db thì sẽ lấy calories default
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1
        user_goal = db.session.query(UserDailyNutritionGoal).filter(UserDailyNutritionGoal.id_user == current_user_id).first()
        target_calories = user_goal.calories_goal if user_goal and user_goal.calories_goal is not None else default_calories
        # Lấy các công thức đã được duyệt từ cơ sở dữ liệu
        recipes = db.session.query(RecipeInfo).join(
            RecipesContribution, 
            RecipeInfo.id_recipe == RecipesContribution.id_recipe
        ).filter(RecipesContribution.accept_contribution == 1).all()
        
        if not recipes:
            raise ValueError("No approved recipes available in the database.")

        # Chuyển đổi các công thức thành danh sách từ điển, bỏ qua các thuộc tính nội bộ của SQLAlchemy
        recipes = [{col: getattr(recipe, col) for col in recipe.__table__.columns.keys()} for recipe in recipes]

        # Lọc các công thức theo loại bữa ăn
        breakfast_recipes = [recipe for recipe in recipes if 'breakfast' in recipe['type'].lower()]
        lunch_recipes = [recipe for recipe in recipes if 'lunch' in recipe['type'].lower()]
        dinner_recipes = [recipe for recipe in recipes if 'dinner' in recipe['type'].lower()]

        # Kiểm tra tính sẵn có của mỗi loại bữa ăn
        if not breakfast_recipes:
            raise ValueError("No breakfast recipes available.")
        if not lunch_recipes:
            raise ValueError("No lunch recipes available.")
        if not dinner_recipes:
            raise ValueError("No dinner recipes available.")

        # Hàm lấy thông tin dinh dưỡng từ bảng RecipeNutrition
        def get_nutrition_info(recipe_id):
            nutrition = db.session.query(RecipeNutrition).filter(RecipeNutrition.id_recipe == recipe_id).first()
            if not nutrition:
                return {
                    'calories': 0,
                    'protein': 0,
                    'carbohydrates': 0,
                    'fat': 0,
                    'sugar': 0
                }
            return {
                'calories': nutrition.calories or 0,
                'protein': nutrition.protein or 0,
                'carbohydrates': nutrition.carbohydrates or 0,
                'fat': nutrition.fat or 0,
                'sugar': nutrition.sugar or 0
            }

        # Hàm kiểm tra tổng lượng calo
        def calculate_total_calories(meals):
            return sum(meal['calories'] for meal in meals)

        # Biến để theo dõi kế hoạch bữa ăn gần nhất với target_calories
        best_meal_plan = None
        smallest_calorie_diff = float('inf')

        # Giới hạn số lần lặp để tránh vòng lặp vô hạn
        max_iterations = 200
        iterations = 0

        while iterations < max_iterations:
            # Chọn ngẫu nhiên công thức cho các bữa ăn
            breakfast = random.choice(breakfast_recipes)
            lunch = random.choice(lunch_recipes)
            dinner = random.choice(dinner_recipes)

            # Lấy thông tin dinh dưỡng cho từng bữa ăn
            breakfast_nutrition = get_nutrition_info(breakfast['id_recipe'])
            lunch_nutrition = get_nutrition_info(lunch['id_recipe'])
            dinner_nutrition = get_nutrition_info(dinner['id_recipe'])

            # Kiểm tra tổng lượng calo
            total_calories = calculate_total_calories([breakfast_nutrition, lunch_nutrition, dinner_nutrition])
            
            # Tính hiệu số với target_calories
            calorie_diff = abs(total_calories - target_calories)

            # Cập nhật kế hoạch bữa ăn gần nhất
            if calorie_diff < smallest_calorie_diff:
                smallest_calorie_diff = calorie_diff
                best_meal_plan = {
                    'breakfast': {
                        'recipe_id': breakfast['id_recipe'],
                        'recipe_name': breakfast['name_recipe'],
                        'image': breakfast['image'],
                        'ingredients': [],
                        **breakfast_nutrition
                    },
                    'lunch': {
                        'recipe_id': lunch['id_recipe'],
                        'recipe_name': lunch['name_recipe'],
                        'image': lunch['image'],
                        'ingredients': [],
                        **lunch_nutrition
                    },
                    'dinner': {
                        'recipe_id': dinner['id_recipe'],
                        'recipe_name': dinner['name_recipe'],
                        'image': dinner['image'],
                        'ingredients': [],
                        **dinner_nutrition
                    },
                    'total_calories': total_calories
                }

            iterations += 1

        if best_meal_plan is None:
            raise ValueError("Could not generate a meal plan")

        return jsonify({
            'daily_meal_plan': best_meal_plan,
            'target_calories': target_calories,
            'actual_calories': best_meal_plan['total_calories'],
            'calorie_difference': abs(best_meal_plan['total_calories'] - target_calories)
        })

    except ValueError as ve:
        logger.error(f"Error in generating daily meal plan: {ve}")
        return jsonify({'error': str(ve)}), 400
    except SQLAlchemyError as e:
        logger.error(f"Database error when fetching recipes: {e}")
        return jsonify({'error': 'Unable to fetch recipes from the database'}), 500
    except Exception as e:
        logger.error(f"Error in generating daily meal plan: {e}")
        return jsonify({'error': 'Unable to generate daily meal plan'}), 500


# ──────────────────────────────────────────────────────────────────────────────
# SCAN FOOD — Roboflow Pipeline
# ──────────────────────────────────────────────────────────────────────────────

@jwt_required()
def detect_food_roboflow():
    """Phát hiện món ăn qua Roboflow rồi gọi Spoonacular để đề xuất công thức."""
    if 'image' not in request.files:
        return jsonify({'msg': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'msg': 'Unsupported file type'}), 400

    upload_folder = os.path.join(os.getcwd(), 'uploads', 'detect-images')
    os.makedirs(upload_folder, exist_ok=True)
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1
        
        # ── 1. Gọi Roboflow để phát hiện nguyên liệu (ingredients model) ────────
        result = roboflow_client.infer(filepath, model_id=ROBOFLOW_INGREDIENT_MODEL_ID)
        predictions = result.get('predictions', [])
        logger.info(f"Roboflow raw predictions: {[(p['class'], round(p.get('confidence',0),3)) for p in predictions]}")

        # A) Lọc theo confidence threshold
        filtered_predictions = [p for p in predictions if p.get('confidence', 0) >= CONF_THRESHOLD]
        logger.info(f"After confidence filter (>={CONF_THRESHOLD}): {[(p['class'], round(p['confidence'],3)) for p in filtered_predictions]}")

        # B) Normalize labels và deduplicate
        seen_normalized = {}
        for p in sorted(filtered_predictions, key=lambda x: x.get('confidence', 0), reverse=True):
            normalized = normalize_label(p['class'])
            if normalized not in seen_normalized:
                seen_normalized[normalized] = p.get('confidence', 0)

        detected_labels    = list(seen_normalized.keys())       # tên đã normalize
        detected_raw       = list({p['class'] for p in filtered_predictions})  # tên gốc
        detected_with_conf = [{'class': k, 'confidence': round(v, 4)} for k, v in seen_normalized.items()]
        logger.info(f"Normalized labels: {detected_labels}")

        # Lấy prediction có confidence cao nhất để log
        best_p = None
        if filtered_predictions:
            best_p = max(filtered_predictions, key=lambda x: x.get('confidence', 0))
        elif predictions:  # fallback nếu tất cả bị filter
            best_p = max(predictions, key=lambda x: x.get('confidence', 0))

        if not detected_labels:
            # Trả thêm low-confidence hints nếu có
            low_conf_hints = []
            if predictions:
                low_conf_hints = [
                    {'class': normalize_label(p['class']), 'confidence': round(p.get('confidence', 0), 4)}
                    for p in sorted(predictions, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
                ]
            log_scan_event(current_user_id, "Unknown", 0, filepath, 0)
            return jsonify({
                'msg': 'No food detected with sufficient confidence',
                'conf_threshold': CONF_THRESHOLD,
                'low_confidence_hints': low_conf_hints,
            }), 200

        # ── 2. Gọi Spoonacular complexSearch ─────────────────────────────────
        # B) Dùng cả query (tên món chính) + includeIngredients (tất cả labels)
        #    ranking=2: tối đa hóa số ingredients được dùng
        primary_query     = detected_labels[0]               # label confidence cao nhất
        include_ingr      = ','.join(detected_labels)         # tất cả labels
        params = {
            'query':              primary_query,
            'includeIngredients': include_ingr,
            'number':             10,
            'ranking':            2,              # maximize ingredient usage
            'addRecipeInformation': True,
            'addRecipeNutrition': False,
        }

        for api_key in SPOONACULAR_API_KEY:
            if api_key in limited_api_keys:
                continue
            params['apiKey'] = api_key.strip()

            try:
                response = requests.get(SPOONACULAR_SEARCH_URL, params=params)

                if response.status_code == 200:
                    data = response.json()
                    recipes = data.get('results', [])

                    # Fallback: nếu không có kết quả, thử tìm rộng hơn chỉ với query
                    if not recipes and len(detected_labels) > 1:
                        logger.info("No results with combined search, retrying with query only...")
                        fallback_params = {
                            'query':              primary_query,
                            'number':             10,
                            'addRecipeInformation': True,
                            'apiKey':             api_key.strip(),
                        }
                        fb_response = requests.get(SPOONACULAR_SEARCH_URL, params=fallback_params)
                        if fb_response.status_code == 200:
                            recipes = fb_response.json().get('results', [])

                    if not recipes:
                        log_scan_event(
                            current_user_id,
                            best_p['class'] if best_p else "Unknown",
                            best_p['confidence'] if best_p else 0,
                            filepath,
                            2
                        )
                        return jsonify({
                            'msg': 'No recipes found for detected food',
                            'detected_objects': detected_with_conf,
                        }), 200

                    # Log Success (1)
                    log_scan_event(
                        current_user_id,
                        best_p['class'] if best_p else "Unknown",
                        best_p['confidence'] if best_p else 0,
                        filepath,
                        1
                    )

                    recommendations = []
                    for recipe in recipes:
                        recipe_info  = get_recipe_info(recipe.get('id'))
                        instructions = get_recipe_instructions(recipe.get('id'))
                        combined = {
                            'id':             recipe_info.get('id'),
                            'title':          recipe.get('title'),
                            'image':          recipe.get('image'),
                            'cookingMinutes': recipe.get('cookingMinutes'),
                            'summary':        recipe.get('summary'),
                            'sourceUrl':      recipe.get('sourceUrl'),
                            'calories':       recipe_info.get('calories'),
                            'nutrients':      recipe_info.get('nutrients'),
                            'ingredients':    recipe_info.get('ingredients'),
                            'instructions':   instructions.get('instructions', []),
                        }
                        recommendations.append(combined)

                    # C) Trả về confidence info trong response
                    return jsonify({
                        'detected_objects':  detected_raw,
                        'detected_with_confidence': detected_with_conf,
                        'conf_threshold':    CONF_THRESHOLD,
                        'recommendations':   recommendations,
                    }), 200

                elif response.status_code == 402:
                    limited_api_keys.add(api_key)
                    logging.warning(f"API key {api_key} reached limit.")
                else:
                    logging.error(f"Spoonacular error: {response.text}")

            except requests.RequestException as e:
                logging.error(f"Request error with key {api_key}: {e}")

        return jsonify({'msg': 'All Spoonacular API keys reached their limits'}), 500

    except Exception as e:
        logger.error(f"detect_food_roboflow error: {e}")
        return jsonify({'msg': 'An error occurred', 'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@jwt_required()
def save_scanned_recipe():
    """Lưu công thức đã quét vào DiaryEntry và cập nhật UserDailyLog."""
    user_id = get_jwt_identity()
    data = request.json
    if not data or not data.get('title'):
        return jsonify({'msg': 'title is required'}), 400

    try:
        entry_date_str = data.get('entry_date')
        entry_date = date_type.fromisoformat(entry_date_str) if entry_date_str else date_type.today()

        # 1. Tạo DiaryEntry
        entry = DiaryEntry(
            id_user    = user_id,
            entry_date = entry_date,
            meal_type  = data.get('meal_type', 'lunch'),
            meal_name  = data['title'],
            calories   = float(data.get('calories') or 0),
            protein_g  = float(data.get('protein') or 0),
            carbs_g    = float(data.get('carbs') or 0),
            fat_g      = float(data.get('fat') or 0),
            image      = data.get('image'),
        )
        db.session.add(entry)

        # 2. Upsert UserDailyLog
        log = UserDailyLog.query.filter_by(id_user=user_id, log_date=entry_date).first()
        if log:
            log.calories_intake += entry.calories
            log.protein_intake  += entry.protein_g
            log.carb_intake     += entry.carbs_g
            log.fat_intake      += entry.fat_g
        else:
            log = UserDailyLog(
                id_user         = user_id,
                log_date        = entry_date,
                calories_intake = entry.calories,
                protein_intake  = entry.protein_g,
                carb_intake     = entry.carbs_g,
                fat_intake      = entry.fat_g,
            )
            db.session.add(log)

        db.session.commit()
        return jsonify({'msg': 'Recipe saved to diary'}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"save_scanned_recipe error: {e}")
        return jsonify({'msg': 'Failed to save recipe', 'error': str(e)}), 500


@jwt_required()
def toggle_spoonacular_favourite():
    """Toggle favourite cho recipe từ Spoonacular (thêm nếu chưa có, xóa nếu đã có).
    Ảnh Spoonacular sẽ được download về server local để tránh broken link.
    """
    user_id = get_jwt_identity()
    data = request.json
    if not data or not data.get('spoonacular_id'):
        return jsonify({'msg': 'spoonacular_id is required'}), 400

    spoonacular_id = int(data['spoonacular_id'])

    try:
        existing = RecipesFavourite.query.filter_by(
            id_user=user_id,
            spoonacular_id=spoonacular_id
        ).first()

        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'msg': 'Removed from favourites', 'is_favourite': False}), 200

        # Download ảnh về local
        remote_image = data.get('image')
        local_image = _download_image_local(remote_image)

        fav = RecipesFavourite(
            id_user        = user_id,
            spoonacular_id = spoonacular_id,
            recipe_title   = data.get('title'),
            recipe_image   = local_image,
        )
        db.session.add(fav)
        db.session.commit()
        return jsonify({'msg': 'Added to favourites', 'is_favourite': True}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"toggle_spoonacular_favourite error: {e}")
        return jsonify({'msg': 'Failed to update favourite', 'error': str(e)}), 500


def _download_image_local(image_url, subfolder='favourites'):
    """Download ảnh từ URL về thư mục uploads/favourites/. 
    Trả về path local, hoặc url gốc nếu download thất bại.
    """
    if not image_url:
        return None
    try:
        resp = requests.get(image_url, timeout=10)
        if resp.status_code != 200:
            return image_url  # fallback
        ext = image_url.split('.')[-1].split('?')[0] or 'jpg'
        ext = ext[:4]  # tránh ext quá dài
        filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
        folder = os.path.join(os.getcwd(), 'uploads', subfolder)
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, filename), 'wb') as f:
            f.write(resp.content)
        return f"uploads/{subfolder}/{filename}"
    except Exception as e:
        logger.warning(f"_download_image_local failed: {e}, using original URL")
        return image_url  # fallback về URL gốc


@jwt_required()
def get_all_favourites():
    """Lấy tất cả favourite của user (gộp công thức nội bộ + Spoonacular)."""
    try:
        user_id = get_jwt_identity()
        favs = RecipesFavourite.query\
            .filter_by(id_user=user_id)\
            .order_by(RecipesFavourite.saved_at.desc())\
            .all()

        result = []
        for fav in favs:
            if fav.spoonacular_id:
                result.append({
                    'source':         'spoonacular',
                    'spoonacular_id': fav.spoonacular_id,
                    'title':          fav.recipe_title,
                    'image':          fav.recipe_image,
                    'calories':       None,  # không lưu calories khi favourite Spoonacular
                    'saved_at':       fav.saved_at.isoformat() if fav.saved_at else None,
                })
            elif fav.id_recipe:
                from app.models.model import RecipeInfo, RecipeNutrition
                recipe = RecipeInfo.query.get(fav.id_recipe)
                nutrition = RecipeNutrition.query.filter_by(id_recipe=fav.id_recipe).first()
                if recipe:
                    result.append({
                        'source':    'internal',
                        'id_recipe': recipe.id_recipe,
                        'title':     recipe.name_recipe,
                        'image':     recipe.image,
                        'type':      recipe.type,
                        'calories':  nutrition.calories if nutrition else None,
                        'saved_at':  fav.saved_at.isoformat() if fav.saved_at else None,
                    })

        return jsonify({'favourites': result, 'total': len(result)}), 200

    except Exception as e:
        logger.error(f"get_all_favourites error: {e}")
        return jsonify({'msg': 'Failed to fetch favourites', 'error': str(e)}), 500

def get_spoonacular_recommendations_v2():
    """
    Lấy danh sách gợi ý từ Spoonacular có phân trang (pagination).
    Dùng complexSearch với sort=popularity.
    """
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    offset = (page - 1) * limit

    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        'sort': 'popularity',
        'number': limit,
        'offset': offset,
        'addRecipeNutrition': 'true'
    }

    last_error = None
    for api_key in SPOONACULAR_API_KEY:
        if api_key in limited_api_keys:
            continue
        
        params['apiKey'] = api_key.strip()
        try:
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                total_results = data.get('totalResults', 0)
                
                recommendations = []
                for item in results:
                    # Lấy calories từ nutrition if present
                    nutrition = item.get('nutrition', {})
                    nutrients = nutrition.get('nutrients', [])
                    calories = next((n['amount'] for n in nutrients if n['name'] == 'Calories'), 0)
                    
                    recommendations.append({
                        'source': 'spoonacular',
                        'id': item.get('id'), # Changed from id_recipe to prevent 404 on local detail fetch
                        'name_recipe': item.get('title'),
                        'image': item.get('image'),
                        'calories': calories,
                        'avg_rating': round(random.uniform(4.0, 5.0), 1) 
                    })
                
                return jsonify({
                    'recommendations': recommendations,
                    'total': total_results,
                    'page': page,
                    'limit': limit,
                    'total_pages': (total_results + limit - 1) // limit,
                    'has_more': (offset + limit) < total_results
                }), 200
                
            elif response.status_code == 402:
                limited_api_keys.add(api_key)
                continue
            else:
                last_error = response.text
                
        except Exception as e:
            last_error = str(e)
            continue
            
    return jsonify({'msg': 'Failed to fetch recommendations', 'error': last_error}), 500

@jwt_required()
def get_scan_logs():
    """Lấy danh sách scan logs cho admin dashboard."""
    user_id = get_jwt_identity()
    # Robust check for identity type
    if isinstance(user_id, str) and not str(user_id).isdigit():
        user = User.query.filter_by(username=user_id).first()
    else:
        user = User.query.get(user_id)

    if not user or user.username != 'admin':
        return jsonify({'msg': 'Permission denied'}), 403

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '')
    status_filter = request.args.get('status', 'all')

    query = db.session.query(ScanLog).join(User, ScanLog.id_user == User.id_user)

    if search:
        query = query.filter(
            (ScanLog.food_name.ilike(f'%{search}%')) |
            (User.username.ilike(f'%{search}%'))
        )

    if status_filter != 'all':
        try:
            status_int = int(status_filter)
            query = query.filter(ScanLog.status == status_int)
        except ValueError:
            pass

    pagination = query.order_by(ScanLog.created_at.desc()).paginate(page=page, per_page=limit)

    logs = []
    for log in pagination.items:
        logs.append({
            'id': log.id,
            'food_name': log.food_name,
            'user': log.user.username if log.user else "Unknown",
            'accuracy': log.confidence,
            'image': log.image_url,
            'status': log.status,
            'time': log.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({
        'logs': logs,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@jwt_required()
def get_scan_stats():
    """Lấy thống kê scan logs cho admin dashboard."""
    user_id = get_jwt_identity()
    # Robust check for identity type
    if isinstance(user_id, str) and not str(user_id).isdigit():
        user = User.query.filter_by(username=user_id).first()
    else:
        user = User.query.get(user_id)

    if not user or user.username != 'admin':
        return jsonify({'msg': 'Permission denied'}), 403

    total = ScanLog.query.count()
    success = ScanLog.query.filter_by(status=1).count()
    needs_conf = ScanLog.query.filter_by(status=0).count()
    mismatch = ScanLog.query.filter_by(status=2).count()

    return jsonify({
        'total': total,
        'success': success,
        'needs_confirmation': needs_conf,
        'mismatched': mismatch
    }), 200

@jwt_required()
def detect_food_gemini():
    """Scan Food using Google Gemini Vision API."""
    if 'image' not in request.files:
        return jsonify({'msg': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'msg': 'Unsupported file type'}), 400

    upload_folder = os.path.join(os.getcwd(), 'uploads', 'detect-images')
    os.makedirs(upload_folder, exist_ok=True)
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1

        if not GEMINI_API_KEY or not _gemini_client_new:
            return jsonify({'msg': 'Gemini API Key is not configured correctly on the server'}), 500

        # Load the image
        from PIL import Image
        import io
        img = Image.open(filepath)
        
        # Convert PIL Image to bytes for the new SDK
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()

        from google.genai import types

        prompt = """
        Analyze this food image and return the estimated nutritional information in JSON format.
        Be as accurate as possible for the entire portion shown.
        If there are multiple food items, estimate for the whole plate.
        
        Return ONLY a JSON object with these keys:
        - "name": common name of the food
        - "calories": total kcal (number)
        - "protein": grams (number)
        - "carbs": grams (number)
        - "fat": grams (number)
        
        Example: {"name": "Grilled Chicken Salad", "calories": 450, "protein": 35, "carbs": 20, "fat": 15}
        """

        response = _gemini_client_new.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'),
                prompt,
            ]
        )
        
        try:
            # Extract JSON from response text
            text_response = response.text
            # Use cleanup logic from diary_controller
            cleaned = re.sub(r'```(?:json)?\s*', '', text_response, flags=re.IGNORECASE).strip().rstrip('`').strip()
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                nutrition_data = json.loads(json_match.group(0))
            else:
                logger.error(f"Failed to find JSON in Gemini response: {text_response}")
                return jsonify({'msg': 'Failed to parse nutritional data from AI'}), 500
        except Exception as json_err:
            logger.error(f"JSON Parsing error: {str(json_err)}. Response: {response.text}")
            return jsonify({'msg': 'Error parsing AI response'}), 500

        # Save to ScanLog
        log_scan_event(current_user_id, nutrition_data.get('name', 'Unknown'), 0.99, filepath, 1)

        return jsonify({
            'success': True,
            'nutrition': nutrition_data,
            'image_url': f"detect-images/{filename}"
        }), 200

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"detect_food_gemini error: {str(e)}\n{error_details}")
        return jsonify({'msg': 'An error occurred during Gemini processing', 'error': str(e)}), 500
    finally:
        # We might want to keep the image if we want to show it back from the server
        # but the frontend usually already has the local URI.
        # Original code removes it, so I'll follow that unless requested otherwise.
        if os.path.exists(filepath):
            os.remove(filepath)
