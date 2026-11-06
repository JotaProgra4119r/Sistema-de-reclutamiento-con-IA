import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend"))

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from motor_ml import procesar_freelancers_bytes, MAPEO_CLUSTER_NEGOCIO

f_path = os.path.join(os.path.dirname(__file__), "..", "Datasets", "freelancers_dev.csv")
with open(f_path, "rb") as f:
    df, stats = procesar_freelancers_bytes(f.read())

num_cols = df.select_dtypes(include=['float64', 'int64']).columns
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[num_cols])

km = KMeans(n_clusters=4, random_state=42, n_init=10)
df['segmento'] = km.fit_predict(X_scaled)

print("--- PROMEDIOS POR SEGMENTO EN DATASET ---")
for seg in sorted(df['segmento'].unique()):
    sub = df[df['segmento'] == seg]
    print(f"\nCLÚSTER {seg}: {MAPEO_CLUSTER_NEGOCIO.get(seg, {})['etiqueta']}")
    print(f"Cantidad: {len(sub)}")
    print(sub[num_cols].mean().round(2).to_dict())
