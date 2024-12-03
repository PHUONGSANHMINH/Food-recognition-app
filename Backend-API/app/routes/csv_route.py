# app/routes/csv_routes.py

from flask import Blueprint
from app.controllers.csv_controller import get_csv_versions, get_csv_version, set_csv_config
from flasgger.utils import swag_from

csv_bp = Blueprint('csv', __name__)

@csv_bp.route('/versions', methods=['GET'])
@swag_from({
    'tags': ['CSV'],
    'summary': 'Get All CSV Versions',
    'description': 'Retrieve a list of all CSV export versions',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'A list of CSV versions',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'filename': {'type': 'string'},
                        'created_at': {'type': 'string', 'format': 'date-time'},
                        'exported_by': {'type': 'integer'},
                        'total_recipes': {'type': 'integer'},
                        'file_size': {'type': 'number'},
                        'status': {'type': 'string'},
                        'error_message': {'type': 'string'}
                    }
                }
            }
        }
    }
})
def get_versions():
    return get_csv_versions()

@csv_bp.route('/version/<int:version_id>', methods=['GET'])
@swag_from({
    'tags': ['CSV'],
    'summary': 'Get CSV Version by ID',
    'description': 'Retrieve a specific CSV export version by its ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'version_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the CSV version'
        }
    ],
    'responses': {
        200: {
            'description': 'CSV version details',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer'},
                    'filename': {'type': 'string'},
                    'created_at': {'type': 'string', 'format': 'date-time'},
                    'exported_by': {'type': 'integer'},
                    'total_recipes': {'type': 'integer'},
                    'file_size': {'type': 'number'},
                    'status': {'type': 'string'},
                    'error_message': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'Version not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def get_version(version_id):
    return get_csv_version(version_id)


@csv_bp.route('/set_csv_config', methods=['POST'])
@swag_from({
    'tags': ['CSV'],
    'summary': 'Set CSV Config',
    'description': 'Update the CSV configuration value in the Config table',
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
                    'config_name': {'type': 'string', 'default': 'data_recommend_csv'},
                    'config_value': {'type': 'string'}
                },
                'example': {
                    'config_name': 'data_recommend_csv',
                    'config_value': 'recipes_export_20231203_123456.csv'
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Config updated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'}
                }
            }
        },
        400: {
            'description': 'Invalid input',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'File not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        },
        500: {
            'description': 'Internal server error',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        }
    }
})
def set_config_view():
    return set_csv_config()
