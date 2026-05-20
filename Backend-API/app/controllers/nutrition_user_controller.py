from app.models.model import User, UserDailyNutritionGoal
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app import db


def _calc_macros(calories_goal, weight_kg):
    """
    Tính Protein, Fat, Carb theo công thức tài liệu:
      - Protein : weight_kg × 2.0 g  (mức trung bình)  → calo = g × 4
      - Fat     : 25% tổng calo                         → g   = calo / 9
      - Carb    : phần calo còn lại                     → g   = calo / 4
    """
    if not calories_goal:
        return None, None, None

    # Protein
    protein_g   = round((weight_kg or 60) * 2.0, 1)
    protein_cal = protein_g * 4

    # Fat
    fat_cal = calories_goal * 0.25
    fat_g   = round(fat_cal / 9, 1)

    # Carb (phần còn lại)
    carb_cal = calories_goal - protein_cal - fat_cal
    carb_g   = round(carb_cal / 4, 1) if carb_cal > 0 else 0

    return round(protein_g, 1), round(fat_g, 1), round(carb_g, 1)


@jwt_required()
def update_calories():
    data = request.get_json()
    calories_goal = data.get('calories_goal')

    # Lấy user_id từ JWT token
    id_user = get_jwt_identity()

    # Lấy weight của user để tính protein
    user = User.query.filter_by(id_user=id_user).first()
    weight_kg = user.weight if user else None

    # Tính macros theo công thức
    protein_g, fat_g, carb_g = _calc_macros(calories_goal, weight_kg)

    # Kiểm tra xem người dùng có mục tiêu dinh dưỡng chưa
    nutrition_goal = UserDailyNutritionGoal.query.filter_by(id_user=id_user).first()

    if nutrition_goal:
        nutrition_goal.calories_goal      = calories_goal
        nutrition_goal.protein_goal       = protein_g
        nutrition_goal.fat_goal           = fat_g
        nutrition_goal.carbohydrate_goal  = carb_g
        db.session.commit()
        return jsonify({"msg": "Calories goal updated successfully."}), 200
    else:
        new_goal = UserDailyNutritionGoal(
            id_user          = id_user,
            calories_goal    = calories_goal,
            protein_goal     = protein_g,
            fat_goal         = fat_g,
            carbohydrate_goal= carb_g,
        )
        db.session.add(new_goal)
        db.session.commit()
        return jsonify({"msg": "Calories goal created successfully."}), 201


@jwt_required()
def get_calories_goal():
    id_user = get_jwt_identity()

    nutrition_goal = UserDailyNutritionGoal.query.filter_by(id_user=id_user).first()

    if nutrition_goal:
        return jsonify({
            "calories_goal":    nutrition_goal.calories_goal,
            "protein_goal":     nutrition_goal.protein_goal,
            "fat_goal":         nutrition_goal.fat_goal,
            "carbohydrate_goal": nutrition_goal.carbohydrate_goal,
        }), 200
    else:
        return jsonify({"msg": "No calories goal found for this user."}), 404
