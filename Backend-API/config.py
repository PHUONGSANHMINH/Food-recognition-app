# config.py
from datetime import timedelta
import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'mysecretkey')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'mysql+pymysql://root:123456@localhost/food_recognition')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwtsecretkey')

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '465'))
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'liseentocbien@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'pxywkiiprgknohis')
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'False').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'True').lower() in ['true', '1', 't']
