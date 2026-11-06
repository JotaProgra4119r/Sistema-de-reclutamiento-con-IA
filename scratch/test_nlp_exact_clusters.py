import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend"))

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from motor_ml import procesar_resenas_bytes, MAPEO_CLUSTER_NEGOCIO, entrenar_y_segmentar_resenas

f_path = os.path.join(os.path.dirname(__file__), "..", "Datasets", "resenas_clientes_dev.csv")
if not os.path.exists(f_path):
    f_path = os.path.join(os.path.dirname(__file__), "..", "Backend", "resenas_clientes_dev.csv")

with open(f_path, "rb") as f:
    df_resenas, _ = procesar_resenas_bytes(f.read())

df_seg, model, vectorizer = entrenar_y_segmentar_resenas(df_resenas, algoritmo="K-Means", n_clusters=4)

textos_prueba = [
    "Perfil emergente en etapa de integración con alto potencial, requiere plan de inducción corporativo, seguimiento quincenal y tutoría continua.",
    "Consultor élite con dirección ejecutiva estratégica sobresaliente, liderazgo en cuentas corporativas, trabajo en equipo impecable y cumplimiento perfecto de metas.",
    "Personal de soporte operacional expuesto a alta carga laboral y fatiga extrema, acumulando demoras en incidencias que requieren redistribución inmediata.",
    "Especialista intermedio confiable de rendimiento estandarizado, caracterizado por puntualidad constante, estabilidad en entregas y buena colaboración."
]

print("--- CLASIFICACIÓN REAL DE FRASES CUALITATIVAS NLP ---")
for t in textos_prueba:
    vec = vectorizer.transform([t])
    pred = int(model.predict(vec)[0])
    mapeo = MAPEO_CLUSTER_NEGOCIO.get(pred, {})
    print(f"\nTexto: '{t[:60]}...'")
    print(f"-> CLÚSTER REAL PREDICHO POR NLP: #{pred} ({mapeo.get('etiqueta')})")
