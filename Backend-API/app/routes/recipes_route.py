# routes/recipes_route.py
from flask import Blueprint, request
from flasgger import swag_from
from app.controllers.recipes_controller import (
    get_recipes,
    get_recipe_detail,
    contribute_recipe,
    get_total_records,
    add_new_recipe,
    get_favourite_recipes,
    toggle_favourite_recipe,
    get_user_contributions,
    get_total_unaccepted_recipes,
    get_unaccepted_recipes,
    update_recipe,
    delete_recipe
)

recipe_bp = Blueprint('recipe', __name__)

@recipe_bp.route('/', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Recipes List',
    'description': 'Get a paginated list of recipes with optional search',
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 1,
            'description': 'Page number for pagination'
        },
        {
            'name': 'limit',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 10,
            'description': 'Number of items per page'
        },
        {
            'name': 'search',
            'in': 'query',
            'type': 'string',
            'required': False,
            'description': 'Search term for recipe names'
        }
    ],
    'responses': {
        200: {
            'description': 'List of recipes retrieved successfully',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id_recipe': {'type': 'integer'},
                        'name_recipe': {'type': 'string'},
                        'image': {'type': 'string'},
                        'type': {'type': 'string'},
                        'status': {'type': 'string'},
                        'summary': {'type': 'string'}
                    }
                }
            }
        }
    }
})
def get_recipes_view():
    return get_recipes()

@recipe_bp.route('/<int:recipe_id>', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Recipe Details',
    'description': 'Get detailed information about a specific recipe',
    'parameters': [
        {
            'name': 'recipe_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the recipe to retrieve'
        }
    ],
    'responses': {
        200: {
            'description': 'Recipe details retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'id_recipe': {'type': 'integer'},
                    'name_recipe': {'type': 'string'},
                    'image': {'type': 'string'},
                    'type': {'type': 'string'},
                    'status': {'type': 'string'},
                    'summary': {'type': 'string'},
                    'ingredients': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'name_ingredient': {'type': 'string'},
                                'quantity': {'type': 'number'},
                                'unit': {'type': 'string'},
                                'image': {'type': 'string'}
                            }
                        }
                    },
                    'nutrition': {
                        'type': 'object',
                        'properties': {
                            'calories': {'type': 'number'},
                            'fat': {'type': 'number'},
                            'saturated_fat': {'type': 'number'},
                            'carbohydrates': {'type': 'number'},
                            'sugar': {'type': 'number'},
                            'cholesterol': {'type': 'number'},
                            'sodium': {'type': 'number'},
                            'protein': {'type': 'number'},
                            'alcohol': {'type': 'number'}
                        }
                    }
                }
            }
        },
        404: {
            'description': 'Recipe not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        }
    }
})
def get_recipe_info_view(recipe_id):
    return get_recipe_detail(recipe_id)

@recipe_bp.route('/contribute', methods=['POST'])
# @swag_from({
#     'tags': ['Recipes'],
#     'summary': 'Contribute Recipe',
#     'description': 'Submit a recipe contribution',
#     'security': [{'Bearer': []}],
#     'parameters': [
#         {
#             'name': 'body',
#             'in': 'body',
#             'required': True,
#             'schema': {
#                 'type': 'object',
#                 'properties': {
#                     'id_recipe': {'type': 'integer'}
#                 }
#             }
#         }
#     ],
#     'responses': {
#         201: {
#             'description': 'Contribution submitted successfully',
#             'schema': {
#                 'type': 'object',
#                 'properties': {
#                     'message': {'type': 'string'}
#                 }
#             }
#         },
#         404: {
#             'description': 'Recipe not found',
#             'schema': {
#                 'type': 'object',
#                 'properties': {
#                     'message': {'type': 'string'}
#                 }
#             }
#         }
#     }
# })
def contribute_recipe_view():
    return contribute_recipe()

@recipe_bp.route('/total', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Total Recipes Count',
    'description': 'Get the total number of recipes with optional search filter',
    'parameters': [
        {
            'name': 'search',
            'in': 'query',
            'type': 'string',
            'required': False,
            'description': 'Search term for recipe names'
        }
    ],
    'responses': {
        200: {
            'description': 'Total number of recipes retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'total': {'type': 'integer'}
                }
            }
        }
    }
})
def get_recipes_total():
    return get_total_records()

@recipe_bp.route('/add', methods=['POST'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Add New Recipe',
    'description': 'Add a new recipe with all details including images',
    'security': [{'Bearer': []}],
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'image',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'Main recipe image'
        },
        {
            'name': 'recipe_data',
            'in': 'formData',
            'type': 'string',
            'format': 'textarea',  # This will convert the input to a text area
            'required': True,
            'description': '''Recipe data in JSON format. Example:
```json
{
  "name_recipe": "New Recipe",
  "type": "Dessert",
  "status": "Published",
  "summary": "This is a new recipe.",
  "ingredients": [
    {
      "name_ingredient": "Sugar",
      "quantity": 100,
      "unit": "grams"
    },
    {
      "name_ingredient": "Flour",
      "quantity": 200,
      "unit": "grams"
    }
  ],
  "nutrition": {
    "calories": 300,
    "fat": 10,
    "saturated_fat": 2,
    "carbohydrates": 50,
    "sugar": 20,
    "cholesterol": 0,
    "sodium": 5,
    "protein": 5,
    "alcohol": 0
  },
  "vitamins": [
    {
      "protein": 5,
      "calcium": 0,
      "iron": 2,
      "vitamin_a": 5,
      "vitamin_c": 10,
      "vitamin_d": 1,
      "vitamin_e": 1,
      "vitamin_k": 0.5,
      "vitamin_b1": 0.3,
      "vitamin_b2": 0.2,
      "vitamin_b3": 0.4,
      "vitamin_b5": 0.6,
      "vitamin_b6": 0.1,
      "vitamin_b12": 0.01,
      "fiber": 2
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "content": "Mix the dry ingredients."
    },
    {
      "step_number": 2,
      "content": "Add the wet ingredients and mix well."
    },
    {
      "step_number": 3,
      "content": "Bake in the oven at 180°C for 25 minutes."
    }
  ]
}
```'''
        },
        {
            'name': 'ingredients_images',
            'in': 'formData',
            'type': 'array',
            'items': {'type': 'file'},
            'required': False,
            'description': 'Images for ingredients'
        }
    ],
    'responses': {
        201: {
            'description': 'Recipe added successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'recipe_id': {'type': 'integer'}
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
        }
    }
})
def add_recipe_view():
    return add_new_recipe()

@recipe_bp.route('/update/<int:id_recipe>', methods=['PUT'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Update Existing Recipe',
    'description': 'Update an existing recipe with all details including images',
    'security': [{'Bearer': []}],
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'id_recipe',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Recipe ID'
        },
        {
            'name': 'image',
            'in': 'formData',
            'type': 'file',
            'required': False,
            'description': 'Main recipe image'
        },
        {
            'name': 'recipe_data',
            'in': 'formData',
            'type': 'string',
            'format': 'textarea',
            'required': True,
            'description': '''Recipe data in JSON format. Example:
```json
{
  "name_recipe": "Updated Recipe",
  "type": "Dessert",
  "status": "Published",
  "summary": "This is an updated recipe.",
  "ingredients": [
    {
      "name_ingredient": "Sugar",
      "quantity": 100,
      "unit": "grams"
    },
    {
      "name_ingredient": "Flour",
      "quantity": 200,
      "unit": "grams"
    }
  ],
  "nutrition": {
    "calories": 300,
    "fat": 10,
    "saturated_fat": 2,
    "carbohydrates": 50,
    "sugar": 20,
    "cholesterol": 0,
    "sodium": 5,
    "protein": 5,
    "alcohol": 0
  },
  "vitamins": [
    {
      "protein": 5,
      "calcium": 0,
      "iron": 2,
      "vitamin_a": 5,
      "vitamin_c": 10,
      "vitamin_d": 1,
      "vitamin_e": 1,
      "vitamin_k": 0.5,
      "vitamin_b1": 0.3,
      "vitamin_b2": 0.2,
      "vitamin_b3": 0.4,
      "vitamin_b5": 0.6,
      "vitamin_b6": 0.1,
      "vitamin_b12": 0.01,
      "fiber": 2
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "content": "Mix the dry ingredients."
    },
    {
      "step_number": 2,
      "content": "Add the wet ingredients and mix well."
    },
    {
      "step_number": 3,
      "content": "Bake in the oven at 180°C for 25 minutes."
    }
  ]
}
```'''
        },
        {
            'name': 'ingredients_images',
            'in': 'formData',
            'type': 'array',
            'items': {'type': 'file'},
            'required': False,
            'description': 'Images for ingredients'
        }
    ],
    'responses': {
        200: {
            'description': 'Recipe updated successfully',
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
            'description': 'Recipe not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        }
    }
})
def update_recipe_view(id_recipe):
    return update_recipe(id_recipe)


@recipe_bp.route('/delete/<int:id_recipe>', methods=['DELETE'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Delete Existing Recipe',
    'description': 'Delete an existing recipe by its ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'id_recipe',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Recipe ID'
        }
    ],
    'responses': {
        200: {
            'description': 'Recipe deleted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'}
                }
            }
        },
        403: {
            'description': 'Unauthorized',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'Recipe not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'}
                }
            }
        }
    }
})
def delete_recipe_view(id_recipe):
    return delete_recipe(id_recipe)


@recipe_bp.route('/<int:recipe_id>/favourite', methods=['POST'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Toggle Favourite Recipe',
    'description': 'Toggle favourite status for a recipe',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'recipe_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the recipe to toggle favourite status'
        }
    ],
    'responses': {
        200: {
            'description': 'Favourite status toggled successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'is_favourite': {'type': 'boolean'}
                }
            }
        },
        404: {
            'description': 'Recipe not found'
        }
    }
})
def toggle_favourite_view(recipe_id):
    return toggle_favourite_recipe(recipe_id)

@recipe_bp.route('/favourites', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Favourite Recipes',
    'description': 'Get all favourite recipes for current user',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 1,
            'description': 'Page number'
        },
        {
            'name': 'limit',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 10,
            'description': 'Items per page'
        }
    ],
    'responses': {
        200: {
            'description': 'List of favourite recipes retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'recipes': {'type': 'array'},
                    'total': {'type': 'integer'},
                    'pages': {'type': 'integer'},
                    'current_page': {'type': 'integer'}
                }
            }
        }
    }
})
def get_user_favourites():
    return get_favourite_recipes()

@recipe_bp.route('/contributions', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get User Contributions',
    'description': 'Get all recipe contributions for current user',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 1,
            'description': 'Page number'
        },
        {
            'name': 'limit',
            'in': 'query',
            'type': 'integer',
            'required': False,
            'default': 10,
            'description': 'Items per page'
        }
    ],
    'responses': {
        200: {
            'description': 'List of user contributions retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'contributions': {'type': 'array'},
                    'total': {'type': 'integer'},
                    'pages': {'type': 'integer'},
                    'current_page': {'type': 'integer'}
                }
            }
        }
    }
})
def get_user_contributions_view():
    return get_user_contributions()

@recipe_bp.route('/unaccepted_recipes', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Total Unaccepted Recipes',
    'description': 'Get the total number of unaccepted recipes',
    'responses': {
        200: {
            'description': 'Total number of unaccepted recipes retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'total_unaccepted_recipes': {'type': 'integer'}
                }
            }
        }
    }
})
def get_total_unaccepted_recipes_view():
    return get_total_unaccepted_recipes()

@recipe_bp.route('/unaccepted_recipes_list', methods=['GET'])
@swag_from({
    'tags': ['Recipes'],
    'summary': 'Get Unaccepted Recipes List',
    'description': 'Get detailed information about all unaccepted recipes',
    'responses': {
        200: {
            'description': 'List of unaccepted recipes retrieved successfully',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id_recipe': {'type': 'integer'},
                        'name_recipe': {'type': 'string'},
                        'image': {'type': 'string'},
                        'type': {'type': 'string'},
                        'status': {'type': 'string'},
                        'summary': {'type': 'string'},
                        'ingredients': {'type': 'array'},
                        'nutrition': {'type': 'object'},
                        'vitamins': {'type': 'array'},
                        'steps': {'type': 'array'}
                    }
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
def get_unaccepted_recipes_view():
    return get_unaccepted_recipes()