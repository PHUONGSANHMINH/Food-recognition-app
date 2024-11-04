from flask import Blueprint
from app.controllers.users_controller import login, register, send_code_forget_password, change_password
from flasgger import swag_from

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login_view():
    """User Login
    ---
    tags:
      - Authentication
    summary: User Login
    description: Authenticate a user with username and password, and return JWT tokens if valid.
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
              example: test
            password:
              type: string
              example: testpassword
          required:
            - username
            - password
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            access_token:
              type: string
            refresh_token:
              type: string
      400:
        description: Bad request - Invalid username or password format
        schema:
          type: object
          properties:
            msg:
              type: string
              example: "Invalid username. Only 4-16 characters allowed, including letters, numbers, and underscores."
      401:
        description: Unauthorized - Invalid credentials
        schema:
          type: object
          properties:
            msg:
              type: string
              example: "Invalid login credentials."
    """
    return login()

@auth_bp.route('/register', methods=['POST'])
def register_view():
    """User Registration
    ---
    tags:
      - Authentication
    summary: User Registration
    description: Register a new user with username, email, and password.
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
              example: newuser
            password:
              type: string
              example: NewPassword123!
            email:
              type: string
              example: newuser@example.com
    responses:
      201:
        description: User registered successfully
      400:
        description: Validation error or invalid data
    """
    return register()

@auth_bp.route('/forget-password/send-code', methods=['POST'])
def send_code_forget_password_view():
    """Send Password Reset Code
    ---
    tags:
      - Authentication
    summary: Send Password Reset Code
    description: Send a verification code to user’s email for password reset.
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: user@example.com
    responses:
      200:
        description: Verification code sent successfully
      404:
        description: Email not found
    """
    return send_code_forget_password()

@auth_bp.route('/forget-password/change', methods=['POST'])
def change_password_view():
    """Change Password
    ---
    tags:
      - Authentication
    summary: Change Password
    description: Change user’s password using a verification code sent via email.
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: user@example.com
            oldpassword:
              type: string
              example: OldPassword123!
            newpassword:
              type: string
              example: NewPassword123!
            verifycode:
              type: string
              example: 123456
    responses:
      200:
        description: Password changed successfully
      400:
        description: Invalid verification code or weak password
      403:
        description: Maximum verification attempts exceeded
      404:
        description: Email not found
    """
    return change_password()
