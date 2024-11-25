# routes/files_route.py
from flask import Blueprint
from app.controllers.files_controller import getFile, export_recipes_to_csv, get_export_history
from flasgger import swag_from

file_bp = Blueprint('file', __name__)

@file_bp.route('/get-file/<path:filename>', methods=['GET'])
@swag_from({
    'tags': ['Files'],
    'summary': 'Get File',
    'description': 'Retrieve a file by filename.',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'required': True,
            'type': 'string',
            'description': 'The name or path of the file to retrieve',
            'example': 'documents/example.pdf'
        }
    ],
    'responses': {
        200: {
            'description': 'File retrieved successfully',
            'content': {
                'application/octet-stream': {
                    'schema': {
                        'type': 'string',
                        'format': 'binary'
                    }
                }
            }
        },
        404: {
            'description': 'File not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'File not found.'
                    }
                }
            }
        }
    }
})
def get_file_view(filename):
    return getFile(filename)

@file_bp.route('/export-csv', methods=['GET'])
@swag_from({
    'tags': ['Files'],
    'summary': 'Export approved recipes to CSV',
    'description': 'Export all approved recipes to a CSV file and save metadata in the database.',
    'security': [{'Bearer': []}],  # Apply the security definition
    'responses': {
        200: {
            'description': 'Recipes exported successfully',
            'examples': {
                'application/json': {
                    'success': True,
                    'message': 'Recipe dataset has been exported successfully',
                    'data': {
                        'filename': 'recipes_export_20241125_113600.csv',
                        'total_recipes': 100,
                        'file_size': '2048.00 KB',
                        'path': '/path/to/your/recommend-dataset/recipes_export_20241125_113600.csv'
                    }
                }
            }
        },
        500: {
            'description': 'Failed to export recipes dataset',
            'examples': {
                'application/json': {
                    'success': False,
                    'message': 'Failed to export recipes dataset',
                    'error': 'Error message details'
                }
            }
        }
    }
})
def export_recipes_to_csv_view():
    return export_recipes_to_csv()

@file_bp.route('/export-history', methods=['GET'])
@swag_from({
    'tags': ['Files'],
    'summary': 'Get Export History',
    'description': 'Retrieve the history of CSV exports with details like filename, created date, total recipes, file size, and status.',
    'responses': {
        200: {
            'description': 'Export history retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {
                        'type': 'boolean',
                        'example': True
                    },
                    'data': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {
                                    'type': 'integer',
                                    'example': 1
                                },
                                'filename': {
                                    'type': 'string',
                                    'example': 'recipes_export_20240325_123456.csv'
                                },
                                'created_at': {
                                    'type': 'string',
                                    'format': 'date-time',
                                    'example': '2024-03-25T12:34:56'
                                },
                                'total_recipes': {
                                    'type': 'integer',
                                    'example': 100
                                },
                                'file_size': {
                                    'type': 'number',
                                    'format': 'float',
                                    'example': 256.5
                                },
                                'status': {
                                    'type': 'string',
                                    'enum': ['completed', 'failed'],
                                    'example': 'completed'
                                },
                                'error_message': {
                                    'type': 'string',
                                    'nullable': True,
                                    'example': None
                                }
                            }
                        }
                    }
                }
            }
        },
        500: {
            'description': 'Internal server error',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {
                        'type': 'boolean',
                        'example': False
                    },
                    'message': {
                        'type': 'string',
                        'example': 'Failed to get export history'
                    },
                    'error': {
                        'type': 'string',
                        'example': 'Database connection error'
                    }
                }
            }
        }
    }
})
def get_export_history_view():
    return get_export_history()