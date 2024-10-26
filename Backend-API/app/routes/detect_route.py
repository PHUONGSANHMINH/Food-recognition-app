# app/routes/detect.py

from flask import Blueprint
from app.controllers.detect_controller import detect_recommend_spoonacular, get_recipe_instructions, recommend_recipes_by_labels

detect_bp = Blueprint('detect', __name__)

@detect_bp.route('/detect-recommend-spoonacular', methods=['POST'])
def detect_and_recommend_view():
    return detect_recommend_spoonacular()

@detect_bp.route('/get-recipe-instructions/<int:recipe_id>', methods=['GET'])
def get_instructions_view(recipe_id):
    return get_recipe_instructions(recipe_id)

@detect_bp.route('/recommend-by-keyword/<string:keyword>', methods=['GET'])
def recommend_by_keyword_view(keyword):
    return recommend_recipes_by_labels([keyword])  # Gọi hàm recommend_recipes_by_labels với từ khóa