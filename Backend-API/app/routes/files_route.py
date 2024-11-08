# routes/file_bp.py
from flask import Blueprint
from app.controllers.files_controller import getFile
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
