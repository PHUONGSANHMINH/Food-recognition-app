# app/routes/detect.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.controllers.detect_controller import (
    detect_recommend_spoonacular,
    get_recipe_instructions,
    recommend_recipes_by_labels,
    get_daily_meal_plan
)
from flasgger import swag_from

detect_bp = Blueprint('detect', __name__)

@detect_bp.route('/detect-recommend-spoonacular', methods=['POST'])
def detect_and_recommend_view():
    """
    Detect and Recommend Recipes
    ---
    tags:
      - Detection
    summary: Detect and Recommend Recipes
    description: Detect objects from an image and recommend recipes based on detected ingredients.
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token for authorization
        example: "Bearer <YourJWTToken>"
      - name: image
        in: formData
        type: file
        required: true
        description: Image file for object detection
    responses:
      200:
        description: Detection and recommendation results
        schema:
          type: object
          properties:
            detected_objects:
              type: array
              items:
                type: string
            recommendations:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  title:
                    type: string
                  image:
                    type: string
                  calories:
                    type: string
                  summary:
                    type: string
                  sourceUrl:
                    type: string
      400:
        description: Bad request or unsupported file type
      401:
        description: Unauthorized - Missing or invalid token
      500:
        description: Internal server error during processing
    """
    return detect_recommend_spoonacular()


@detect_bp.route('/get-recipe-instructions/<int:recipe_id>', methods=['GET'])
def get_instructions_view(recipe_id):
    """Get Recipe Instructions
    ---
    tags:
      - Detection
    summary: Get Recipe Instructions
    description: Retrieve step-by-step cooking instructions for a specified recipe ID.
    parameters:
      - name: recipe_id
        in: path
        required: true
        schema:
          type: integer
          example: 12345
        description: Unique identifier of the recipe.
    responses:
      200:
        description: Instructions retrieved successfully.
        content:
          application/json:
            schema:
              type: object
              properties:
                recipe_id:
                  type: integer
                instructions:
                  type: array
                  items:
                    type: object
                    properties:
                      step_number:
                        type: integer
                      instruction:
                        type: string
                      ingredients:
                        type: array
                        items:
                          type: string
                      equipment:
                        type: array
                        items:
                          type: string
      404:
        description: Recipe not found.
    """
    return get_recipe_instructions(recipe_id)

@detect_bp.route('/recommend-by-keyword/<string:keyword>', methods=['GET'])
def recommend_by_keyword_view(keyword):
    """Recommend Recipes by Keyword
    ---
    tags:
      - Detection
    summary: Recommend Recipes by Keyword
    description: Recommend recipes based on a keyword (ingredient or recipe type).
    parameters:
      - name: keyword
        in: path
        required: true
        schema:
          type: string
          example: "chicken"
        description: Keyword used to find relevant recipes.
    responses:
      200:
        description: List of recommended recipes based on the keyword.
        content:
          application/json:
            schema:
              type: array
              items:
                type: object
                properties:
                  id_recipe:
                    type: integer
                  name_recipe:
                    type: string
                  summary:
                    type: string
                  ingredients:
                    type: array
                    items:
                      type: string
      400:
        description: Bad request - Invalid keyword.
    """
    return recommend_recipes_by_labels([keyword])

@detect_bp.route('/daily-meal-plan', methods=['GET'])
@swag_from({
    'tags': ['Meal Planning'],
    'summary': 'Get Daily Meal Plan',
    'security': [{'Bearer': []}],
    'description': 'Generate a nutritious meal plan for one day ensuring sufficient calorie intake.',
    'responses': {
        200: {
            'description': 'Daily meal plan generated successfully.',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'daily_meal_plan': {
                                'type': 'object',
                                'properties': {
                                    'breakfast': {
                                        'type': 'object',
                                        'properties': {
                                            'recipe': {'type': 'string'},
                                            'ingredients': {'type': 'string'},
                                            'calories': {'type': 'number'},
                                            'protein': {'type': 'number'},
                                            'carbohydrates': {'type': 'number'},
                                            'fat': {'type': 'number'},
                                            'sugar': {'type': 'number'}
                                        }
                                    },
                                    'lunch': {
                                        'type': 'object',
                                        'properties': {
                                            'recipe': {'type': 'string'},
                                            'ingredients': {'type': 'string'},
                                            'calories': {'type': 'number'},
                                            'protein': {'type': 'number'},
                                            'carbohydrates': {'type': 'number'},
                                            'fat': {'type': 'number'},
                                            'sugar': {'type': 'number'}
                                        }
                                    },
                                    'dinner': {
                                        'type': 'object',
                                        'properties': {
                                            'recipe': {'type': 'string'},
                                            'ingredients': {'type': 'string'},
                                            'calories': {'type': 'number'},
                                            'protein': {'type': 'number'},
                                            'carbohydrates': {'type': 'number'},
                                            'fat': {'type': 'number'},
                                            'sugar': {'type': 'number'}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        401: {
            'description': 'Unauthorized - Missing or invalid token'
        },
        500: {
            'description': 'Internal server error during processing'
        }
    }
})
def daily_meal_plan_view():
    return get_daily_meal_plan()