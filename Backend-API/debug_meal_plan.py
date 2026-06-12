from app import create_app, db
from app.models.model import RecipeInfo, RecipesContribution, RecipeNutrition, UserDailyNutritionGoal
import random

app = create_app()
with app.app_context():
    try:
        print("Starting debug...")
        # 1. Check recipes with contribution join
        recipes = db.session.query(RecipeInfo).join(RecipesContribution).filter(RecipesContribution.accept_contribution == 1).all()
        print(f"Found {len(recipes)} approved recipes")
        
        if recipes:
            # 2. Check first recipe nutrition
            r = recipes[0]
            print(f"Checking recipe: {r.name_recipe} (ID: {r.id_recipe})")
            nutrition = db.session.query(RecipeNutrition).filter(RecipeNutrition.id_recipe == r.id_recipe).first()
            if nutrition:
                print(f"Nutrition found: {nutrition.calories} kcal")
            else:
                print("No nutrition info found for this recipe!")
                
    except Exception as e:
        import traceback
        print(f"Error occurred: {e}")
        traceback.print_exc()
