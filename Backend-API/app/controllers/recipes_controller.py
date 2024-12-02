from flask import jsonify, request
from app import db
import os
import json
from werkzeug.utils import secure_filename
from datetime import datetime
from app.models.model import RecipeInfo, Rating, RecipeIngredients, RecipeNutrition, RecipesContribution, RecipesFavourite, RecipeSteps, RecipeVitamin  
from flask_jwt_extended import jwt_required, get_jwt_identity

# Cấu hình upload
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, subfolder=''):
    """
    Helper function để lưu file và trả về filename
    """
    if not file:
        return None
        
    if file and allowed_file(file.filename):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{secure_filename(file.filename)}"
        
        full_path = os.path.join(UPLOAD_FOLDER, subfolder)
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            
        file_path = os.path.join(full_path, filename)
        file.save(file_path)
        return filename
    return None

@jwt_required()
def add_new_recipe():
    try:
        # Lấy ID của user hiện tại từ JWT token
        current_user_id = get_jwt_identity()
        print(current_user_id)
        if(current_user_id == 'admin'):
            current_user_id = 1
        print(current_user_id)

        # Lấy form data và files
        recipe_image = request.files.get('image')
        recipe_data = request.form.get('recipe_data')
        ingredients_images = request.files.getlist('ingredients_images')
        
        if not recipe_data:
            return jsonify({'error': 'Recipe data is required'}), 400
            
        data = json.loads(recipe_data)
        
        recipe_image_filename = save_uploaded_file(recipe_image, 'recipes')
        
        # Tạo recipe mới
        new_recipe = RecipeInfo(
            name_recipe=data['name_recipe'],
            image=recipe_image_filename,
            type=data.get('type'),
            status=data.get('status'),
            summary=data.get('summary')
        )
        db.session.add(new_recipe)
        db.session.flush()  # Để lấy id_recipe

        # Tạo bản ghi contribution
        new_contribution = RecipesContribution(
            id_recipe=new_recipe.id_recipe,
            id_user=current_user_id,
            accept_contribution=False  # Mặc định là chưa được chấp nhận
        )
        db.session.add(new_contribution)

        # Thêm ingredients
        for idx, ingredient in enumerate(data['ingredients']):
            ingredient_image = ingredients_images[idx] if idx < len(ingredients_images) else None
            ingredient_image_filename = save_uploaded_file(ingredient_image, 'ingredients')
            
            new_ingredient = RecipeIngredients(
                id_recipe=new_recipe.id_recipe,
                name_ingredient=ingredient['name_ingredient'],
                quantity=ingredient['quantity'],
                unit=ingredient.get('unit'),
                image=ingredient_image_filename
            )
            db.session.add(new_ingredient)

        # Thêm nutrition nếu có
        if 'nutrition' in data:
            new_nutrition = RecipeNutrition(
                id_recipe=new_recipe.id_recipe,
                calories=data['nutrition'].get('calories'),
                fat=data['nutrition'].get('fat'),
                saturated_fat=data['nutrition'].get('saturated_fat'),
                carbohydrates=data['nutrition'].get('carbohydrates'),
                sugar=data['nutrition'].get('sugar'),
                cholesterol=data['nutrition'].get('cholesterol'),
                sodium=data['nutrition'].get('sodium'),
                protein=data['nutrition'].get('protein'),
                alcohol=data['nutrition'].get('alcohol')
            )
            db.session.add(new_nutrition)
            db.session.flush()  # Để lấy id_nutrition

            # Thêm vitamin
            for vitamin in data['vitamins']:
                new_vitamin = RecipeVitamin(
                    id_nutrition=new_nutrition.id_nutrition,
                    protein=vitamin.get('protein'),
                    calcium=vitamin.get('calcium'),
                    iron=vitamin.get('iron'),
                    vitamin_a=vitamin.get('vitamin_a'),
                    vitamin_c=vitamin.get('vitamin_c'),
                    vitamin_d=vitamin.get('vitamin_d'),
                    vitamin_e=vitamin.get('vitamin_e'),
                    vitamin_k=vitamin.get('vitamin_k'),
                    vitamin_b1=vitamin.get('vitamin_b1'),
                    vitamin_b2=vitamin.get('vitamin_b2'),
                    vitamin_b3=vitamin.get('vitamin_b3'),
                    vitamin_b5=vitamin.get('vitamin_b5'),
                    vitamin_b6=vitamin.get('vitamin_b6'),
                    vitamin_b12=vitamin.get('vitamin_b12'),
                    fiber=vitamin.get('fiber')
                )
                db.session.add(new_vitamin)

        # Thêm steps
        for step in data['steps']:
            new_step = RecipeSteps(
                id_recipe=new_recipe.id_recipe,
                step_number=step['step_number'],
                content=step['content']
            )
            db.session.add(new_step)

        # Lưu tất cả thay đổi
        db.session.commit()

        return jsonify({
            'message': 'Recipe added successfully',
            'recipe_id': new_recipe.id_recipe
        }), 201

    except Exception as e:
        db.session.rollback()
        # Xóa file đã upload nếu có lỗi
        if recipe_image_filename and os.path.exists(os.path.join(UPLOAD_FOLDER, 'recipes', recipe_image_filename)):
            os.remove(os.path.join(UPLOAD_FOLDER, 'recipes', recipe_image_filename))
        return jsonify({'error': str(e)}), 400

@jwt_required()
def update_recipe(id_recipe):
    try:
        # Lấy ID của user hiện tại từ JWT token
        current_user_id = get_jwt_identity()
        
        # Lấy form data và files
        recipe_image = request.files.get('image')
        recipe_data = request.form.get('recipe_data')
        ingredients_images = request.files.getlist('ingredients_images')
        
        if not recipe_data:
            return jsonify({'error': 'Recipe data is required'}), 400
            
        data = json.loads(recipe_data)
        
        # Tìm recipe hiện tại
        recipe = RecipeInfo.query.filter_by(id_recipe=id_recipe).first()
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Cập nhật thông tin recipe
        if recipe_image:
            recipe.image = save_uploaded_file(recipe_image, 'recipes')
        recipe.name_recipe = data['name_recipe']
        recipe.type = data.get('type')
        recipe.status = data.get('status')
        recipe.summary = data.get('summary')
        
        # Xóa các bản ghi vitamin liên quan trước
        nutrition = RecipeNutrition.query.filter_by(id_recipe=id_recipe).first()
        if nutrition:
            RecipeVitamin.query.filter_by(id_nutrition=nutrition.id_nutrition).delete()
        
        # Xóa các nguyên liệu, dinh dưỡng và bước hiện có
        RecipeIngredients.query.filter_by(id_recipe=id_recipe).delete()
        RecipeNutrition.query.filter_by(id_recipe=id_recipe).delete()
        RecipeSteps.query.filter_by(id_recipe=id_recipe).delete()
        
        # Thêm mới ingredients
        for idx, ingredient in enumerate(data['ingredients']):
            ingredient_image = ingredients_images[idx] if idx < len(ingredients_images) else None
            ingredient_image_filename = save_uploaded_file(ingredient_image, 'ingredients') if ingredient_image else None
            
            new_ingredient = RecipeIngredients(
                id_recipe=id_recipe,
                name_ingredient=ingredient['name_ingredient'],
                quantity=ingredient['quantity'],
                unit=ingredient.get('unit'),
                image=ingredient_image_filename
            )
            db.session.add(new_ingredient)
        
        # Thêm mới nutrition nếu có
        if 'nutrition' in data:
            new_nutrition = RecipeNutrition(
                id_recipe=id_recipe,
                calories=data['nutrition'].get('calories'),
                fat=data['nutrition'].get('fat'),
                saturated_fat=data['nutrition'].get('saturated_fat'),
                carbohydrates=data['nutrition'].get('carbohydrates'),
                sugar=data['nutrition'].get('sugar'),
                cholesterol=data['nutrition'].get('cholesterol'),
                sodium=data['nutrition'].get('sodium'),
                protein=data['nutrition'].get('protein'),
                alcohol=data['nutrition'].get('alcohol')
            )
            db.session.add(new_nutrition)
            db.session.flush()  # Lấy id_nutrition sau khi chèn mới

            # Thêm vitamin
            for vitamin in data['vitamins']:
                new_vitamin = RecipeVitamin(
                    id_nutrition=new_nutrition.id_nutrition,
                    protein=vitamin.get('protein'),
                    calcium=vitamin.get('calcium'),
                    iron=vitamin.get('iron'),
                    vitamin_a=vitamin.get('vitamin_a'),
                    vitamin_c=vitamin.get('vitamin_c'),
                    vitamin_d=vitamin.get('vitamin_d'),
                    vitamin_e=vitamin.get('vitamin_e'),
                    vitamin_k=vitamin.get('vitamin_k'),
                    vitamin_b1=vitamin.get('vitamin_b1'),
                    vitamin_b2=vitamin.get('vitamin_b2'),
                    vitamin_b3=vitamin.get('vitamin_b3'),
                    vitamin_b5=vitamin.get('vitamin_b5'),
                    vitamin_b6=vitamin.get('vitamin_b6'),
                    vitamin_b12=vitamin.get('vitamin_b12'),
                    fiber=vitamin.get('fiber')
                )
                db.session.add(new_vitamin)
        
        # Thêm mới steps
        for step in data['steps']:
            new_step = RecipeSteps(
                id_recipe=id_recipe,
                step_number=step['step_number'],
                content=step['content']
            )
            db.session.add(new_step)

        # Lưu tất cả thay đổi
        db.session.commit()

        return jsonify({
            'message': 'Recipe updated successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jwt_required()
def delete_recipe(id_recipe):
    try:
        # Lấy ID của user hiện tại từ JWT token
        current_user_id = get_jwt_identity()
        
        # Xác thực admin
        if current_user_id != 'admin' and current_user_id != 1:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Xóa recipe
        recipe = RecipeInfo.query.filter_by(id_recipe=id_recipe).first()
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404

        # Xóa các nguyên liệu, dinh dưỡng và bước
        RecipeVitamin.query.filter_by(id_nutrition=RecipeNutrition.query.filter_by(id_recipe=id_recipe).first().id_nutrition).delete()
        RecipeIngredients.query.filter_by(id_recipe=id_recipe).delete()
        RecipeNutrition.query.filter_by(id_recipe=id_recipe).delete()
        RecipeSteps.query.filter_by(id_recipe=id_recipe).delete()
        RecipesContribution.query.filter_by(id_recipe=id_recipe).delete()

        db.session.delete(recipe)
        db.session.commit()

        return jsonify({
            'message': 'Recipe deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



# Lấy tổng số bản ghi của tất cả công thức
def get_total_records():
    search = request.args.get('search', '', type=str)
    
    query = RecipeInfo.query
    
    if search:
        query = query.filter(RecipeInfo.name_recipe.like(f'%{search}%'))
    
    # Đếm tổng số công thức
    total_records = query.count()
    
    # Trả về tổng số bản ghi
    return jsonify({'total': total_records})

# Lấy danh sách các công thức
def get_recipes():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '', type=str)

    query = RecipeInfo.query

    if search:
        query = query.filter(RecipeInfo.name_recipe.like(f'%{search}%'))

    recipes = query.paginate(page=page, per_page=limit, error_out=False)

    recipes_data = []
    for recipe in recipes.items:
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
    try:
        recipe = RecipeInfo.query.get(id_recipe)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        ingredients = RecipeIngredients.query.filter_by(id_recipe=id_recipe).all()
        nutrition = RecipeNutrition.query.filter_by(id_recipe=id_recipe).first()
        vitamins = RecipeVitamin.query.filter_by(id_nutrition=nutrition.id_nutrition).first() if nutrition else None
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
            'vitamins': {
                'protein': vitamins.protein,
                'calcium': vitamins.calcium,
                'iron': vitamins.iron,
                'vitamin_a': vitamins.vitamin_a,
                'vitamin_c': vitamins.vitamin_c,
                'vitamin_d': vitamins.vitamin_d,
                'vitamin_e': vitamins.vitamin_e,
                'vitamin_k': vitamins.vitamin_k,
                'vitamin_b1': vitamins.vitamin_b1,
                'vitamin_b2': vitamins.vitamin_b2,
                'vitamin_b3': vitamins.vitamin_b3,
                'vitamin_b5': vitamins.vitamin_b5,
                'vitamin_b6': vitamins.vitamin_b6,
                'vitamin_b12': vitamins.vitamin_b12,
                'fiber': vitamins.fiber,
            } if vitamins else None,
            'steps': [{'step_number': step.step_number, 'content': step.content} for step in steps]
        }

        return jsonify(recipe_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

@jwt_required()
def toggle_favourite_recipe(id_recipe):
    """
    Thêm/xóa món ăn khỏi danh sách yêu thích
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Kiểm tra xem công thức có tồn tại không
        recipe = RecipeInfo.query.get(id_recipe)
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
            
        # Kiểm tra xem món ăn đã có trong favourite chưa
        favourite = RecipesFavourite.query.filter_by(
            id_recipe=id_recipe,
            id_user=current_user_id
        ).first()
        
        if favourite:
            # Nếu đã có thì xóa khỏi favourite
            db.session.delete(favourite)
            db.session.commit()
            return jsonify({
                'message': 'Recipe removed from favourites successfully',
                'is_favourite': False
            }), 200
        else:
            # Nếu chưa có thì thêm vào favourite
            new_favourite = RecipesFavourite(
                id_recipe=id_recipe,
                id_user=current_user_id
            )
            db.session.add(new_favourite)
            db.session.commit()
            return jsonify({
                'message': 'Recipe added to favourites successfully',
                'is_favourite': True
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@jwt_required()
def get_favourite_recipes():
    """
    Lấy danh sách các món ăn yêu thích của người dùng hiện tại
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Thêm phân trang
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Query với join để lấy thông tin món ăn
        favourite_recipes = db.session.query(RecipeInfo)\
            .join(RecipesFavourite, RecipesFavourite.id_recipe == RecipeInfo.id_recipe)\
            .filter(RecipesFavourite.id_user == current_user_id)\
            .paginate(page=page, per_page=limit, error_out=False)
            
        recipes_data = [{
            'id_recipe': recipe.id_recipe,
            'name_recipe': recipe.name_recipe,
            'image': recipe.image,
            'type': recipe.type,
            'status': recipe.status,
            'summary': recipe.summary
        } for recipe in favourite_recipes.items]
        
        return jsonify({
            'recipes': recipes_data,
            'total': favourite_recipes.total,
            'pages': favourite_recipes.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@jwt_required()
def check_favourite_status(id_recipe):
    """
    Kiểm tra xem một món ăn có trong danh sách yêu thích của người dùng hay không
    """
    try:
        current_user_id = get_jwt_identity()
        
        is_favourite = RecipesFavourite.query.filter_by(
            id_recipe=id_recipe,
            id_user=current_user_id
        ).first() is not None
        
        return jsonify({
            'is_favourite': is_favourite
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@jwt_required()
def get_user_contributions():
    """
    Lấy danh sách các công thức đóng góp của người dùng hiện tại
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Thêm phân trang
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Query với join để lấy thông tin chi tiết của các công thức do user đóng góp
        contributions = db.session.query(RecipeInfo, RecipesContribution)\
            .join(RecipesContribution, RecipesContribution.id_recipe == RecipeInfo.id_recipe)\
            .filter(RecipesContribution.id_user == current_user_id)\
            .paginate(page=page, per_page=limit, error_out=False)
            
        contributions_data = [{
            'id_recipe': recipe.id_recipe,
            'name_recipe': recipe.name_recipe,
            'image': recipe.image,
            'type': recipe.type,
            'status': recipe.status,
            'summary': recipe.summary,
            'accept_contribution': contribution.accept_contribution
        } for recipe, contribution in contributions.items]
        
        return jsonify({
            'contributions': contributions_data,
            'total': contributions.total,
            'pages': contributions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def get_total_unaccepted_recipes():
    total_unaccepted_recipes = RecipesContribution.query.filter_by(accept_contribution=False).count()
    return jsonify({'total_unaccepted_recipes': total_unaccepted_recipes})

def get_unaccepted_recipes():
    try:
        unaccepted_recipes = RecipesContribution.query.filter_by(accept_contribution=False).all()
        
        recipes_data = []
        for contribution in unaccepted_recipes:
            recipe = RecipeInfo.query.get(contribution.id_recipe)
            if recipe:
                # Lấy danh sách nguyên liệu
                ingredients = RecipeIngredients.query.filter_by(id_recipe=recipe.id_recipe).all()
                ingredients_data = [{'name_ingredient': ing.name_ingredient, 'quantity': ing.quantity, 'unit': ing.unit, 'image': ing.image} for ing in ingredients]

                # Lấy thông tin dinh dưỡng
                nutrition = RecipeNutrition.query.filter_by(id_recipe=recipe.id_recipe).first()
                nutrition_data = {
                    'calories': nutrition.calories,
                    'fat': nutrition.fat,
                    'saturated_fat': nutrition.saturated_fat,
                    'carbohydrates': nutrition.carbohydrates,
                    'sugar': nutrition.sugar,
                    'cholesterol': nutrition.cholesterol,
                    'sodium': nutrition.sodium,
                    'protein': nutrition.protein,
                    'alcohol': nutrition.alcohol
                } if nutrition else {}

                # Lấy thông tin vitamin
                vitamins = RecipeVitamin.query.filter_by(id_nutrition=nutrition.id_nutrition).all() if nutrition else []
                vitamins_data = [{'protein': vit.protein, 'calcium': vit.calcium, 'iron': vit.iron, 'vitamin_a': vit.vitamin_a, 'vitamin_c': vit.vitamin_c, 'vitamin_d': vit.vitamin_d, 'vitamin_e': vit.vitamin_e, 'vitamin_k': vit.vitamin_k, 'vitamin_b1': vit.vitamin_b1, 'vitamin_b2': vit.vitamin_b2, 'vitamin_b3': vit.vitamin_b3, 'vitamin_b5': vit.vitamin_b5, 'vitamin_b6': vit.vitamin_b6, 'vitamin_b12': vit.vitamin_b12, 'fiber': vit.fiber} for vit in vitamins]

                # Lấy các bước thực hiện
                steps = RecipeSteps.query.filter_by(id_recipe=recipe.id_recipe).all()
                steps_data = [{'step_number': step.step_number, 'content': step.content} for step in steps]

                # Tổng hợp tất cả thông tin
                recipes_data.append({
                    'id_recipe': recipe.id_recipe,
                    'name_recipe': recipe.name_recipe,
                    'image': recipe.image,
                    'type': recipe.type,
                    'status': recipe.status,
                    'summary': recipe.summary,
                    'ingredients': ingredients_data,
                    'nutrition': nutrition_data,
                    'vitamins': vitamins_data,
                    'steps': steps_data
                })

        return jsonify(recipes_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
