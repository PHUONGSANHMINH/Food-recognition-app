import json
import pandas as pd

# Đọc dữ liệu JSON từ file
with open('recipes.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

# Chuyển đổi JSON thành DataFrame, "normalize" giúp mở rộng cột nutrition
df = pd.json_normalize(recipes)

# Lưu DataFrame thành file CSV
df.to_csv('recipes.csv', index=False, encoding='utf-8')

print("Dataset đã được chuyển đổi và lưu thành file recipes.csv")
