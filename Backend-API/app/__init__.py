# app/__init__.py
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_migrate import Migrate
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import os

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    load_dotenv()  # Tải biến môi trường từ .env

    app.config.from_object('config.Config')

    # Khởi tạo các extension
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Thiết lập logging
    if not app.debug:
        handler = RotatingFileHandler('app.log', maxBytes=100000, backupCount=10)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)

    with app.app_context():
        # Import và đăng ký các blueprint
        from app.routes.auth_route import auth_bp
        from app.routes.user_route import user_bp
        from app.routes.detect_route import detect_bp
        from app.routes.recipes_route import recipe_bp

        # Import models để Flask-Migrate nhận diện
        from app.models.model import Config, AdvertisingBanners, Rating, RecipeInfo, RecipeIngredients, RecipeNutrition, RecipesContribution, RecipesFavourite, RecipeSteps, RecipeVitamin, User

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(user_bp, url_prefix='/api/user')
        app.register_blueprint(detect_bp, url_prefix='/api/detect')
        app.register_blueprint(recipe_bp, url_prefix='/api/recipe')
    return app
