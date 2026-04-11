import os
import re

input_file = r"d:\Education\Food-recognition-app\final_db.sql"
output_file = r"d:\Education\Food-recognition-app\final_db_postgres.sql"

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Loại bỏ các comment và lệnh của riêng MySQL
content = re.sub(r'/\*!.*?\*/;', '', content, flags=re.DOTALL)
content = re.sub(r'/\*!.*?\*/', '', content, flags=re.DOTALL)
content = re.sub(r'^--.*$', '', content, flags=re.MULTILINE)

# 2. Thay thế backtick (`) bằng dấu nháy kép (")
content = content.replace('`', '"')

# 3. Chuyển đổi kiểu dữ liệu
content = re.sub(r'\bint NOT NULL AUTO_INCREMENT\b', 'SERIAL NOT NULL', content)
content = re.sub(r'\bint AUTO_INCREMENT\b', 'SERIAL', content)
content = re.sub(r'\btinyint\(\d+\)', 'SMALLINT', content)
content = re.sub(r'\bdatetime\b', 'TIMESTAMP', content)

# 4. Loại bỏ các options của MySQL
content = content.replace('CHARACTER SET utf8mb4 COLLATE utf8mb4_bin', '')
content = content.replace('CHARACTER SET utf8mb4', '')
content = content.replace('USING BTREE', '')
content = re.sub(r'\) ENGINE=InnoDB.*?;', ');', content)

# 5. Xử lý các Index/Key bên trong khối CREATE TABLE
lines = content.split('\n')
out = []
create_table_name = None
indexes = []
foreign_keys = []

for line in lines:
    stripped = line.strip()
    if not stripped:
        continue
    if stripped.startswith('LOCK TABLES') or stripped.startswith('UNLOCK TABLES') or stripped.startswith('SET '):
        continue
        
    if stripped.startswith('DROP TABLE'):
        line = line.replace('DROP TABLE IF EXISTS ', 'DROP TABLE IF EXISTS ') 
        line = line.replace(';', ' CASCADE;')
        out.append(line)
        continue
        
    m = re.match(r'CREATE TABLE "(.*?)"', stripped)
    if m:
        create_table_name = m.group(1)
        out.append(line)
        continue
        
    if create_table_name:
        # Tách Foreign Keys ra riêng chạy sau cùng
        m_fk = re.search(r'CONSTRAINT (.*)', stripped)
        if m_fk:
            constraint_str = m_fk.group(1)
            # Remove trailing comma
            if constraint_str.endswith(','):
                 constraint_str = constraint_str[:-1]
            foreign_keys.append(f'ALTER TABLE "{create_table_name}" ADD CONSTRAINT {constraint_str};')
            continue

        # Match KEY "idx_name" ("col_name")
        m_idx = re.search(r'KEY "(.*?)" \("(.*?)"\)', stripped)
        if m_idx and not stripped.startswith('UNIQUE') and not stripped.startswith('PRIMARY') and not stripped.startswith('FOREIGN'):
            idx_name = m_idx.group(1)
            col_name = m_idx.group(2)
            indexes.append(f'CREATE INDEX "{create_table_name}_{idx_name}_idx" ON "{create_table_name}" ("{col_name}");')
            continue 
            
        m_uniq = re.search(r'UNIQUE KEY "(.*?)" \("(.*?)"\)', stripped)
        if m_uniq:
            line_has_comma = ',' if ',' in stripped else ''
            line = f'  UNIQUE ("{m_uniq.group(2)}"){line_has_comma}'

        if stripped == ');':
            create_table_name = None

    out.append(line)
    
text = '\n'.join(out)
# Khắc phục lỗi dấu phẩy cuối cùng
text = re.sub(r',\s*\)', '\n)', text)

text += '\n\n-- Indexes\n' + '\n'.join(indexes) + '\n'
text += '\n\n-- Foreign Keys\n' + '\n'.join(foreign_keys) + '\n'

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Done!")
