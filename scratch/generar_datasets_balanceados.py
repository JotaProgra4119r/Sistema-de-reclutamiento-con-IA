import numpy as np
import pandas as pd
import os

BASE_DIR = r"C:\Users\majop\Documents\OLC2_EJ26_ML_-45-1\Proyectito"
DATASETS_DIR = os.path.join(BASE_DIR, "Datasets")
BACKEND_DIR = os.path.join(BASE_DIR, "Backend")
DATABASE_DIR = os.path.join(BASE_DIR, "Database")
PERSISTENCE_DIR = os.path.join(DATABASE_DIR, "modelos_persistentes")

os.makedirs(DATASETS_DIR, exist_ok=True)
os.makedirs(BACKEND_DIR, exist_ok=True)
os.makedirs(PERSISTENCE_DIR, exist_ok=True)

np.random.seed(42)

# ==============================================================================
# 1. GENERACIÓN DEL DATASET BALANCEADO DE CANDIDATOS Y TALENTO (1,590 FILAS)
# ==============================================================================
# Distribución balanceada y armónica (exactamente 25% por clúster):
# Clúster 0: 397 (Talento Inicial / En Desarrollo)
# Clúster 1: 398 (Consultores Executive / Alta Facturación)
# Clúster 2: 397 (Soporte Operativo / Alta Intensidad)
# Clúster 3: 398 (Especialistas Intermedios Estables)
# ==============================================================================

categorias_rrhh = [
    "Ejecutivos de Ventas",
    "Analistas Financieros",
    "Coordinadores de Operaciones",
    "Especialistas de RRHH",
    "Agentes de Atención al Cliente",
    "Diseñadores",
    "Desarrolladores"
]

candidatos_rows = []

# --- CLÚSTER 0: TALENTO INICIAL / EN DESARROLLO (397 registros) ---
# Horas activas (~146h), experiencia formativa (~7.5 años), proyectos completados altos (~95)
for i in range(397):
    candidatos_rows.append({
        'freelancer_id': f'CAND_{len(candidatos_rows)+1:04d}',
        'proyectos_completados': round(float(np.clip(np.random.normal(95, 8), 65, 130)), 1),
        'ingresos_totales': round(float(np.clip(np.random.normal(31000, 2000), 25000, 38000)), 2),
        'tarifa_hora_promedio': round(float(np.clip(np.random.normal(48.0, 3.5), 38.0, 58.0)), 2),
        'anios_experiencia': round(float(np.clip(np.random.normal(7.5, 0.5), 6.0, 9.0)), 1),
        'tiempo_respuesta_horas': round(float(np.clip(np.random.normal(2.5, 0.4), 1.2, 4.5)), 1),
        'tasa_finalizacion': round(float(np.clip(np.random.normal(93.0, 1.5), 88.0, 98.5)), 1),
        'calificacion_promedio': round(float(np.clip(np.random.normal(4.65, 0.12), 4.3, 5.0)), 2),
        'categoria_principal': np.random.choice(categorias_rrhh),
        'clientes_recurrentes': int(np.clip(np.random.normal(4, 1), 2, 7)),
        'horas_trabajadas_mes': round(float(np.clip(np.random.normal(146.0, 6.0), 130.0, 168.0)), 1)
    })

# --- CLÚSTER 1: CONSULTORES EXECUTIVE / ALTA FACTURACIÓN (398 registros) ---
# Alta facturación (~$51k), tarifa ejecutiva equilibrada (~68$/h), experiencia senior (~11 años), jornada estratégica (~64h)
for i in range(398):
    candidatos_rows.append({
        'freelancer_id': f'CAND_{len(candidatos_rows)+1:04d}',
        'proyectos_completados': round(float(np.clip(np.random.normal(28, 3.0), 18, 38)), 1),
        'ingresos_totales': round(float(np.clip(np.random.normal(51000, 2500), 44000, 60000)), 2),
        'tarifa_hora_promedio': round(float(np.clip(np.random.normal(68.0, 3.8), 58.0, 80.0)), 2),
        'anios_experiencia': round(float(np.clip(np.random.normal(11.0, 0.7), 9.5, 13.5)), 1),
        'tiempo_respuesta_horas': round(float(np.clip(np.random.normal(3.8, 0.4), 2.5, 5.5)), 1),
        'tasa_finalizacion': round(float(np.clip(np.random.normal(94.0, 1.2), 90.0, 99.0)), 1),
        'calificacion_promedio': round(float(np.clip(np.random.normal(4.90, 0.06), 4.75, 5.0)), 2),
        'categoria_principal': np.random.choice(categorias_rrhh),
        'clientes_recurrentes': int(np.clip(np.random.normal(5, 1), 3, 8)),
        'horas_trabajadas_mes': round(float(np.clip(np.random.normal(64.0, 5.0), 50.0, 78.0)), 1)
    })

# --- CLÚSTER 2: SOPORTE OPERATIVO / ALTA INTENSIDAD (397 registros) ---
# Menor experiencia (~1.6 años), tarifa inicial (~14$/h), tiempos de respuesta altos (~18h), cumplimiento ~55%
for i in range(397):
    candidatos_rows.append({
        'freelancer_id': f'CAND_{len(candidatos_rows)+1:04d}',
        'proyectos_completados': round(float(np.clip(np.random.normal(8, 1.8), 3, 14)), 1),
        'ingresos_totales': round(float(np.clip(np.random.normal(2200, 300), 1400, 3200)), 2),
        'tarifa_hora_promedio': round(float(np.clip(np.random.normal(14.0, 1.8), 9.5, 19.5)), 2),
        'anios_experiencia': round(float(np.clip(np.random.normal(1.6, 0.25), 1.0, 2.2)), 1),
        'tiempo_respuesta_horas': round(float(np.clip(np.random.normal(18.0, 2.0), 12.0, 24.0)), 1),
        'tasa_finalizacion': round(float(np.clip(np.random.normal(55.0, 3.5), 45.0, 66.0)), 1),
        'calificacion_promedio': round(float(np.clip(np.random.normal(3.20, 0.2), 2.5, 3.7)), 2),
        'categoria_principal': np.random.choice(categorias_rrhh),
        'clientes_recurrentes': int(np.clip(np.random.normal(1, 0.4), 0, 2)),
        'horas_trabajadas_mes': round(float(np.clip(np.random.normal(42.0, 4.5), 30.0, 55.0)), 1)
    })

# --- CLÚSTER 3: ESPECIALISTAS INTERMEDIOS ESTABLES (398 registros) ---
# Trayectoria estable (~3.5 años), jornada equilibrada (~90h), tarifa (~24$/h), cumplimiento regular (~82%)
for i in range(398):
    candidatos_rows.append({
        'freelancer_id': f'CAND_{len(candidatos_rows)+1:04d}',
        'proyectos_completados': round(float(np.clip(np.random.normal(38, 3.5), 26, 48)), 1),
        'ingresos_totales': round(float(np.clip(np.random.normal(8500, 750), 6500, 10800)), 2),
        'tarifa_hora_promedio': round(float(np.clip(np.random.normal(24.0, 2.0), 18.0, 29.5)), 2),
        'anios_experiencia': round(float(np.clip(np.random.normal(3.5, 0.35), 2.6, 4.4)), 1),
        'tiempo_respuesta_horas': round(float(np.clip(np.random.normal(6.5, 0.7), 4.5, 9.0)), 1),
        'tasa_finalizacion': round(float(np.clip(np.random.normal(82.0, 2.0), 75.0, 88.0)), 1),
        'calificacion_promedio': round(float(np.clip(np.random.normal(4.20, 0.12), 3.9, 4.5)), 2),
        'categoria_principal': np.random.choice(categorias_rrhh),
        'clientes_recurrentes': int(np.clip(np.random.normal(3, 0.7), 1, 5)),
        'horas_trabajadas_mes': round(float(np.clip(np.random.normal(90.0, 4.5), 78.0, 102.0)), 1)
    })

df_candidatos = pd.DataFrame(candidatos_rows)
df_candidatos = df_candidatos.sample(frac=1.0, random_state=42).reset_index(drop=True)
df_candidatos['freelancer_id'] = [f'FL_{i+1:04d}' for i in range(len(df_candidatos))]

# Guardar en todos los destinos necesarios
for dest in [
    os.path.join(DATASETS_DIR, "candidatos_talentos.csv"),
    os.path.join(DATASETS_DIR, "freelancers_dev.csv"),
    os.path.join(BACKEND_DIR, "freelancers_dev.csv")
]:
    df_candidatos.to_csv(dest, index=False)
print(f"Dataset de candidatos generado exitosamente: {len(df_candidatos)} filas.")

# ==============================================================================
# 2. GENERACIÓN DEL DATASET BALANCEADO DE EVALUACIONES NLP (5,250 FILAS)
# ==============================================================================
# 4 clústeres nivelados (1,313, 1,312, 1,313, 1,312) con términos representativos
# ==============================================================================

frases_rrhh_c0 = [
    "Perfil en etapa de desarrollo con alto potencial, requiere seguimiento quincenal y acompañamiento en plan de inducción corporativa.",
    "Evaluación cualitativa de talento en desarrollo con excelente curva de aprendizaje y alta iniciativa en inducción y mentoría.",
    "Candidato emergente con gran potencial de crecimiento organizacional y participación colaborativa en capacitaciones y formación continua.",
    "Muestra compromiso con el aprendizaje técnico continuo y requiere plan de inducción corporativa para consolidar metas iniciales.",
    "Talento inicial en integración corporativa con sólido potencial formativo, actitud colaborativa y mentoría quincenal estructurada."
]

frases_rrhh_c1 = [
    "Consultor élite de dirección ejecutiva con liderazgo sobresaliente, trabajo en equipo impecable y máximo valor corporativo.",
    "Excelente precisión técnica, dirección ejecutiva de primer nivel y alto valor aportado en la coordinación estratégica de cuentas corporativas.",
    "Consultor executive de alto rendimiento con liderazgo estratégico sobresaliente y notable visión corporativa gerencial de alta facturación.",
    "Talento directivo de élite y altísima facturación con precisión analítica impecable en decisiones corporativas complejas y rentabilidad.",
    "Liderazgo organizacional sobresaliente con impacto directo en metas financieras, rentabilidad y fidelización de cuentas clave corporativas."
]

frases_rrhh_c2 = [
    "Personal de soporte operacional expuesto a fatiga laboral extrema, requiriendo balance de cargas de trabajo inmediato y prevención de fatiga.",
    "Personal clave de soporte operativo sometido a alta intensidad laboral y turnos extensos, requiriendo monitoreo preventivo de horas.",
    "Se recomienda redistribución inmediata de cargas operacionales para prevenir fatiga y desgaste laboral por turnos extensos de soporte.",
    "Rendimiento operacional continuo en tareas de soporte con horarios demandantes, sobrecarga de incidencias y necesidad de balance de funciones.",
    "Área de soporte operacional con sobrecarga en gestión de incidencias críticas que amerita supervisión preventiva de fatiga y burnout."
]

frases_rrhh_c3 = [
    "Especialista intermedio altamente confiable con consistencia comprobada, buena puntualidad y rendimiento estandarizado en sus funciones.",
    "Fuerza laboral estable con cumplimiento de metas sostenido, excelente puntualidad, regularidad técnica y rendimiento estandarizado.",
    "Desempeño predecible y consistente en operaciones corporativas regulares con gran disciplina en plazos establecidos y rendimiento confiable.",
    "Profesional confiable con estabilidad sólida en asignaciones operativas y compromiso continuo con los estándares de RRHH y regularidad.",
    "Colaborador con rendimiento estandarizado de alta fidelidad, excelente regularidad técnica, estabilidad y consistencia funcional."
]

resenas_rows = []
for i in range(1313):
    resenas_rows.append({
        'reseña_id': f'REV_{len(resenas_rows)+1:05d}',
        'freelancer_id': f'FL_{np.random.randint(1, 1591):04d}',
        'texto_reseña': np.random.choice(frases_rrhh_c0),
        'fecha_reseña': f'2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 28):02d}',
        'categoria_servicio': np.random.choice(categorias_rrhh)
    })

for i in range(1312):
    resenas_rows.append({
        'reseña_id': f'REV_{len(resenas_rows)+1:05d}',
        'freelancer_id': f'FL_{np.random.randint(1, 1591):04d}',
        'texto_reseña': np.random.choice(frases_rrhh_c1),
        'fecha_reseña': f'2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 28):02d}',
        'categoria_servicio': np.random.choice(categorias_rrhh)
    })

for i in range(1313):
    resenas_rows.append({
        'reseña_id': f'REV_{len(resenas_rows)+1:05d}',
        'freelancer_id': f'FL_{np.random.randint(1, 1591):04d}',
        'texto_reseña': np.random.choice(frases_rrhh_c2),
        'fecha_reseña': f'2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 28):02d}',
        'categoria_servicio': np.random.choice(categorias_rrhh)
    })

for i in range(1312):
    resenas_rows.append({
        'reseña_id': f'REV_{len(resenas_rows)+1:05d}',
        'freelancer_id': f'FL_{np.random.randint(1, 1591):04d}',
        'texto_reseña': np.random.choice(frases_rrhh_c3),
        'fecha_reseña': f'2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 28):02d}',
        'categoria_servicio': np.random.choice(categorias_rrhh)
    })

df_resenas = pd.DataFrame(resenas_rows)
df_resenas = df_resenas.sample(frac=1.0, random_state=42).reset_index(drop=True)
df_resenas['reseña_id'] = [f'REV_{i+1:05d}' for i in range(len(df_resenas))]

for dest in [
    os.path.join(DATASETS_DIR, "evaluaciones_cualitativas_rrhh.csv"),
    os.path.join(DATASETS_DIR, "resenas_clientes_dev.csv"),
    os.path.join(BACKEND_DIR, "resenas_clientes_dev.csv")
]:
    df_resenas.to_csv(dest, index=False)
print(f"Dataset de evaluaciones NLP generado exitosamente: {len(df_resenas)} filas.")

# Limpiar modelos obsoletos para forzar entrenamiento limpio
for f in os.listdir(PERSISTENCE_DIR):
    if f.endswith(".joblib"):
        os.remove(os.path.join(PERSISTENCE_DIR, f))
print("Caché de modelos persistentes limpiada.")
