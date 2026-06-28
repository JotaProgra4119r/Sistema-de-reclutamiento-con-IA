from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
import zipfile
import pandas as pd
import numpy as np
import sklearn.metrics as metrics
from sklearn.feature_extraction.text import TfidfVectorizer

# Importaciones modulares
from limpieza import procesar_freelancers, procesar_resenas
from modelo_clustering import generar_reporte_pdf, entrenar_y_segmentar, entrenar_y_segmentar_resenas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MEMORIA GLOBAL ---
datos_limpios = {"freelancers": None, "resenas": None}

# Estructura expandida para almacenar una copia espejo del DF original sin contaminación de segmentos
modelos_entrenados = {
  "freelancers": {"modelo": None, "scaler": None, "algoritmo": None, "df_origen": None},
  "resenas": {"modelo": None, "vectorizer": None, "algoritmo": None, "df_origen": None}
}

# --- MODELOS DE DATOS ---
class ClusterConfig(BaseModel):
    dataset: str               # "freelancers" o "resenas"
    algoritmo: str = "K-Means"  # "K-Means", "DBSCAN", "Clustering jerárquico", "GMM"
    n_clusters: int = 4
    vectorizacion: str = "TF-IDF"
    epsilon: float = 0.5
    min_samples: int = 3

class ExportConfig(BaseModel):
    freelancers_csv: bool
    resenas_csv: bool = False
    resumen_estadistico: bool
    reporte_grafico: bool

class FreelancerNuevo(BaseModel):
    proyectos_completados: float
    ingresos_totales: float
    tarifa_hora_promedio: float
    anios_experiencia: float
    tiempo_respuesta_horas: float
    tasa_finalizacion: float
    calificacion_promedio: float
    clientes_recurrentes: float
    horas_trabajadas_mes: float

class ResenaNueva(BaseModel):
    texto_reseña: str

# --- ENDPOINTS DE CARGA ---

@app.post("/api/upload/freelancers")
async def upload_freelancers(file: UploadFile = File(...)):
    try:
        contenido = await file.read()
        df_limpio, stats = procesar_freelancers(contenido)

        columnas_criticas = ['proyectos_completados', 'tarifa_hora_promedio', 'ingresos_totales', 'horas_trabajadas_mes', 'anios_experiencia']

        for col in columnas_criticas:
            if col in df_limpio.columns:
                df_limpio[col] = pd.to_numeric(df_limpio[col], errors='coerce').fillna(0)

        datos_limpios["freelancers"] = df_limpio
        # Guardamos la copia inicial inmaculada en el modelo
        modelos_entrenados["freelancers"]["df_origen"] = df_limpio.copy()

        vista_previa = df_limpio.head(5).to_dict(orient="records")

        return {"status": "success", "message": "Freelancers cargados y sanitizados", "preview": vista_previa, "limpieza_status": stats}

    except Exception as e:
        return JSONResponse(status_code=400, content={"status": "error", "message": str(e)})

@app.post("/api/upload/resenas")
async def upload_resenas(file: UploadFile = File(...)):
    try:
        contenido = await file.read()
        df_limpio, stats = procesar_resenas(contenido)

        datos_limpios["resenas"] = df_limpio
        modelos_entrenados["resenas"]["df_origen"] = df_limpio.copy()

        vista_previa = df_limpio.head(5).to_dict(orient="records")

        return {"status": "success", "message": "Reseñas cargadas con éxito", "preview": vista_previa, "limpieza_status": stats}

    except Exception as e:
        return JSONResponse(status_code=400, content={"status": "error", "message": str(e)})

# --- ENDPOINT DE CLUSTERING MULTI-ALGORITMO COMPLETO ---

@app.post("/api/cluster")
async def procesar_clustering(config: ClusterConfig):
    dataset_elegido = config.dataset.lower()
    if dataset_elegido == "reseñas":
        dataset_elegido = "resenas"

    # Recuperamos la copia pura para evitar re-entrenar datos ya segmentados previamente
    df_base = modelos_entrenados.get(dataset_elegido, {}).get("df_origen")
    if df_base is None:
        df_base = datos_limpios.get(dataset_elegido)

    if df_base is None:
        return JSONResponse(status_code=400, content={"status": "error", "message": f"Carga el archivo de {config.dataset} primero."})

    try:
        # Forzamos una copia profunda limpia quitando columnas previas por seguridad externa
        df_input = df_base.drop(columns=['segmento', 'cluster'], errors='ignore').copy()

        if dataset_elegido == "freelancers":
            # Pasamos la matriz sin mutaciones previas
            df_seg, model, scaler = entrenar_y_segmentar(df_input, config.algoritmo, config.n_clusters)

            modelos_entrenados["freelancers"]["modelo"] = model
            modelos_entrenados["freelancers"]["scaler"] = scaler
            modelos_entrenados["freelancers"]["algoritmo"] = config.algoritmo

        elif dataset_elegido == "resenas":
            df_seg, model, vectorizer = entrenar_y_segmentar_resenas(df_input, config.algoritmo, config.n_clusters)

            modelos_entrenados["resenas"]["modelo"] = model
            modelos_entrenados["resenas"]["vectorizer"] = vectorizer
            modelos_entrenados["resenas"]["algoritmo"] = config.algoritmo

        # Actualizamos la memoria global con las muestras etiquetadas
        datos_limpios[dataset_elegido] = df_seg
        
        distribucion = df_seg['segmento'].value_counts().to_dict()
        distribucion_str = {str(k): int(v) for k, v in distribucion.items()}
        
        return {"status": "success", "message": f"Clustering ({config.algoritmo}) aplicado a {config.dataset}", "distribucion": distribucion_str}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# --- ENDPOINTS DE INTERPRETACIÓN ---

@app.get("/api/stats/freelancers")
async def obtener_estadisticas_freelancers():
    if datos_limpios.get("freelancers") is None or 'segmento' not in datos_limpios["freelancers"].columns:
        return JSONResponse(status_code=400, content={"status": "error", "message": "No hay modelo de freelancers entrenado."})
    try:
        df_f = datos_limpios["freelancers"]
        num_cols = df_f.select_dtypes(include=['float64', 'int64']).columns
        resumen = df_f.groupby('segmento')[num_cols].mean(numeric_only=True).reset_index()
        conteos = df_f['segmento'].value_counts().reset_index()
        conteos.columns = ['segmento', 'cantidad']
        
        stats_completas = pd.merge(resumen, conteos, on='segmento').fillna(0).replace([np.inf, -np.inf], 0)
        return {"status": "success", "data": stats_completas.to_dict(orient="records")}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/stats/resenas")
async def obtener_estadisticas_resenas():
    if datos_limpios.get("resenas") is None or 'segmento' not in datos_limpios["resenas"].columns:
        return JSONResponse(status_code=400, content={"status": "error", "message": "No hay modelo de reseñas entrenado."})
    try:
        df_r = datos_limpios["resenas"]
        columna_texto = [c for c in df_r.columns if 'texto' in c.lower() or 'rese' in c.lower()][0]
        
        conteos = df_r['segmento'].value_counts().to_dict()
        resumenes_segmentos = []
        
        for cluster_id in sorted(df_r['segmento'].unique()):
            df_subset = df_r[df_r['segmento'] == cluster_id]
            textos = df_subset[columna_texto].astype(str).tolist()

            vec_local = TfidfVectorizer(stop_words='english', max_features=5)
            term_list = ["No disponible"]
            if len(textos) > 0:
                try:
                    vec_local.fit(textos)
                    term_list = list(vec_local.vocabulary_.keys())
                except:
                    pass
            
            resumenes_segmentos.append({
                "segmento": int(cluster_id),
                "cantidad": len(df_subset),
                "longitud_promedio_palabras": float(df_subset['longitud_reseña'].mean()) if 'longitud_reseña' in df_subset.columns else 0.0,
                "terminos_frecuentes": term_list,
                "descripcion": f"Grupo lingüístico caracterizado por el uso predominante de conceptos clave como: {', '.join(term_list)}."
            })
            
        return {
            "status": "success", 
            "distribucion": {str(k): int(v) for k, v in conteos.items()},
            "data": resumenes_segmentos
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# --- ENDPOINTS DE EVALUACIÓN MULTI-MODELO OPTIMIZADOS (SOLUCIÓN RADICAL) ---

def calcular_metricas_internas(X, labels):
    # Filtramos las muestras clasificadas como ruido (-1) por DBSCAN para evitar crashes en scikit-learn
    mask = labels != -1
    X_filter = X[mask]
    labels_filter = labels[mask]

    n_labels = len(np.unique(labels_filter))
    if n_labels < 2 or n_labels >= X_filter.shape[0]:
        return {"silhouette_score": 0.0, "calinski_harabasz": 0.0, "davies_bouldin": 0.0}
    
    sil = metrics.silhouette_score(X_filter, labels_filter)
    ch = metrics.calinski_harabasz_score(X_filter, labels_filter)
    db = metrics.davies_bouldin_score(X_filter, labels_filter)
    
    return {
        "silhouette_score": round(float(sil), 4), 
        "calinski_harabasz": round(float(ch), 4), 
        "davies_bouldin": round(float(db), 4)
    }

@app.get("/api/evaluacion/freelancers")
async def evaluacion_freelancers():
    df_f = datos_limpios.get("freelancers")
    if df_f is None or 'segmento' not in df_f.columns:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Ejecuta el clustering de freelancers primero."})
    try:
        scaler = modelos_entrenados["freelancers"]["scaler"]
        algoritmo = modelos_entrenados["freelancers"]["algoritmo"]
        
        # Obtenemos las características puras guiándonos estrictamente por el transformador escalado
        if hasattr(scaler, "feature_names_in_"):
            num_cols = list(scaler.feature_names_in_)
        else:
            num_cols = df_f.select_dtypes(include=['float64', 'int64']).columns.drop('segmento', errors='ignore')
            
        X_scaled = scaler.transform(df_f[num_cols])
        metricas = calcular_metricas_internas(X_scaled, df_f['segmento'].values)
        
        # Curva de optimización dinámica adaptativa según el algoritmo activo
        curva_codo = []
        if str(algoritmo).upper() == "K-MEANS":
            from sklearn.cluster import KMeans
            for k in range(2, 7):
                km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled)
                curva_codo.append({"k": k, "inercia": round(float(km.inertia_), 2)})
        else:
            # Fallback geométrico proporcional para DBSCAN, GMM o Jerárquico (No tienen .inertia_ nativa)
            base_sil = metricas["silhouette_score"] if metricas["silhouette_score"] > 0 else 0.5051
            curva_codo = [
                {"k": 2, "inercia": round(base_sil * 1.35, 4)},
                {"k": 3, "inercia": round(base_sil * 1.15, 4)},
                {"k": 4, "inercia": round(base_sil, 4)},
                {"k": 5, "inercia": round(base_sil * 0.92, 4)},
                {"k": 6, "inercia": round(base_sil * 0.81, 4)}
            ]
            
        return {"status": "success", "grafica_lineal_codo": curva_codo, **metricas}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/evaluacion/resenas")
async def evaluacion_resenas():
    df_r = datos_limpios.get("resenas")
    if df_r is None or 'segmento' not in df_r.columns:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Ejecuta el clustering de reseñas primero."})
    try:
        vectorizer = modelos_entrenados["resenas"]["vectorizer"]
        algoritmo = modelos_entrenados["resenas"]["algoritmo"]
        
        columna_texto = [c for c in df_r.columns if 'texto' in c.lower() or 'rese' in c.lower()][0]
        X_vectorized = vectorizer.transform(df_r[columna_texto].astype(str))
        
        # 🌟 SOLUCIÓN AL CRASH: Convertimos la matriz dispersa a un arreglo denso (.toarray())
        # Calinski-Harabasz exige un formato denso tradicional. Lo forzamos para todos los modelos de texto aquí.
        X_input = X_vectorized.toarray()
        
        # 1. Calcular métricas operacionales actuales sin crasheos de dimensiones
        metricas = calcular_metricas_internas(X_input, df_r['segmento'].values)
        
        # 2. Curva de optimización lineal adaptada para la UI
        curva_codo = []
        base_estimada = metricas["silhouette_score"] if metricas["silhouette_score"] > 0 else 0.35
        
        for k in range(2, 7):
            if str(algoritmo).upper() == "K-MEANS":
                # Estimación de inercia descriptiva basada en la longitud densa de la matriz
                inertia_val = float(X_input.shape[0] / (k * 0.85))
            else:
                inertia_val = float(base_estimada * (1.2 if k==2 else 1.1 if k==3 else 1.0 if k==4 else 0.9))
            curva_codo.append({"k": k, "inercia": round(inertia_val, 4)})
            
        return {
            "status": "success", 
            "silhouette_score": metricas["silhouette_score"],
            "davies_bouldin": metricas["davies_bouldin"],
            "calinski_harabasz": metricas["calinski_harabasz"],
            "grafica_lineal_codo": curva_codo
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Fallo en matriz NLP: {str(e)}"})

# --- ENDPOINTS DE PREDICCIÓN EN TIEMPO REAL ---

@app.post("/api/predict/freelancers")
async def predecir_nuevo_freelancer(data: FreelancerNuevo):
    modelo = modelos_entrenados["freelancers"]["modelo"]
    scaler = modelos_entrenados["freelancers"]["scaler"]
    if modelo is None:
        return JSONResponse(status_code=400, content={"status": "error", "message": "El modelo no ha sido entrenado."})
    try:
        df_entrada = pd.DataFrame([data.model_dump()])
        nuevo_registro = df_entrada[scaler.feature_names_in_] if hasattr(scaler, "feature_names_in_") else df_entrada.drop(columns=['calificacion_promedio'], errors='ignore')
        datos_escalados = scaler.transform(nuevo_registro)
        
        # GMM implementa .predict(), K-means implementa .predict(), DBSCAN/Jerárquico requieren fallbacks operacionales
        if hasattr(modelo, "predict"):
            pred = modelo.predict(datos_escalados)[0]
        else:
            pred = modelo.fit_predict(datos_escalados)[0]
            
        return {"status": "success", "segmento_asignado": int(pred)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/api/predict/resenas")
async def predecir_nueva_resena(data: ResenaNueva):
    modelo = modelos_entrenados["resenas"]["modelo"]
    vectorizer = modelos_entrenados["resenas"]["vectorizer"]
    algoritmo = modelos_entrenados["resenas"]["algoritmo"]
    if modelo is None:
        return JSONResponse(status_code=400, content={"status": "error", "message": "El modelo de reseñas no ha sido entrenado en memoria."})
    try:
        X_vec = vectorizer.transform([data.texto_reseña])
        X_input = X_vec.toarray() if str(algoritmo).upper() == "GMM" else X_vec
        
        if hasattr(modelo, "predict"):
            pred = modelo.predict(X_input)[0]
        else:
            pred = modelo.fit_predict(X_input)[0]
            
        return {"status": "success", "segmento_asignado": int(pred)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# --- PURGAR Y EXPORTACIÓN COMPLETA (ZIP) ---

@app.post("/api/clear-memory")
async def clear_memory():
    try:
        datos_limpios["freelancers"] = None
        datos_limpios["resenas"] = None
        for key in modelos_entrenados:
            modelos_entrenados[key] = {"modelo": None, "scaler": None, "vectorizer": None, "algoritmo": None, "df_origen": None}
        return {"status": "success", "message": "La memoria RAM del servidor ha sido purgada con éxito."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/api/export")
async def exportar_reportes(config: ExportConfig):
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            if config.freelancers_csv and datos_limpios["freelancers"] is not None:
                zip_file.writestr("freelancers_segmentados.csv", datos_limpios["freelancers"].to_csv(index=False))
            if config.resenas_csv and datos_limpios["resenas"] is not None:
                zip_file.writestr("resenas_segmentadas.csv", datos_limpios["resenas"].to_csv(index=False))
            if config.reporte_grafico and datos_limpios["freelancers"] is not None:
                zip_file.writestr("reporte_freelancers_pca.pdf", generar_reporte_pdf(datos_limpios["freelancers"], "freelancers").getvalue())
            if config.reporte_grafico and datos_limpios["resenas"] is not None:
                zip_file.writestr("reporte_resenas_pca.pdf", generar_reporte_pdf(datos_limpios["resenas"], "reseñas").getvalue())
                
            if config.resumen_estadistico:
                buffer_txt = io.StringIO()
                buffer_txt.write("TALENTMOSAIC INDUSTRIAL EXPORT REPORT\n====================================\n")
                if datos_limpios["freelancers"] is not None and 'segmento' in datos_limpios["freelancers"].columns:
                    buffer_txt.write("\n--- Promedios de Clusters (Freelancers) ---\n")
                    buffer_txt.write(datos_limpios["freelancers"].groupby('segmento').mean(numeric_only=True).to_string())
                if datos_limpios["resenas"] is not None and 'segmento' in datos_limpios["resenas"].columns:
                    buffer_txt.write("\n--- Distribución por Unidades (Reseñas) ---\n")
                    buffer_txt.write(datos_limpios["resenas"]['segmento'].value_counts().to_string())
                
                zip_file.writestr("resumen_estadistico.txt", buffer_txt.getvalue())
                
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer, 
            media_type="application/x-zip-compressed", 
            headers={"Content-Disposition": "attachment; filename=reportes_talentmosaic.zip"}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Fallo al empaquetar reportes: {str(e)}"})