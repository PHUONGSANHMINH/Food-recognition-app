from flask import Blueprint
from app.controllers.nutrition_log_controller import (
    get_today_log,
    get_log_by_date,
    add_to_log,
    reset_today_log,
)
from flasgger import swag_from
from flask_jwt_extended import jwt_required

nutrition_log_bp = Blueprint('nutrition_log', __name__)


@nutrition_log_bp.route('/today', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-Log'],
    'summary': 'Get today\'s nutrition intake log',
    'description': 'Retrieve the total calories, protein, fat, and carbs consumed today.',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Today\'s log retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'log_date':        {'type': 'string'},
                    'calories_intake': {'type': 'number'},
                    'protein_intake':  {'type': 'number'},
                    'fat_intake':      {'type': 'number'},
                    'carb_intake':     {'type': 'number'},
                }
            }
        }
    }
})
def get_today_log_view():
    return get_today_log()


@nutrition_log_bp.route('/by-date', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-Log'],
    'summary': 'Get nutrition intake log by date',
    'description': 'Retrieve the nutrition log for a specific date (YYYY-MM-DD).',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'date',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Date in YYYY-MM-DD format',
            'example': '2026-05-18'
        }
    ],
    'responses': {
        200: {'description': 'Log for the requested date'},
        400: {'description': 'Invalid or missing date parameter'},
    }
})
def get_log_by_date_view():
    return get_log_by_date()


@nutrition_log_bp.route('/add', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-Log'],
    'summary': 'Add nutrition intake to today\'s log',
    'description': 'Accumulate calories, protein, fat, and carbs into today\'s log. Creates a new log entry if none exists.',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'calories': {'type': 'number', 'example': 420},
                    'protein':  {'type': 'number', 'example': 35},
                    'fat':      {'type': 'number', 'example': 12},
                    'carbs':    {'type': 'number', 'example': 45},
                }
            }
        }
    ],
    'responses': {
        200: {'description': 'Log updated successfully'},
    }
})
def add_to_log_view():
    return add_to_log()


@nutrition_log_bp.route('/today', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Nutrition-Log'],
    'summary': 'Reset today\'s nutrition log to zero',
    'description': 'Set all intake values (calories, protein, fat, carbs) to 0 for today.',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Today\'s log has been reset'},
    }
})
def reset_today_log_view():
    return reset_today_log()
