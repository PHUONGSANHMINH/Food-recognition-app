# app/models.py

from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

class User(db.Model):
    id_user = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    reset_code = db.Column(db.String(255), nullable=True)
    reset_code_expiration = db.Column(db.DateTime, nullable=True)
    reset_attempts = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(50), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def set_reset_code(self, code, expiration_minutes=10):
        """Đặt mã xác thực và thời gian hết hạn."""
        self.reset_code = code
        self.reset_code_expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
        self.reset_attempts = 0  # Reset số lần thử khi mã mới được thiết lập
    
    def clear_reset_code(self):
        """Xóa mã xác thực và thời gian hết hạn."""
        self.reset_code = None
        self.reset_code_expiration = None
        self.reset_attempts = 0

class Config(db.Model):
    config_name = db.Column(db.String(255), primary_key=True)
    config_value = db.Column(db.Text, nullable=False)

class AdvertisingBanners(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    expire_date = db.Column(db.Date, nullable=True)
    activate = db.Column(db.Boolean, nullable=False)
    image_background = db.Column(db.Text, nullable=True)

class RecipeInfo(db.Model):
    id_recipe = db.Column(db.Integer, primary_key=True)
    name_recipe = db.Column(db.String(255), nullable=False)
    image = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(255), nullable=True)

class RecipeIngredients(db.Model):
    id_ingredient = db.Column(db.Integer, primary_key=True)
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), nullable=False)
    name_ingredient = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), nullable=True)
    image = db.Column(db.Text, nullable=True)

class RecipeNutrition(db.Model):
    id_nutrition = db.Column(db.Integer, primary_key=True)
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), nullable=False)
    calories = db.Column(db.Float, nullable=True)
    fat = db.Column(db.Float, nullable=True)
    saturated_fat = db.Column(db.Float, nullable=True)
    carbohydrates = db.Column(db.Float, nullable=True)
    sugar = db.Column(db.Float, nullable=True)
    cholesterol = db.Column(db.Float, nullable=True)
    sodium = db.Column(db.Float, nullable=True)
    protein = db.Column(db.Float, nullable=True)
    alcohol = db.Column(db.Float, nullable=True)

class RecipeVitamin(db.Model):
    id_vitamin = db.Column(db.Integer, primary_key=True)
    id_nutrition = db.Column(db.Integer, db.ForeignKey('recipe_nutrition.id_nutrition'), nullable=False)
    protein = db.Column(db.Float, nullable=True)
    calcium = db.Column(db.Float, nullable=True)
    iron = db.Column(db.Float, nullable=True)
    vitamin_a = db.Column(db.Float, nullable=True)
    vitamin_c = db.Column(db.Float, nullable=True)
    vitamin_d = db.Column(db.Float, nullable=True)
    vitamin_e = db.Column(db.Float, nullable=True)
    vitamin_k = db.Column(db.Float, nullable=True)
    vitamin_b1 = db.Column(db.Float, nullable=True)
    vitamin_b2 = db.Column(db.Float, nullable=True)
    vitamin_b3 = db.Column(db.Float, nullable=True)
    vitamin_b5 = db.Column(db.Float, nullable=True)
    vitamin_b6 = db.Column(db.Float, nullable=True)
    vitamin_b12 = db.Column(db.Float, nullable=True)
    fiber = db.Column(db.Float, nullable=True)

class RecipeSteps(db.Model):
    id_step = db.Column(db.Integer, primary_key=True)
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)

class RecipesFavourite(db.Model):
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('user.id_user'), primary_key=True)

class RecipesContribution(db.Model):
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('user.id_user'), primary_key=True)
    accept_contribution = db.Column(db.Boolean, nullable=False)

class Rating(db.Model):
    id_rate = db.Column(db.Integer, primary_key=True)
    id_recipe = db.Column(db.Integer, db.ForeignKey('recipe_info.id_recipe'), nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('user.id_user'), nullable=False)
    star = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)