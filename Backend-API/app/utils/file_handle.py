import json
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JSON_PATH = 'recommend-dataset/recipes.json'
CSV_PATH = 'recommend-dataset/recipes.json'
JSON_FULL_PATH = os.path.join(BASE_DIR, JSON_PATH)
CSV_FULL_PATH = os.path.join(BASE_DIR, CSV_PATH)

def convertJsonToCSV():
# Đọc dữ liệu JSON từ file
    with open(JSON_FULL_PATH, 'r', encoding='utf-8') as f:
        recipes = json.load(f)

    # Chuyển đổi JSON thành DataFrame, "normalize" giúp mở rộng cột nutrition
    df = pd.json_normalize(recipes)

    # Lưu DataFrame thành file CSV
    df.to_csv(CSV_FULL_PATH, index=False, encoding='utf-8')

    print("Dataset đã được chuyển đổi và lưu thành file recipes.csv")

