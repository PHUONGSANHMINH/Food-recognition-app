from flask import Blueprint, request
from app.controllers.recipes_controller import get_recipes, get_recipe_detail, contribute_recipe, get_total_records, add_new_recipe, check_favourite_status, get_favourite_recipes, toggle_favourite_recipe

recipe_bp = Blueprint('recipe', __name__)

@recipe_bp.route('/', methods=['GET'])
def get_recipes_view():
    return get_recipes()

@recipe_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe_info_view(recipe_id):
    return get_recipe_detail(recipe_id)

@recipe_bp.route('/contribute', methods=['POST'])
def contribute_recipe_view():
    data = request.get_json()
    return contribute_recipe(data)

@recipe_bp.route('/total', methods=['GET'])
def get_recipes_total():
    return get_total_records()

@recipe_bp.route('/add', methods=['POST'])
def add_recipe_view():
    return add_new_recipe()

# New favourite routes
@recipe_bp.route('/<int:recipe_id>/favourite', methods=['POST'])
def toggle_favourite_view(recipe_id):
    """Toggle favourite status for a recipe"""
    return toggle_favourite_recipe(recipe_id)

@recipe_bp.route('/favourites', methods=['GET'])
def get_user_favourites():
    """Get all favourite recipes for current user"""
    return get_favourite_recipes()