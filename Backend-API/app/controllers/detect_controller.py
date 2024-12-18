# app/controllers/detect_controller.py
import json, re, os, requests, random, json, logging
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import pandas as pd
from sqlalchemy.exc import SQLAlchemyError
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from app.models.model import Config, CSVExportVersion, RecipeInfo, RecipesContribution, RecipeNutrition, RecipeIngredients, UserDailyNutritionGoal, db

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
SPOONACULAR_NUTRITION_URL = 'https://api.spoonacular.com/recipes/{id}/nutritionWidget.json'


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
    # Kiểm tra file và xử lý ngoại lệ
    if 'image' not in request.files:
        logger.warning('No image part in the request')
        return jsonify({'msg': 'No image part in the request'}), 400
    
    file = request.files['image']
    
    # Kiểm tra tên file
    if file.filename == '':
        logger.warning('No selected file')
        return jsonify({'msg': 'No selected file'}), 400

    # Mở rộng danh sách file được phép
    def allowed_file(filename):
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # Kiểm tra định dạng file
    if not allowed_file(file.filename):
        logger.warning(f'Unsupported file type: {file.filename}')
        return jsonify({'msg': 'Unsupported file type'}), 400

    try:
        # Tạo thư mục upload an toàn
        upload_folder = os.path.join(os.getcwd(), 'uploads/detect-images')
        os.makedirs(upload_folder, exist_ok=True)

        # Tạo tên file duy nhất để tránh ghi đè
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(upload_folder, filename)
        
        # Lưu file
        file.save(filepath)

        # Kiểm tra kích thước file
        file_size = os.path.getsize(filepath)
        max_file_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_file_size:
            os.remove(filepath)
            logger.warning(f'File too large: {file_size} bytes')
            return jsonify({'msg': 'File is too large'}), 400

        # Phát hiện đối tượng
        results = model.predict(source=filepath, save=False)
        detected_labels = set()

        # Lấy kết quả từ model
        for result in results:
            for cls in result.boxes.cls:
                label = model.names[int(cls)]
                clean_label = re.sub(r'^\d+\s+', '', label)
                detected_labels.add(clean_label)

        # Chuyển sang list và loại bỏ file
        detected_labels = list(detected_labels)
        os.remove(filepath)

        # Trả về kết quả
        if not detected_labels:
            logger.info('No objects detected')
            return jsonify({'msg': 'No objects detected'}), 200

        return jsonify({'detected_objects': detected_labels}), 200

    except Exception as e:
        # Xử lý ngoại lệ và đảm bảo file tạm bị xóa
        logger.error(f"Error during object detection: {str(e)}")
        
        # Xóa file tạm nếu tồn tại
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'msg': 'An error occurred during detection', 
            'error': str(e)
        }), 500

def recommend_recipes_spoonacular():
    detected_labels = request.json.get('detected_objects', [])
    if not detected_labels:
        return jsonify({'msg': 'No detected objects provided'}), 400

    ingredients = ','.join(detected_labels)
    params = {
        'includeIngredients': ingredients,
        'number': 10,  # Số món được gợi ý từ spoonacular
        'ranking': 1,
        'addRecipeInformation': True
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

                if not recipes:
                    return jsonify({'msg': 'No recipes found for detected ingredients'}), 200

                recommendations = []
                for recipe in recipes:
                    recipe_info = get_recipe_info(recipe.get('id'))
                    instructions_result = get_recipe_instructions(recipe.get('id'))

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

                return jsonify({'recommendations': recommendations}), 200

            elif response.status_code == 402:
                limited_api_keys.add(api_key)
                logging.warning(f"API key {api_key} has reached the request limit. Trying the next API key.")
            else:
                logging.error(f"Unexpected error with API key {api_key}: {response.text}")

        except requests.RequestException as e:
            logging.error(f"Request error with API key {api_key}: {str(e)}")

    return jsonify({'msg': 'All API keys have reached their limits or encountered an error'}), 500


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
                'number': 10, # Số món được gợi ý từ spoonacular
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
@jwt_required()
def get_daily_meal_plan(default_calories=2000):
    try:
         # Lấy lượng calo mục tiêu của người dùng, trường hợp người dùng chưa có calories target tại db thì sẽ lấy calories default
        current_user_id = get_jwt_identity()
        if current_user_id == 'admin': current_user_id = 1
        user_goal = db.session.query(UserDailyNutritionGoal).filter(UserDailyNutritionGoal.id_user == current_user_id).first()
        target_calories = user_goal.calories_goal if user_goal and user_goal.calories_goal is not None else default_calories
        # Lấy các công thức đã được duyệt từ cơ sở dữ liệu
        recipes = db.session.query(RecipeInfo).join(RecipesContribution).filter(RecipesContribution.accept_contribution == True).all()
        
        if not recipes:
            raise ValueError("No approved recipes available.")

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
