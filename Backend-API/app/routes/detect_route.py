# app/routes/detect.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.controllers.detect_controller import (
    detect_recommend_spoonacular,
    get_recipe_instructions,
    recommend_recipes_by_labels,
    get_daily_meal_plan,
    detect_objects,
    recommend_recipes_spoonacular,
    detect_food_roboflow,
    save_scanned_recipe,
    toggle_spoonacular_favourite,
    get_all_favourites,
    get_spoonacular_recommendations_v2,
)
from flasgger import swag_from

detect_bp = Blueprint('detect', __name__)

@detect_bp.route('/detect-objects', methods=['POST'])
@swag_from({
    'tags': ['Detection'],
    'summary': 'Detect Objects from an Image',
    'description': 'Use YOLO model to detect objects in an uploaded image.',
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'image',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'Image file for object detection'
        }
    ],
    'responses': {
        200: {
            'description': 'Detection results',
            'schema': {
                'type': 'object',
                'properties': {
                    'detected_objects': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        },
        400: {
            'description': 'Bad request or unsupported file type'
        },
        500: {
            'description': 'Internal server error during processing'
        }
    }
})
def detect_objects_view():
    return detect_objects()


@detect_bp.route('/recommend-recipes-spoonacular', methods=['POST'])
@swag_from({
    'tags': ['Recommendation'],
    'summary': 'Recommend Recipes based on Detected Objects',
    'description': 'Recommend recipes using Spoonacular API based on detected objects.',
    'consumes': ['application/json'],
    'parameters': [
        {
            'name': 'detected_objects',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'detected_objects': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Recommendation results',
            'schema': {
                'type': 'object',
                'properties': {
                    'recommendations': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'title': {'type': 'string'},
                                'image': {'type': 'string'},
                                'calories': {'type': 'string'},
                                'summary': {'type': 'string'},
                                'sourceUrl': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Bad request - Invalid detected objects'
        },
        401: {
            'description': 'Unauthorized - Missing or invalid token'
        },
        500: {
            'description': 'Internal server error during processing'
        }
    }
})
def recommend_recipes_view():
    return recommend_recipes_spoonacular()


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


@detect_bp.route('/detect-food-roboflow', methods=['POST'])
def detect_food_roboflow_view():
    """Detect Food via Roboflow and Recommend Recipes
    ---
    tags:
      - Detection
    summary: Scan Food with Roboflow + Spoonacular
    description: >
      Phát hiện món ăn từ ảnh qua Roboflow Serverless API,
      sau đó tìm kiếm công thức liên quan qua Spoonacular (trả về
      nutrients, ingredients, instructions đầy đủ).
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer <JWT token>"
      - name: image
        in: formData
        type: file
        required: true
        description: Ảnh món ăn cần nhận diện
    responses:
      200:
        description: Kết quả phát hiện và đề xuất công thức
      400:
        description: Thiếu ảnh hoặc định dạng không hợp lệ
      401:
        description: Chưa đăng nhập
      500:
        description: Lỗi server
    """
    return detect_food_roboflow()


@detect_bp.route('/save-recipe', methods=['POST'])
def save_recipe_view():
    """Save Scanned Recipe to Diary
    ---
    tags:
      - Detection
    summary: Lưu công thức từ scan vào diary_entry và user_daily_log
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [title]
          properties:
            title:     {type: string}
            calories:  {type: number}
            protein:   {type: number}
            carbs:     {type: number}
            fat:       {type: number}
            image:     {type: string}
            meal_type: {type: string, example: lunch}
            entry_date:{type: string, example: "2026-06-01"}
    responses:
      201:
        description: Đã lưu thành công
      400:
        description: Thiếu title
    """
    return save_scanned_recipe()


@detect_bp.route('/favourite', methods=['POST'])
def toggle_favourite_view():
    """Toggle Spoonacular Recipe Favourite
    ---
    tags:
      - Detection
    summary: Thêm hoặc xóa recipe khỏi danh sách yêu thích
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [spoonacular_id]
          properties:
            spoonacular_id: {type: integer}
            title:          {type: string}
            image:          {type: string}
    responses:
      200:
        description: Đã xóa khỏi favourites
      201:
        description: Đã thêm vào favourites
    """
    return toggle_spoonacular_favourite()


@detect_bp.route('/favourites', methods=['GET'])
def get_favourites_view():
    """Get All User Favourites
    ---
    tags:
      - Detection
    summary: Lấy tất cả favourite của user (nội bộ + Spoonacular)
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
    responses:
      200:
        description: Danh sách favourites
      401:
        description: Chưa đăng nhập
    """
    return get_all_favourites()

@detect_bp.route('/recommend-paginated', methods=['GET'])
def recommend_paginated_view():
    """Get Paginated Spoonacular Recommendations"""
    return get_spoonacular_recommendations_v2()
