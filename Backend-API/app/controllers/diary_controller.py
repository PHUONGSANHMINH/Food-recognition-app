from flask import jsonify, request
from app import db
from app.models.model import DiaryEntry, UserDailyLog
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from sqlalchemy import extract
import os, json, io, re
from werkzeug.utils import secure_filename
from google import genai
from google.genai import types
import PIL.Image
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Khởi tạo Gemini (dùng google-genai SDK mới, REST v1 thay vì gRPC v1beta)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
_gemini_client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = 'gemini-2.5-flash'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_diary_image(file):
    if not file or not allowed_file(file.filename):
        return None
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{secure_filename(file.filename)}"
    folder = os.path.join(UPLOAD_FOLDER, 'diary')
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, filename))
    return filename


def _parse_gemini_json(text: str) -> dict:
    """Trích JSON từ response Gemini, loại bỏ markdown wrapping nếu có."""
    # Bỏ ```json ... ``` hoặc ``` ... ```
    cleaned = re.sub(r'```(?:json)?\s*', '', text, flags=re.IGNORECASE).strip().rstrip('`').strip()
    # Tìm block JSON đầu tiên nếu còn text thừa
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    return json.loads(cleaned)


@jwt_required()
def validate_food_image():
    """
    Gửi ảnh + tên món đến Gemini 1.5 Flash để xác thực và ước tính macro.
    Input (form-data): image (file), meal_name (str)
    Output: { is_match, confidence, detected_food, calories_estimate,
              protein_g, carbs_g, fat_g, message }
    """
    try:
        meal_name = request.form.get('meal_name', '').strip()
        image_file = request.files.get('image')

        if not meal_name:
            return jsonify({'error': 'meal_name is required.'}), 400
        if not image_file or image_file.filename == '':
            return jsonify({'error': 'image is required.'}), 400

        # ── Đọc ảnh vào PIL.Image (cách đáng tin cậy nhất với Gemini SDK) ──
        image_bytes = image_file.read()
        pil_image = PIL.Image.open(io.BytesIO(image_bytes))
        # Chuyển sang RGB nếu ảnh có kênh alpha (PNG/GIF RGBA)
        if pil_image.mode in ('RGBA', 'LA', 'P'):
            pil_image = pil_image.convert('RGB')

        prompt = f"""You are a food recognition and nutrition expert.
Look at this food image carefully.
The user claims this food is: "{meal_name}"

Your tasks:
1. Determine if the image matches the food name (even partial match or similar dish counts as match).
2. Estimate realistic nutritional values for ONE typical serving of this food.

IMPORTANT: Return ONLY valid JSON with NO markdown, NO explanation outside JSON:
{{
  "is_match": true,
  "confidence": "high",
  "detected_food": "english name of what you see in the image",
  "calories_estimate": 450,
  "protein_g": 25.0,
  "carbs_g": 40.0,
  "fat_g": 12.0,
  "message": "brief one-sentence explanation in Vietnamese"
}}"""

        # Chuyển PIL.Image sang bytes để gửi qua SDK mới
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()

        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'),
                prompt,
            ]
        )
        raw_text = response.text
        print(f"[Gemini raw]: {raw_text[:300]}")  # debug log

        result = _parse_gemini_json(raw_text)

        return jsonify({
            'is_match':          bool(result.get('is_match', False)),
            'confidence':        result.get('confidence', 'low'),
            'detected_food':     result.get('detected_food', ''),
            'calories_estimate': float(result.get('calories_estimate', 0)),
            'protein_g':         float(result.get('protein_g', 0)),
            'carbs_g':           float(result.get('carbs_g', 0)),
            'fat_g':             float(result.get('fat_g', 0)),
            'message':           result.get('message', ''),
        }), 200

    except json.JSONDecodeError as e:
        raw = locals().get('raw_text', '')
        print(f"[Gemini JSONDecodeError] raw: {raw[:500]} | err: {e}")
        return jsonify({'error': f'Gemini returned invalid JSON: {str(e)}', 'raw': raw[:300]}), 500
    except Exception as e:
        import traceback
        print(f"[validate_food_image error]: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@jwt_required()
def add_diary_entry():
    """
    Thêm một bữa ăn vào diary và cập nhật user_daily_log với macro.
    Nhận form-data: meal_name, meal_type, calories, protein_g, carbs_g, fat_g, image.
    """
    try:
        user_id = get_jwt_identity()

        meal_name    = request.form.get('meal_name', '').strip()
        meal_type    = request.form.get('meal_type', '').strip()
        calories_raw = request.form.get('calories', '0')
        protein_raw  = request.form.get('protein_g', '0')
        carbs_raw    = request.form.get('carbs_g',   '0')
        fat_raw      = request.form.get('fat_g',     '0')
        image_file   = request.files.get('image')

        # ── Validation ──────────────────────────────────────────────────
        errors = []
        if not meal_name:
            errors.append('Meal name is required.')
        if not meal_type or meal_type not in ['Breakfast', 'Lunch', 'Dinner', 'Snack']:
            errors.append('meal_type must be Breakfast, Lunch, Dinner or Snack.')
        try:
            calories = float(calories_raw)
            if calories <= 0:
                errors.append('Calories must be greater than 0.')
        except ValueError:
            errors.append('Calories must be a number.')
        if not image_file or image_file.filename == '':
            errors.append('Image is required.')
        elif not allowed_file(image_file.filename):
            errors.append('Image must be png, jpg, jpeg, gif or webp.')

        if errors:
            return jsonify({'errors': errors}), 400

        def _safe_float(val, default=0.0):
            try:
                return float(val)
            except (TypeError, ValueError):
                return default

        protein_g = _safe_float(protein_raw)
        carbs_g   = _safe_float(carbs_raw)
        fat_g     = _safe_float(fat_raw)

        # Log để debug
        print(f"[add_diary] calories={calories} protein={protein_g} carbs={carbs_g} fat={fat_g}")

        # ── Lưu ảnh ──────────────────────────────────────────────────
        image_filename = save_diary_image(image_file)

        # ── Tạo diary_entry ───────────────────────────────────────────
        today = date.today()
        new_entry = DiaryEntry(
            id_user=user_id,
            entry_date=today,
            meal_type=meal_type,
            meal_name=meal_name,
            calories=calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            image=image_filename,
        )
        db.session.add(new_entry)

        # ── UPSERT user_daily_log ─────────────────────────────────────
        log = UserDailyLog.query.filter_by(id_user=user_id, log_date=today).first()
        if log:
            log.calories_intake = (log.calories_intake or 0) + calories
            log.protein_intake  = (log.protein_intake  or 0) + protein_g
            log.carb_intake     = (log.carb_intake      or 0) + carbs_g
            log.fat_intake      = (log.fat_intake       or 0) + fat_g
        else:
            log = UserDailyLog(
                id_user=user_id,
                log_date=today,
                calories_intake=calories,
                protein_intake=protein_g,
                fat_intake=fat_g,
                carb_intake=carbs_g,
            )
            db.session.add(log)

        db.session.commit()

        return jsonify({
            'message': 'Diary entry added successfully',
            'entry': {
                'id_entry':   new_entry.id_entry,
                'meal_type':  new_entry.meal_type,
                'meal_name':  new_entry.meal_name,
                'calories':   new_entry.calories,
                'protein_g':  new_entry.protein_g,
                'carbs_g':    new_entry.carbs_g,
                'fat_g':      new_entry.fat_g,
                'image':      new_entry.image,
                'entry_date': str(new_entry.entry_date),
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"[add_diary_entry error]: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@jwt_required()
def get_diary_entries():
    """
    Lấy danh sách bữa ăn đã nhập cho một ngày cụ thể.
    Query param: date=YYYY-MM-DD (mặc định hôm nay)
    """
    try:
        user_id = get_jwt_identity()
        date_str = request.args.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        else:
            target_date = date.today()

        entries = DiaryEntry.query.filter_by(
            id_user=user_id,
            entry_date=target_date
        ).order_by(DiaryEntry.created_at).all()

        total_calories = sum(e.calories for e in entries)

        return jsonify({
            'date': str(target_date),
            'total_calories': total_calories,
            'entries': [
                {
                    'id_entry':  e.id_entry,
                    'meal_type': e.meal_type,
                    'meal_name': e.meal_name,
                    'calories':  e.calories,
                    'protein_g': e.protein_g or 0,
                    'carbs_g':   e.carbs_g   or 0,
                    'fat_g':     e.fat_g     or 0,
                    'image':     e.image,
                }
                for e in entries
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@jwt_required()
def get_monthly_summary():
    """
    Trả về tổng calo theo ngày trong một tháng cho lịch.
    Query params: year=YYYY, month=MM (mặc định tháng hiện tại)
    """
    try:
        user_id = get_jwt_identity()
        now = datetime.now()
        year  = request.args.get('year',  now.year,  type=int)
        month = request.args.get('month', now.month, type=int)

        logs = UserDailyLog.query.filter(
            UserDailyLog.id_user == user_id,
            extract('year',  UserDailyLog.log_date) == year,
            extract('month', UserDailyLog.log_date) == month,
        ).all()

        summary = {str(log.log_date.day): round(log.calories_intake or 0) for log in logs}

        return jsonify({'year': year, 'month': month, 'summary': summary}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
