import os

def create_structure():
    base_path = r"C:\Users\majop\Documents\OLC2_EJ26_ML_-45-1\OLC2_EJ26_ML_-45\backend"
    folders = [
        "core",
        "models",
        "routers",
        "services"
    ]
    for folder in folders:
        os.makedirs(os.path.join(base_path, folder), exist_ok=True)
    
    # Create empty __init__.py files
    for folder in folders:
        with open(os.path.join(base_path, folder, "__init__.py"), "w") as f:
            pass
    with open(os.path.join(base_path, "main.py"), "w") as f:
        pass

create_structure()
