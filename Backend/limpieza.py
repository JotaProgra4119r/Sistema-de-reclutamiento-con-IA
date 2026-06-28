import pandas as pd
import io

def procesar_freelancers(contenido_csv: bytes):
    df = pd.read_csv(io.BytesIO(contenido_csv))
    stats = {"cargados": len(df), "nulos": 0, "duplicados": 0, "corregidos": 0}
    
    stats["duplicados"] = int(df.duplicated().sum())
    df = df.drop_duplicates()
    
    nulos_iniciales = df.isnull().sum().sum()
    if nulos_iniciales > 0:
        stats["nulos"] = int(nulos_iniciales)
        num_cols = df.select_dtypes(include=['float64', 'int64']).columns
        cat_cols = df.select_dtypes(include=['object']).columns
        
        if not num_cols.empty:
            df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
        if not cat_cols.empty:
            df[cat_cols] = df[cat_cols].fillna(df[cat_cols].mode().iloc[0])
            
    return df, stats

def procesar_resenas(contenido_csv: bytes):
    # Quitamos el encoding forzado para que Pandas lo lea en su formato original
    df = pd.read_csv(io.BytesIO(contenido_csv))
    stats = {"cargados": len(df), "nulos": 0, "duplicados": 0, "corregidos": 0}
    
    stats["duplicados"] = int(df.duplicated().sum())
    df = df.drop_duplicates()
    
    # BUSCADOR DINÁMICO: Encuentra la columna aunque la "ñ" esté corrupta
    columna_texto = None
    for col in df.columns:
        # Si la cabecera contiene "texto" o "rese", esa es nuestra columna
        if 'texto' in col.lower() or 'rese' in col.lower():
            columna_texto = col
            break
            
    # Si por alguna razón los nombres de columna son totalmente distintos, toma la primera
    if not columna_texto and len(df.columns) > 0:
        columna_texto = df.columns[0]
    
    if columna_texto:
        # 1. Rellenar NaNs con texto ANTES de operar (Esto arregla el error 'float')
        nulos_columna = df[columna_texto].isnull().sum()
        if nulos_columna > 0:
            df[columna_texto] = df[columna_texto].fillna("Reseña no disponible")
            stats["nulos"] += int(nulos_columna)
            
        # 2. Forzar todo a string explícitamente
        df[columna_texto] = df[columna_texto].astype(str)
        
        # 3. Hacer el split de manera segura
        if 'longitud_reseña' not in df.columns:
            df['longitud_reseña'] = df[columna_texto].apply(lambda x: len(str(x).split()))
            stats["corregidos"] += len(df)
    
    # Limpieza final para cualquier otro nulo residual
    nulos_restantes = df.isnull().sum().sum()
    if nulos_restantes > 0:
        stats["nulos"] += int(nulos_restantes)
        df = df.fillna("Desconocido")
        
    return df, stats