import pandas as pd
import random
import os

datasets_dir = r"c:\Users\majop\Documents\OLC2_EJ26_ML_-45-1\OLC2_EJ26_ML_-45\Datasets"
backend_dir = r"c:\Users\majop\Documents\OLC2_EJ26_ML_-45-1\OLC2_EJ26_ML_-45\Backend"

# Perfiles transversales de RRHH
categorias_rrhh = [
    "Ejecutivos de Ventas",
    "Analistas Financieros",
    "Coordinadores de Operaciones",
    "Especialistas de RRHH",
    "Agentes de Atención al Cliente",
    "Diseñadores",
    "Desarrolladores"
]

# Map antiguos a nuevos
map_categorias = {
    "Desarrollo de Software": "Desarrolladores",
    "Diseño Gráfico": "Diseñadores",
    "Marketing Digital": "Ejecutivos de Ventas",
    "Redacción y Traducción": "Especialistas de RRHH",
    "Soporte Administrativo Virtual": "Coordinadores de Operaciones",
    "Analítica de Datos": "Analistas Financieros",
    "Servicio al Cliente": "Agentes de Atención al Cliente"
}

# 1. Adaptar freelancers_dev.csv -> candidatos_dev.csv / freelancers_dev.csv
f_path = os.path.join(datasets_dir, "freelancers_dev.csv")
df_f = pd.read_csv(f_path)

def transformar_categoria(cat):
    if str(cat) in map_categorias:
        return map_categorias[str(cat)]
    return random.choice(categorias_rrhh)

df_f['categoria_principal'] = df_f['categoria_principal'].apply(transformar_categoria)
df_f.to_csv(f_path, index=False)
df_f.to_csv(os.path.join(backend_dir, "freelancers_dev.csv"), index=False)
print(f"Freelancers CSV actualizado: {len(df_f)} filas")

# 2. Adaptar resenas_clientes_dev.csv
r_path = os.path.join(datasets_dir, "resenas_clientes_dev.csv")
df_r = pd.read_csv(r_path)

df_r['categoria_servicio'] = df_r['categoria_servicio'].apply(transformar_categoria)

# Frases cualitativas de RRHH (trabajo en equipo, puntualidad, metas, liderazgo, atención al cliente, precisión técnica)
frases_rrhh = [
    "Demostró una excelente capacidad de trabajo en equipo y una puntualidad impecable en cada entregable corporativo.",
    "Su liderazgo estratégico permitió el cumplimiento de metas antes de la fecha límite establecida por la gerencia.",
    "Mantiene una atención al cliente de primer nivel y demostró altísima precisión técnica en sus análisis organizacionales.",
    "Excelente actitud colaborativa, puntualidad constante y gran habilidad para liderar equipos interdisciplinarios.",
    "Superó las expectativas de la evaluación de desempeño gracias a su precisión técnica y enfoque en resultados.",
    "El talento mostró cierto retraso en los plazos de entrega, requiriendo reforzar la puntualidad y el seguimiento quincenal.",
    "Gran compromiso con el cumplimiento de metas y notable fluidez en la comunicación interna con la dirección de RRHH.",
    "Demuestra alta estabilidad en proyectos corporativos, rendimiento constante y trabajo en equipo estandarizado.",
    "Registra jornadas de alta intensidad laboral con excelente precisión técnica, requiriendo monitoreo para prevenir burnout.",
    "Su aporte en atención al cliente y coordinación de operaciones fue fundamental para el éxito del proyecto corporativo."
]

def transformar_texto_resena(texto):
    t_str = str(texto)
    # Reemplazar términos de software dev
    t_str = t_str.replace("código", "desempeño").replace("freelancer", "candidato").replace("bugs", "observaciones").replace("Python", "análisis")
    # Si la reseña es corta o genérica, infundir vocabulario cualitativo de RRHH
    if len(t_str.split()) < 8 or random.random() < 0.35:
        return f"{t_str}. {random.choice(frases_rrhh)}"
    return t_str

col_texto = [c for c in df_r.columns if 'texto' in c.lower() or 'rese' in c.lower()][0]
df_r[col_texto] = df_r[col_texto].apply(transformar_texto_resena)

df_r.to_csv(r_path, index=False)
df_r.to_csv(os.path.join(backend_dir, "resenas_clientes_dev.csv"), index=False)
print(f"Reseñas CSV actualizado: {len(df_r)} filas")
