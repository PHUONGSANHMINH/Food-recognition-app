from datetime import date, datetime
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app import db
from app.models.model import UserDailyLog


# ─── Lấy log hôm nay của user ─────────────────────────────────────────────────
@jwt_required()
def get_today_log():
    id_user = get_jwt_identity()
    today = date.today()

    log = UserDailyLog.query.filter_by(id_user=id_user, log_date=today).first()

    if log:
        return jsonify({
            "log_date":        log.log_date.isoformat(),
            "calories_intake": round(log.calories_intake, 1),
            "protein_intake":  round(log.protein_intake,  1),
            "fat_intake":      round(log.fat_intake,      1),
            "carb_intake":     round(log.carb_intake,     1),
        }), 200
    else:
        # Trả về 0 nếu hôm nay chưa có bản ghi
        return jsonify({
            "log_date":        today.isoformat(),
            "calories_intake": 0,
            "protein_intake":  0,
            "fat_intake":      0,
            "carb_intake":     0,
        }), 200


# ─── Lấy log theo ngày cụ thể (dùng cho DiaryScreen) ─────────────────────────
@jwt_required()
def get_log_by_date():
    id_user = get_jwt_identity()
    date_str = request.args.get('date')  # format: YYYY-MM-DD

    if not date_str:
        return jsonify({"msg": "Missing 'date' query parameter (format: YYYY-MM-DD)."}), 400

    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400

    log = UserDailyLog.query.filter_by(id_user=id_user, log_date=target_date).first()

    if log:
        return jsonify({
            "log_date":        log.log_date.isoformat(),
            "calories_intake": round(log.calories_intake, 1),
            "protein_intake":  round(log.protein_intake,  1),
            "fat_intake":      round(log.fat_intake,      1),
            "carb_intake":     round(log.carb_intake,     1),
        }), 200
    else:
        return jsonify({
            "log_date":        date_str,
            "calories_intake": 0,
            "protein_intake":  0,
            "fat_intake":      0,
            "carb_intake":     0,
        }), 200


# ─── Cộng dồn intake vào log hôm nay ─────────────────────────────────────────
@jwt_required()
def add_to_log():
    id_user = get_jwt_identity()
    today = date.today()
    data = request.get_json()

    calories = float(data.get('calories', 0) or 0)
    protein  = float(data.get('protein',  0) or 0)
    fat      = float(data.get('fat',      0) or 0)
    carbs    = float(data.get('carbs',    0) or 0)

    log = UserDailyLog.query.filter_by(id_user=id_user, log_date=today).first()

    if log:
        # Cộng dồn vào bản ghi hiện có
        log.calories_intake += calories
        log.protein_intake  += protein
        log.fat_intake      += fat
        log.carb_intake     += carbs
        log.updated_at       = datetime.utcnow()
    else:
        # Tạo mới bản ghi cho hôm nay
        log = UserDailyLog(
            id_user         = id_user,
            log_date        = today,
            calories_intake = calories,
            protein_intake  = protein,
            fat_intake      = fat,
            carb_intake     = carbs,
        )
        db.session.add(log)

    db.session.commit()

    return jsonify({
        "msg":             "Log updated successfully.",
        "log_date":        today.isoformat(),
        "calories_intake": round(log.calories_intake, 1),
        "protein_intake":  round(log.protein_intake,  1),
        "fat_intake":      round(log.fat_intake,      1),
        "carb_intake":     round(log.carb_intake,     1),
    }), 200


# ─── Reset log hôm nay về 0 ───────────────────────────────────────────────────
@jwt_required()
def reset_today_log():
    id_user = get_jwt_identity()
    today = date.today()

    log = UserDailyLog.query.filter_by(id_user=id_user, log_date=today).first()

    if log:
        log.calories_intake = 0
        log.protein_intake  = 0
        log.fat_intake      = 0
        log.carb_intake     = 0
        log.updated_at      = datetime.utcnow()
        db.session.commit()

    return jsonify({"msg": "Today's log has been reset to 0."}), 200
