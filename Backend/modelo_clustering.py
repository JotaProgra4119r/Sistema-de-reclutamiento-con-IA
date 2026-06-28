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

def generar_reporte_pdf(df_datos: pd.DataFrame = None, tipo_dataset: str = "freelancers", vectorizer=None):
    """
    Genera un archivo PDF en la memoria RAM con las gráficas de dispersión (PCA)
    tanto para Freelancers como para Reseñas. Evita PDFs vacíos o corruptos.
    """
    pdf_buffer = io.BytesIO()
    
    # 1. Abrimos el gestor de páginas del PDF
    with PdfPages(pdf_buffer) as pdf:
        if df_datos is not None and 'segmento' in df_datos.columns:
            fig, ax = plt.subplots(figsize=(8, 6))
            datos_2d = None
            
            if tipo_dataset.lower() in ["resenas", "reseñas"]:
                # --- PROCESAMIENTO PARA RESEÑAS (NLP) ---
                columna_texto = None
                for col in df_datos.columns:
                    if 'texto' in col.lower() or 'rese' in col.lower():
                        columna_texto = col
                        break
                
                if not columna_texto and len(df_datos.columns) > 0:
                    columna_texto = df_datos.columns[0]
                
                if columna_texto:
                    # Si no pasaron el vectorizador entrenado, creamos uno rápido de respaldo
                    if vectorizer is None:
                        from sklearn.feature_extraction.text import TfidfVectorizer
                        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
                        X_vectorized = vectorizer.fit_transform(df_datos[columna_texto].astype(str)).toarray()
                    else:
                        X_vectorized = vectorizer.transform(df_datos[columna_texto].astype(str)).toarray()
                    
                    pca = PCA(n_components=2)
                    datos_2d = pca.fit_transform(X_vectorized)
            else:
                # --- PROCESAMIENTO PARA FREELANCERS (TABULAR) ---
                num_cols = df_datos.select_dtypes(include=['float64', 'int64']).columns.drop('segmento', errors='ignore')
                if len(num_cols) >= 2:
                    pca = PCA(n_components=2)
                    datos_2d = pca.fit_transform(df_datos[num_cols])
            
            # Dibujamos en la figura si los datos reducidos existen
            if datos_2d is not None:
                scatter = ax.scatter(datos_2d[:, 0], datos_2d[:, 1], c=df_datos['segmento'], cmap='viridis', alpha=0.7)
                titulo = f"Dispersión de Segmentos de {tipo_dataset.capitalize()} (PCA)"
                ax.set_title(titulo, fontsize=14, pad=15)
                ax.set_xlabel("Componente Principal 1", fontsize=10)
                ax.set_ylabel("Componente Principal 2", fontsize=10)
                fig.colorbar(scatter, ax=ax, label="Segmento Asignado")
                fig.text(0.1, 0.02, "Nota: Los segmentos muestran la agrupación estructural de los datos.", fontsize=9, style='italic')
                pdf.savefig(fig, bbox_inches="tight")
            else:
                # Página de respaldo por si el dataset vino vacío o sin columnas correctas
                ax.text(0.5, 0.5, f"No se encontraron suficientes datos válidos\npara el reporte de {tipo_dataset}.", 
                        ha='center', va='center', fontsize=12)
                pdf.savefig(fig, bbox_inches="tight")
            
            plt.close(fig)
            
    # 🌟 EL ARREGLO CLAVE: Fuera del bloque 'with', garantizando que los bytes ya estén escritos y cerrados
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
        return DBSCAN(eps=0.5, min_samples=3)
    elif "JERÁRQUICO" in alg or "JERARQUICO" in alg or "AGGLOMERATIVE" in alg:
        return AgglomerativeClustering(n_clusters=n_clusters)
    elif "GMM" in alg or "MIXTURE" in alg:
        return GaussianMixture(n_components=n_clusters, random_state=random_state)
    else:
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
    
    columna_texto = None
    for col in df_procesado.columns:
        if 'texto' in col.lower() or 'rese' in col.lower():
            columna_texto = col
            break
            
    if not columna_texto and len(df_procesado.columns) > 0:
        columna_texto = df_procesado.columns[0]
        
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X_vectorized = vectorizer.fit_transform(df_procesado[columna_texto].astype(str))
    
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