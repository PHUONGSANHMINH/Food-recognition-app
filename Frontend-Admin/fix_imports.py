import os
import glob

# Replace in views (1 folder deep)
for fpath in glob.glob(r'd:\Education\Food-recognition-app\Frontend-Admin\src\views\*.js'):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '@react-native-async-storage/async-storage' in content:
        content = content.replace('import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage', 'import AsyncStorage from "../AsyncStorageHelper";')
        content = content.replace('import AsyncStorage from "@react-native-async-storage/async-storage";', 'import AsyncStorage from "../AsyncStorageHelper";')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

# Replace in components/Navbars and components/Headers (2 folders deep)
for d in ['Navbars', 'Headers']:
    for fpath in glob.glob(fr'd:\Education\Food-recognition-app\Frontend-Admin\src\components\{d}\*.js'):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '@react-native-async-storage/async-storage' in content:
            content = content.replace('import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage', 'import AsyncStorage from "../../AsyncStorageHelper";')
            content = content.replace('import AsyncStorage from "@react-native-async-storage/async-storage";', 'import AsyncStorage from "../../AsyncStorageHelper";')
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Replacement complete.")
