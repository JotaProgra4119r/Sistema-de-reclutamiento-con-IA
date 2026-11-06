import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

df = pd.read_csv('Backend/freelancers_dev.csv')
numeric_cols = [
    'proyectos_completados', 'ingresos_totales', 'tarifa_hora_promedio',
    'anios_experiencia', 'tiempo_respuesta_horas', 'tasa_finalizacion',
    'calificacion_promedio', 'clientes_recurrentes', 'horas_trabajadas_mes'
]
for col in numeric_cols:
    s = pd.to_numeric(df[col], errors='coerce').astype(float)
    df[col] = s.fillna(s.median())

scaler = StandardScaler()
X = scaler.fit_transform(df[numeric_cols])
km = KMeans(n_clusters=4, random_state=42, n_init=10).fit(X)
df['cluster'] = km.labels_
for cl in range(4):
    sub = df[df['cluster'] == cl]
    print(f"=== CLUSTER {cl} (n={len(sub)}) ===")
    print("  Ingresos:", round(sub['ingresos_totales'].mean(), 1))
    print("  Tarifa:", round(sub['tarifa_hora_promedio'].mean(), 1))
    print("  Años Exp:", round(sub['anios_experiencia'].mean(), 1))
    print("  Horas Mes:", round(sub['horas_trabajadas_mes'].mean(), 1))
    print("  Proyectos:", round(sub['proyectos_completados'].mean(), 1))
    print("  Metas/Tasa:", round(sub['tasa_finalizacion'].mean(), 1))
    print("  Calificacion:", round(sub['calificacion_promedio'].mean(), 2))
