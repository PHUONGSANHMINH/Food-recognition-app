from flask import Blueprint, jsonify
from app.controllers.users_controller import login, register, send_code_forget_password, change_password, verify_code, refresh_token
from flasgger import swag_from
from flask_jwt_extended import (
    jwt_required
)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'User Login',
    'description': 'Authenticate a user with username and password, and return JWT tokens if valid.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string', 'example': 'testuser'},
                    'password': {'type': 'string', 'example': 'Test123@'}
                },
                'required': ['username', 'password']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Login successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'},
                    'refresh_token': {'type': 'string'}
                }
            }
        },
        400: {
            'description': 'Bad request - Invalid username or password format',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'Invalid username. Only 4-16 characters allowed, including letters, numbers, and underscores.'}
                }
            }
        },
        401: {
            'description': 'Unauthorized - Invalid credentials',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'Invalid login credentials.'}
                }
            }
        }
    }
})
def login_view():
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

@auth_bp.route('/forget-password/verify-code', methods=['POST'])
def verify_code_view():
    """Verify Code
    ---
    tags:
      - Authentication
    summary: Verify Code
    description: Verify the code sent to user’s email for password reset.
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
            verifycode:
              type: string
              example: 123456
    responses:
      200:
        description: Code verified successfully
      400:
        description: Invalid verification code
      403:
        description: Maximum verification attempts exceeded
      404:
        description: Email not found
    """
    return verify_code()

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
            newpassword:
              type: string
              example: NewPassword123!
            confirmpassword:
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

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Protected Endpoint',
    'description': 'A protected endpoint that requires a valid JWT token.',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Request successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'You have access to this protected endpoint.'}
                }
            }
        },
        401: {
            'description': 'Unauthorized - Invalid or missing JWT token',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'Missing Authorization Header'}
                }
            }
        }
    }
})
def protected():
    return jsonify({'msg': 'You have access to this protected endpoint.'}), 200


@auth_bp.route('/refresh', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Refresh Token',
    'description': 'Generate a new access token using the refresh token.',
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Bearer token for authorization',
            'example': 'Bearer <YourRefreshToken>'
        }
    ],
    'responses': {
        200: {
            'description': 'New access token generated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'}
                }
            }
        },
        401: {
            'description': 'Unauthorized - Invalid or expired refresh token',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'Token has expired'}
                }
            }
        },
        403: {
            'description': 'Forbidden - Invalid token claims',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'Invalid token claims'}
                }
            }
        }
    }
})
@jwt_required(refresh=True)
def refresh_view():
    return refresh_token()
