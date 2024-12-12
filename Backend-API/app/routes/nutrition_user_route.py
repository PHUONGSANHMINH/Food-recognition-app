from flask import Blueprint
from app.controllers.nutrition_user_controller import update_calories, get_calories_goal
from flasgger import swag_from
from flask_jwt_extended import jwt_required

nutrition_bp = Blueprint('nutrition', __name__)

@nutrition_bp.route('/update', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-User'],
    'summary': 'Update Daily Nutrition Goal (Calories)',
    'description': 'Update the daily calories goal for the authenticated user. If no record exists, create a new one.',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'type': 'object',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'calories_goal': {
                        'type': 'integer',
                        'description': 'The target daily calories goal'
                    }
                },
                'example': {
                    'calories_goal': 2000
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Calories goal updated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        400: {
            'description': 'Invalid input',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'User not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def update_daily_nutrition_goal_view():
    return update_calories()

@nutrition_bp.route('/calories', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-User'],
    'summary': 'Get Current Daily Nutrition Goal (Calories)',
    'description': 'Retrieve the current daily calories goal for the authenticated user.',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Calories goal retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'calories_goal': {'type': 'integer'}
                }
            }
        },
        404: {
            'description': 'No calories goal found for this user',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def get_calories_goal_view():
    return get_calories_goal()
