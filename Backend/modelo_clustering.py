import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import io
import numpy as np

def generar_reporte_pdf(df_datos: pd.DataFrame = None, tipo_dataset: str = "freelancers"):
    """
    Genera un archivo PDF en la memoria RAM con las gráficas de dispersión (PCA)
    tanto para Freelancers como para Reseñas.
    """
    pdf_buffer = io.BytesIO()
    
    with PdfPages(pdf_buffer) as pdf:
        if df_datos is not None and 'segmento' in df_datos.columns:
            fig, ax = plt.subplots(figsize=(8, 6))
            
            # Seleccionar columnas numéricas excluyendo el segmento asignado
            num_cols = df_datos.select_dtypes(include=['float64', 'int64']).columns.drop('segmento', errors='ignore')
            
            if len(num_cols) >= 2:
                pca = PCA(n_components=2)
                datos_2d = pca.fit_transform(df_datos[num_cols])
                
                scatter = ax.scatter(datos_2d[:, 0], datos_2d[:, 1], c=df_datos['segmento'], cmap='viridis', alpha=0.7)
                
                titulo = f"Dispersión de Segmentos de {tipo_dataset.capitalize()} (PCA)"
                ax.set_title(titulo, fontsize=14, pad=15)
                ax.set_xlabel("Componente Principal 1", fontsize=10)
                ax.set_ylabel("Componente Principal 2", fontsize=10)
                fig.colorbar(scatter, ax=ax, label="Segmento Asignado")
                
                fig.text(0.1, 0.02, "Nota: Los segmentos más agrupados indican alta similitud en sus patrones estructurales.", fontsize=9, style='italic')
                
                pdf.savefig(fig, bbox_inches="tight")
            plt.close(fig)
            
    pdf_buffer.seek(0)
    return pdf_buffer

def inicializar_algoritmo(algoritmo: str, n_clusters: int, random_state: int = 42):
    """
    Función auxiliar de fábrica para instanciar el algoritmo seleccionado con sus parámetros estándar.
    """
    alg = algoritmo.upper()
    if "K-MEANS" in alg or "KMEANS" in alg:
        return KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    elif "DBSCAN" in alg:
        # Defaults operacionales adaptativos para la escala unificada de datos
        return DBSCAN(eps=0.5, min_samples=3)
    elif "JERÁRQUICO" in alg or "JERARQUICO" in alg or "AGGLOMERATIVE" in alg:
        return AgglomerativeClustering(n_clusters=n_clusters)
    elif "GMM" in alg or "MIXTURE" in alg:
        return GaussianMixture(n_components=n_clusters, random_state=random_state)
    else:
        # Fallback de seguridad
        return KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)

def entrenar_y_segmentar(df, algoritmo="K-Means", n_clusters=4):
    """
    Entrena el modelo de agrupamiento seleccionado para Freelancers (Estructurado).
    """
    df_procesado = df.copy()
    num_cols = df_procesado.select_dtypes(include=['float64', 'int64']).columns
    
    scaler = StandardScaler()
    datos_escalados = scaler.fit_transform(df_procesado[num_cols])
    
    modelo = inicializar_algoritmo(algoritmo, n_clusters)
    
    # Manejo de diferencias en la API de ajuste/predicción de scikit-learn
    if hasattr(modelo, "fit_predict"):
        labels = modelo.fit_predict(datos_escalados)
    else:
        modelo.fit(datos_escalados)
        labels = modelo.predict(datos_escalados)
        
    df_procesado['segmento'] = labels
    return df_procesado, modelo, scaler

def entrenar_y_segmentar_resenas(df, algoritmo="K-Means", n_clusters=4):
    """
    Entrena el modelo de clustering seleccionado para Reseñas usando vectorización TF-IDF.
    """
    df_procesado = df.copy()
    
    # Encontrar dinámicamente la columna que almacena el texto de la reseña
    columna_texto = None
    for col in df_procesado.columns:
        if 'texto' in col.lower() or 'rese' in col.lower():
            columna_texto = col
            break
    if not columna_texto and len(df_procesado.columns) > 0:
        columna_texto = df_procesado.columns[0]
        
    # Aplicar TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X_vectorized = vectorizer.fit_transform(df_procesado[columna_texto].astype(str))
    
    # Convertir matriz dispersa a densa si el algoritmo (como GMM) lo requiere obligatoriamente
    if algoritmo.upper() == "GMM":
        X_input = X_vectorized.toarray()
    else:
        X_input = X_vectorized
        
    modelo = inicializar_algoritmo(algoritmo, n_clusters)
    
    if hasattr(modelo, "fit_predict"):
        labels = modelo.fit_predict(X_input)
    else:
        modelo.fit(X_input)
        labels = modelo.predict(X_input)
        
    df_procesado['segmento'] = labels
    return df_procesado, modelo, vectorizer