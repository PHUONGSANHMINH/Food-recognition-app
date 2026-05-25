from flask import Blueprint
from app.controllers.diary_controller import (
    add_diary_entry,
    get_diary_entries,
    get_monthly_summary,
    validate_food_image,
)

diary_bp = Blueprint('diary', __name__)

# POST /api/diary/validate-food – Gemini xác thực ảnh + tên món + ước tính macro
@diary_bp.route('/validate-food', methods=['POST'])
def validate_food_view():
    return validate_food_image()

# POST /api/diary/add  – thêm bữa ăn
@diary_bp.route('/add', methods=['POST'])
def add_entry_view():
    return add_diary_entry()

# GET /api/diary/entries?date=YYYY-MM-DD  – danh sách bữa ăn theo ngày
@diary_bp.route('/entries', methods=['GET'])
def get_entries_view():
    return get_diary_entries()

# GET /api/diary/monthly-summary?year=YYYY&month=MM  – calo tháng cho lịch
@diary_bp.route('/monthly-summary', methods=['GET'])
def get_monthly_summary_view():
    return get_monthly_summary()
