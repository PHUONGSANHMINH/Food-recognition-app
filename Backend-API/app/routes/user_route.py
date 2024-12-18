from flask import Blueprint
from app.controllers.users_controller import get_all_users, delete_user, update_user, get_user_info
from flask_jwt_extended import jwt_required
from flasgger import swag_from

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@swag_from({
    'tags': ['User'],
    'security': [{'Bearer': []}],
    'description': 'Retrieve a paginated list of users with optional search functionality.',
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'description': 'Page number for pagination',
            'required': False,
            'type': 'integer',
            'default': 1
        },
        {
            'name': 'limit',
            'in': 'query',
            'description': 'Number of users per page',
            'required': False,
            'type': 'integer',
            'default': 10
        },
        {
            'name': 'search',
            'in': 'query',
            'description': 'Search keyword for filtering users by username',
            'required': False,
            'type': 'string',
        }
    ],
    'responses': {
        '200': {
            'description': 'List of users',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id_user': {'type': 'integer'},
                        'username': {'type': 'string'},
                        'email': {'type': 'string'},
                        'status': {'type': 'string'},
                        'recipes_contribution': {'type': 'integer'},
                        'recipes_contribution_approved': {'type': 'integer'},
                        'recipes_contribution_waiting': {'type': 'integer'},
                        'recipes_contribution_rejected': {'type': 'integer'}
                    }
                }
            }
        },
        '401': {
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
@jwt_required()  # Only authenticated users can view the list
def get_all_users_view():
    return get_all_users()


@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
@swag_from({
    'tags': ['User'],
    'security': [{'Bearer': []}],
    'description': 'Delete a user by their user ID',
    'parameters': [
        {
            'name': 'user_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the user to be deleted'
        }
    ],
    'responses': {
        '200': {
            'description': 'User successfully deleted',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        '403': {
            'description': 'Permission denied',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        '404': {
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
@jwt_required()  # Only authenticated users can delete
def delete_user_view(user_id):
    return delete_user(user_id)


@user_bp.route('/update', methods=['PUT'])
@swag_from({
    'tags': ['User'],
    'security': [{'Bearer': []}],
    'description': 'Update user details (username, email, password)',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {
                        'type': 'string',
                        'description': 'New username (optional)',
                    },
                    'email': {
                        'type': 'string',
                        'description': 'New email (optional)',
                    },
                    'password': {
                        'type': 'string',
                        'description': 'New password (optional)',
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'User successfully updated',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        },
        '400': {
            'description': 'Validation errors',
            'schema': {
                'type': 'object',
                'properties': {
                    'errors': {
                        'type': 'object',
                        'properties': {
                            'username': {
                                'type': 'array',
                                'items': {'type': 'string'}
                            },
                            'email': {
                                'type': 'array',
                                'items': {'type': 'string'}
                            },
                            'password': {
                                'type': 'array',
                                'items': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        },
        '403': {
            'description': 'Permission denied',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
@jwt_required()  # Ensure that the user is authenticated
def update_user_view():
    return update_user()

@user_bp.route('/info', methods=['GET'])
@swag_from({
    'tags': ['User'],
    'security': [{'Bearer': []}],
    'description': 'Retrieve the current logged-in user\'s information',
    'responses': {
        '200': {
            'description': 'User information',
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string'},
                }
            }
        },
        '401': {
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
def get_user_info_view():
    return get_user_info()