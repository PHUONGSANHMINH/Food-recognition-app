# app/routes/csv_routes.py

from flask import Blueprint
from app.controllers.csv_controller import get_csv_versions, get_csv_version, set_csv_config, get_csv_version_content, delete_csv_version
from flasgger.utils import swag_from

csv_bp = Blueprint('csv', __name__)

@csv_bp.route('/version/<int:version_id>/content', methods=['GET'])
@swag_from({
    'tags': ['CSV'],
    'summary': 'Get CSV Version Content',
    'description': 'Retrieve the content of a specific CSV version by its ID',
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
            'description': 'CSV version content',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'description': 'CSV row data'
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
def get_version_content(version_id):
    return get_csv_version_content(version_id)

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

@csv_bp.route('/version/<int:version_id>', methods=['DELETE'])
@swag_from({
    'tags': ['CSV'],
    'summary': 'Delete a CSV Version',
    'description': 'Delete a specific CSV export version by its ID, including removing the associated file. If the version is currently in use in the configuration, it cannot be deleted.',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'version_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the CSV version to delete'
        }
    ],
    'responses': {
        200: {
            'description': 'Version deleted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        400: {
            'description': 'Version currently in use and cannot be deleted',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
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
def delete_version(version_id):
    return delete_csv_version(version_id)

