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

cands = [
    ("Sofía", {"proyectos_completados": 14*4 + 2*3, "ingresos_totales": 4500*12, "tarifa_hora_promedio": 4500/65, "anios_experiencia": 11.5, "tiempo_respuesta_horas": 2.5, "tasa_finalizacion": 92.0, "calificacion_promedio": 4.9, "clientes_recurrentes": 14, "horas_trabajadas_mes": 65}),
    ("Carlos", {"proyectos_completados": 2*4 + 1*3, "ingresos_totales": 175*12, "tarifa_hora_promedio": 175/42, "anios_experiencia": 1.2, "tiempo_respuesta_horas": 2.5, "tasa_finalizacion": 52.0, "calificacion_promedio": 2.6, "clientes_recurrentes": 2, "horas_trabajadas_mes": 42}),
    ("Ana Lucía", {"proyectos_completados": 35*4 + 1*3, "ingresos_totales": 2583.33*12, "tarifa_hora_promedio": 2583.33/148, "anios_experiencia": 7.2, "tiempo_respuesta_horas": 2.5, "tasa_finalizacion": 94.0, "calificacion_promedio": 4.7, "clientes_recurrentes": 35, "horas_trabajadas_mes": 148}),
    ("Fernando", {"proyectos_completados": 11*4 + 1*3, "ingresos_totales": 691.67*12, "tarifa_hora_promedio": 691.67/90, "anios_experiencia": 3.2, "tiempo_respuesta_horas": 2.5, "tasa_finalizacion": 80.0, "calificacion_promedio": 4.0, "clientes_recurrentes": 11, "horas_trabajadas_mes": 90}),
    ("Mariana", {"proyectos_completados": 13*4 + 1*3, "ingresos_totales": 4041.67*12, "tarifa_hora_promedio": 4041.67/62, "anios_experiencia": 10.8, "tiempo_respuesta_horas": 2.5, "tasa_finalizacion": 90.0, "calificacion_promedio": 4.8, "clientes_recurrentes": 13, "horas_trabajadas_mes": 62})
]

raw_preds = {}
for name, d in cands:
    s = scaler.transform(pd.DataFrame([d])[numeric_cols])
    p = int(km.predict(s)[0])
    raw_preds[name] = p
    print(f"{name} raw pred: {p}")

print("\nRaw cluster counts:")
print(pd.Series(km.labels_).value_counts())
