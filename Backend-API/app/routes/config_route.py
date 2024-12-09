from flask import Blueprint
from app.controllers.config_controller import superadmin_login, update_config, get_config
from flasgger import swag_from

config_bp = Blueprint('config', __name__)

@config_bp.route('/superadmin_login', methods=['POST'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Superadmin Login',
    'description': 'Login as superadmin using credentials stored in Config table',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'type': 'object',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {
                        'type': 'string'
                    },
                    'password': {
                        'type': 'string'
                    }
                },
                'example': {
                    'username': 'superadmin',
                    'password': 'superadminpassword'
                }
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
        401: {
            'description': 'Bad credentials',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'Config not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def login_superadmin():
    return superadmin_login()

@config_bp.route('/config/update', methods=['POST'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Update Config Value',
    'description': 'Update the value of a specific configuration in the Config table',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'config_name',
            'in': 'body',
            'type': 'string',
            'required': True,
            'description': 'Name of the configuration to update',
            'schema': {
                'type': 'object',
                'properties': {
                    'config_name': {
                        'type': 'string'
                    },
                    'config_value': {
                        'type': 'string'
                    }
                },
                'example': {
                    'config_name': 'example_name',
                    'config_value': 'example_value'
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
            'description': 'Config not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def update_config_view():
    return update_config()

@config_bp.route('/config/get', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get Config Value',
    'description': 'Get the value of a specific configuration from the Config table',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'config_name',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Name of the configuration to retrieve'
        }
    ],
    'responses': {
        200: {
            'description': 'Config value retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'config_name': {'type': 'string'},
                    'config_value': {'type': 'string'}
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
            'description': 'Config not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def get_config_view():
    return get_config()
