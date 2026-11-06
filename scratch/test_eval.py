import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend"))
from motor_ml import procesar_freelancers_bytes, entrenar_y_segmentar, obtener_significado_negocio
from base_datos import SessionLocal, Candidato
import pandas as pd

csv_path = os.path.join(os.path.dirname(__file__), "..", "Backend", "freelancers_dev.csv")
with open(csv_path, 'rb') as f:
    df, stats = procesar_freelancers_bytes(f.read())

print("Column dtypes in df:")
for col in df.columns:
    print(f"  {col}: {df[col].dtype}")
