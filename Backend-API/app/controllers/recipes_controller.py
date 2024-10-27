from flask import jsonify, request
from app import db
from app.models.model import RecipeInfo, Rating, RecipeIngredients, RecipeNutrition, RecipesContribution, RecipesFavourite, RecipeSteps, RecipeVitamin  
from flask_jwt_extended import jwt_required, get_jwt_identity

# Lấy danh sách các công thức
def get_recipes():
    recipes = RecipeInfo.query.all()
    recipes_data = []
    for recipe in recipes:
        recipes_data.append({
            'id_recipe': recipe.id_recipe,
            'name_recipe': recipe.name_recipe,
            'image': recipe.image,
            'type': recipe.type,
            'status': recipe.status,
            'summary': recipe.summary
        })
    return jsonify(recipes_data)

# Lấy chi tiết công thức
def get_recipe_detail(id_recipe):
    recipe = RecipeInfo.query.get(id_recipe)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    ingredients = RecipeIngredients.query.filter_by(id_recipe=id_recipe).all()
    nutrition = RecipeNutrition.query.filter_by(id_recipe=id_recipe).first()
    vitamins = RecipeVitamin.query.filter_by(id_nutrition=nutrition.id_nutrition).all() if nutrition else []
    steps = RecipeSteps.query.filter_by(id_recipe=id_recipe).order_by(RecipeSteps.step_number).all()

    recipe_data = {
        'id_recipe': recipe.id_recipe,
        'name_recipe': recipe.name_recipe,
        'image': recipe.image,
        'type': recipe.type,
        'status': recipe.status,
        'summary': recipe.summary,
        'ingredients': [{'name_ingredient': ing.name_ingredient, 'quantity': ing.quantity, 'unit': ing.unit, 'image': ing.image} for ing in ingredients],
        'nutrition': {
            'calories': nutrition.calories,
            'fat': nutrition.fat,
            'saturated_fat': nutrition.saturated_fat,
            'carbohydrates': nutrition.carbohydrates,
            'sugar': nutrition.sugar,
            'cholesterol': nutrition.cholesterol,
            'sodium': nutrition.sodium,
            'protein': nutrition.protein,
            'alcohol': nutrition.alcohol
        } if nutrition else None,
        'vitamins': {vit.name: getattr(vit, 'value', None) for vit in vitamins},
        'steps': [{'step_number': step.step_number, 'content': step.content} for step in steps]
    }

    return jsonify(recipe_data)

# Đóng góp công thức
@jwt_required()  # Chỉ cho phép người dùng đã đăng nhập
def contribute_recipe():
    user_id = get_jwt_identity()  # Lấy ID người dùng từ JWT
    data = request.get_json()
    id_recipe = data.get('id_recipe')

    # Kiểm tra xem công thức có tồn tại không
    recipe = RecipeInfo.query.get(id_recipe)
    if not recipe:
        return jsonify({'message': 'Recipe not found'}), 404

    # Tạo bản ghi đóng góp
    contribution = RecipesContribution(id_recipe=id_recipe, id_user=user_id, accept_contribution=False)
    db.session.add(contribution)
    db.session.commit()

    return jsonify({'message': 'Contribution submitted successfully'}), 201
