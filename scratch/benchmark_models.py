import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

# Cargar dataset
BASE_DIR = r"C:\Users\majop\Documents\OLC2_EJ26_ML_-45-1\Proyectito"
csv_path = os.path.join(BASE_DIR, "Datasets", "freelancers_dev.csv")
df = pd.read_csv(csv_path)

cols_num = [
    'proyectos_completados', 'ingresos_totales', 'tarifa_hora_promedio',
    'anios_experiencia', 'tiempo_respuesta_horas', 'tasa_finalizacion',
    'calificacion_promedio', 'clientes_recurrentes', 'horas_trabajadas_mes'
]

# Limpiar y convertir a numérico
for col in cols_num:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').astype(float)
        df[col] = df[col].fillna(df[col].median())

X = df[cols_num].values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"Dataset shape: {X_scaled.shape}")
print("=" * 80)
print(f"{'Algoritmo':<18} | {'k':<3} | {'Silhouette':<15} | {'Davies-Bouldin':<18} | {'Calinski-Harabasz':<20}")
print("=" * 80)

results = []

# Probar K-Means
for k in range(2, 7):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    sil = silhouette_score(X_scaled, labels)
    db = davies_bouldin_score(X_scaled, labels)
    ch = calinski_harabasz_score(X_scaled, labels)
    results.append({"algo": "K-Means", "k": k, "sil": sil, "db": db, "ch": ch})
    print(f"{'K-Means':<18} | {k:<3} | {sil:<15.4f} | {db:<18.4f} | {ch:<20.2f}")

print("-" * 80)
# Probar Jerárquico (Agglomerative)
for k in range(2, 7):
    agg = AgglomerativeClustering(n_clusters=k, linkage='ward')
    labels = agg.fit_predict(X_scaled)
    sil = silhouette_score(X_scaled, labels)
    db = davies_bouldin_score(X_scaled, labels)
    ch = calinski_harabasz_score(X_scaled, labels)
    results.append({"algo": "Jerárquico (Ward)", "k": k, "sil": sil, "db": db, "ch": ch})
    print(f"{'Jerárquico (Ward)':<18} | {k:<3} | {sil:<15.4f} | {db:<18.4f} | {ch:<20.2f}")

print("-" * 80)
# Probar GMM
for k in range(2, 7):
    gmm = GaussianMixture(n_components=k, random_state=42)
    labels = gmm.fit_predict(X_scaled)
    sil = silhouette_score(X_scaled, labels)
    db = davies_bouldin_score(X_scaled, labels)
    ch = calinski_harabasz_score(X_scaled, labels)
    results.append({"algo": "GMM", "k": k, "sil": sil, "db": db, "ch": ch})
    print(f"{'GMM':<18} | {k:<3} | {sil:<15.4f} | {db:<18.4f} | {ch:<20.2f}")

print("-" * 80)
# Probar DBSCAN con varios eps y min_samples
for eps in [1.5, 2.0, 2.5, 3.0]:
    for ms in [5, 10, 15]:
        dbscan = DBSCAN(eps=eps, min_samples=ms)
        labels = dbscan.fit_predict(X_scaled)
        n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise_ = list(labels).count(-1)
        if n_clusters_ > 1:
            valid_mask = labels != -1
            if sum(valid_mask) > n_clusters_:
                sil = silhouette_score(X_scaled[valid_mask], labels[valid_mask])
                db = davies_bouldin_score(X_scaled[valid_mask], labels[valid_mask])
                ch = calinski_harabasz_score(X_scaled[valid_mask], labels[valid_mask])
                print(f"{f'DBSCAN(e={eps},m={ms})':<18} | {n_clusters_:<3} | {sil:<15.4f} | {db:<18.4f} | {ch:<20.2f} (Ruido: {n_noise_})")

print("=" * 80)
