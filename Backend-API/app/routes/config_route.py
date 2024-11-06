from flask import Blueprint
from app.controllers.config_controller import superadmin_login

config_bp = Blueprint('config', __name__)

@config_bp.route('/superadmin_login', methods=['POST'])
def login_superadmin():
    return superadmin_login()
