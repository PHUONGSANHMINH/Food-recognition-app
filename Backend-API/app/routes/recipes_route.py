from flask import Blueprint, request
from app.controllers.recipes_controller import get_recipes, get_recipe_detail, contribute_recipe, get_total_records

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


