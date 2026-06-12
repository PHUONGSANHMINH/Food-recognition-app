from flask import Blueprint
from app.controllers.config_controller import superadmin_login, update_config, get_config, get_statistics, get_monthly_contributions, get_calorie_observation, get_recent_contributions, get_user_status
from flasgger import swag_from
from flask_jwt_extended import jwt_required

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
                    'username': 'admin',
                    'password': 'admin'
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

@config_bp.route('/statistics', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get system statistics',
    'security': [{'Bearer': []}],
    'description': 'Retrieve the total number of recipes, users, contributions, and unapproved contributions',
    'responses': {
        200: {
            'description': 'Statistics retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'total_recipes': {'type': 'integer'},
                    'total_users': {'type': 'integer'},
                    'total_contributions': {'type': 'integer'},
                    'total_unapproved_contributions': {'type': 'integer'}
                }
            }
        }
    }
})
@jwt_required()
def get_statistics_view():
    return get_statistics()

@config_bp.route('/contribution-analysis', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get Monthly Contributions Analysis',
    'description': 'Retrieve the number of contributions grouped by month',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Contributions by month retrieved successfully',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'month': {'type': 'string'},
                        'contributions': {'type': 'integer'}
                    }
                }
            }
        },
        401: {
            'description': 'Unauthorized',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
@jwt_required()
def get_monthly_contributions_view():
    return get_monthly_contributions()

@config_bp.route('/calorie-observation', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get Calorie Observation Data',
    'description': 'Retrieve average calorie goals vs actual consumption for the last 7 days',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Calorie observation data retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'labels': {'type': 'array', 'items': {'type': 'string'}},
                    'goal_data': {'type': 'array', 'items': {'type': 'number'}},
                    'intake_data': {'type': 'array', 'items': {'type': 'number'}}
                }
            }
        },
        401: {
            'description': 'Unauthorized',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
@jwt_required()
def get_calorie_observation_view():
    return get_calorie_observation()

@config_bp.route('/recent-contributions', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get Recent Contributions',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Recent contributions retrieved successfully'
        }
    }
})
@jwt_required()
def get_recent_contributions_view():
    return get_recent_contributions()

@config_bp.route('/user-status', methods=['GET'])
@swag_from({
    'tags': ['Config'],
    'summary': 'Get User Status',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'User status retrieved successfully'
        }
    }
})
@jwt_required()
def get_user_status_view():
    return get_user_status()