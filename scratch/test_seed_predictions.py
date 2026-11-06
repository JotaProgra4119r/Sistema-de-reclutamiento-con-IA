import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend"))

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from motor_ml import procesar_freelancers_bytes, MAPEO_CLUSTER_NEGOCIO

f_path = os.path.join(os.path.dirname(__file__), "..", "Datasets", "freelancers_dev.csv")
with open(f_path, "rb") as f:
    df_base, _ = procesar_freelancers_bytes(f.read())

num_cols = df_base.select_dtypes(include=['float64', 'int64']).columns
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_base[num_cols])

km = KMeans(n_clusters=4, random_state=42, n_init=10)
km.fit(X_scaled)

candidatos_prueba = [
    # CANDIDATO 1: Sofía Isabel -> Executive (Clúster 1)
    {
        "nombres": "Sofía Isabel Mendoza",
        "features": {
            "ingresos_totales": 52000.0,
            "anios_experiencia": 11.5,
            "tiempo_respuesta_horas": 5.0,
            "tasa_finalizacion": 92.0,
            "clientes_recurrentes": 14.0,
            "horas_trabajadas_mes": 65.0
        }
    },
    # CANDIDATO 2: Carlos Eduardo -> Soporte Operativo / Alta Intensidad (Clúster 2)
    {
        "nombres": "Carlos Eduardo Gómez",
        "features": {
            "ingresos_totales": 2100.0,
            "anios_experiencia": 1.2,
            "tiempo_respuesta_horas": 28.0,
            "tasa_finalizacion": 52.0,
            "clientes_recurrentes": 2.0,
            "horas_trabajadas_mes": 42.0
        }
    },
    # CANDIDATO 3: Ana Lucía -> Talento Inicial / En Desarrollo (Clúster 0)
    {
        "nombres": "Ana Lucía Hernández",
        "features": {
            "ingresos_totales": 31000.0,
            "anios_experiencia": 7.2,
            "tiempo_respuesta_horas": 2.5,
            "tasa_finalizacion": 94.0,
            "clientes_recurrentes": 35.0,
            "horas_trabajadas_mes": 148.0
        }
    },
    # CANDIDATO 4: Fernando José -> Especialista Intermedio Estable (Clúster 3)
    {
        "nombres": "Fernando José Vásquez",
        "features": {
            "ingresos_totales": 8300.0,
            "anios_experiencia": 3.2,
            "tiempo_respuesta_horas": 7.5,
            "tasa_finalizacion": 80.0,
            "clientes_recurrentes": 11.0,
            "horas_trabajadas_mes": 90.0
        }
    },
    # CANDIDATO 5: Mariana Elizabeth -> Executive (Clúster 1)
    {
        "nombres": "Mariana Elizabeth Rios",
        "features": {
            "ingresos_totales": 48500.0,
            "anios_experiencia": 10.8,
            "tiempo_respuesta_horas": 5.2,
            "tasa_finalizacion": 90.0,
            "clientes_recurrentes": 13.0,
            "horas_trabajadas_mes": 62.0
        }
    }
]

print("--- CLASIFICACIÓN DE CANDIDATOS SEMILLA ---")
for c in candidatos_prueba:
    df_cand = pd.DataFrame([c["features"]])[num_cols]
    sc_cand = scaler.transform(df_cand)
    pred = int(km.predict(sc_cand)[0])
    etiqueta = MAPEO_CLUSTER_NEGOCIO.get(pred, {})['etiqueta']
    print(f"\n{c['nombres']} -> CLÚSTER {pred}: {etiqueta}")
