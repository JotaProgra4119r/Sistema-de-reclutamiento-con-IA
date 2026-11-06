import os
import pandas as pd

# 1. Candidatos Semilla en BD SQL
df_candidatos_bd = pd.DataFrame([
    {
        "ID Candidato": 1,
        "Nombre Candidato": "Sofía Isabel Mendoza Ramírez",
        "Sueldo Mensual ($)": 4500.0,
        "Años Experiencia": 11.5,
        "Cumplimiento Metas (%)": 92.0,
        "Clúster Asignado": "Clúster 1",
        "Etiqueta / Interpretación Empresarial": "Consultores Executive / Alta Facturación (Talento élite de alto rendimiento y valor corporativo)"
    },
    {
        "ID Candidato": 2,
        "Nombre Candidato": "Carlos Eduardo Gómez Estrada",
        "Sueldo Mensual ($)": 175.0,
        "Años Experiencia": 1.2,
        "Cumplimiento Metas (%)": 52.0,
        "Clúster Asignado": "Clúster 2",
        "Etiqueta / Interpretación Empresarial": "Soporte Operativo / Alta Intensidad (Personal clave expuesto a alta carga laboral y fatiga)"
    },
    {
        "ID Candidato": 3,
        "Nombre Candidato": "Ana Lucía Hernández Morales",
        "Sueldo Mensual ($)": 2583.33,
        "Años Experiencia": 7.2,
        "Cumplimiento Metas (%)": 94.0,
        "Clúster Asignado": "Clúster 0",
        "Etiqueta / Interpretación Empresarial": "Talento Inicial / En Desarrollo (Perfiles emergentes en etapa de integración y formación)"
    },
    {
        "ID Candidato": 4,
        "Nombre Candidato": "Fernando José Vásquez Castillo",
        "Sueldo Mensual ($)": 691.67,
        "Años Experiencia": 3.2,
        "Cumplimiento Metas (%)": 80.0,
        "Clúster Asignado": "Clúster 3",
        "Etiqueta / Interpretación Empresarial": "Especialistas Intermedios Estables (Fuerza laboral confiable de rendimiento estandarizado)"
    },
    {
        "ID Candidato": 5,
        "Nombre Candidato": "Mariana Elizabeth Rios Salazar",
        "Sueldo Mensual ($)": 4041.67,
        "Años Experiencia": 10.8,
        "Cumplimiento Metas (%)": 90.0,
        "Clúster Asignado": "Clúster 1",
        "Etiqueta / Interpretación Empresarial": "Consultores Executive / Alta Facturación (Talento élite de alto rendimiento y valor corporativo)"
    }
])

# 2. Métricas Cuantitativas para Apartado 5 (Formulario 1)
df_metricas_ejemplo = pd.DataFrame([
    {
        "Campo del Formulario": "Proyectos Completados",
        "Clúster 0 (En Desarrollo)": 35,
        "Clúster 1 (Executive)": 15,
        "Clúster 2 (Soporte Operativo)": 2,
        "Clúster 3 (Intermedio Estable)": 10
    },
    {
        "Campo del Formulario": "Ingresos Totales ($)",
        "Clúster 0 (En Desarrollo)": 31000,
        "Clúster 1 (Executive)": 50000,
        "Clúster 2 (Soporte Operativo)": 2100,
        "Clúster 3 (Intermedio Estable)": 8300
    },
    {
        "Campo del Formulario": "Tarifa por Hora ($)",
        "Clúster 0 (En Desarrollo)": 20,
        "Clúster 1 (Executive)": 75,
        "Clúster 2 (Soporte Operativo)": 8,
        "Clúster 3 (Intermedio Estable)": 25
    },
    {
        "Campo del Formulario": "Años de Experiencia",
        "Clúster 0 (En Desarrollo)": 7.0,
        "Clúster 1 (Executive)": 11.5,
        "Clúster 2 (Soporte Operativo)": 1.2,
        "Clúster 3 (Intermedio Estable)": 3.2
    },
    {
        "Campo del Formulario": "Tiempo Respuesta (hrs)",
        "Clúster 0 (En Desarrollo)": 2.5,
        "Clúster 1 (Executive)": 5.0,
        "Clúster 2 (Soporte Operativo)": 28.0,
        "Clúster 3 (Intermedio Estable)": 7.5
    },
    {
        "Campo del Formulario": "Tasa Finalización Metas (%)",
        "Clúster 0 (En Desarrollo)": 94.0,
        "Clúster 1 (Executive)": 92.0,
        "Clúster 2 (Soporte Operativo)": 52.0,
        "Clúster 3 (Intermedio Estable)": 80.0
    },
    {
        "Campo del Formulario": "Calificación Promedio (1-5)",
        "Clúster 0 (En Desarrollo)": 4.7,
        "Clúster 1 (Executive)": 4.9,
        "Clúster 2 (Soporte Operativo)": 2.6,
        "Clúster 3 (Intermedio Estable)": 4.0
    },
    {
        "Campo del Formulario": "Clientes/Proyectos Recurrentes",
        "Clúster 0 (En Desarrollo)": 35,
        "Clúster 1 (Executive)": 13,
        "Clúster 2 (Soporte Operativo)": 2,
        "Clúster 3 (Intermedio Estable)": 11
    },
    {
        "Campo del Formulario": "Horas Trabajadas / Mes",
        "Clúster 0 (En Desarrollo)": 148,
        "Clúster 1 (Executive)": 65,
        "Clúster 2 (Soporte Operativo)": 42,
        "Clúster 3 (Intermedio Estable)": 90
    }
])

# 3. Evaluaciones Cualitativas NLP para Apartado 5 (Formulario 2 - Con Clúster Real Predicho)
df_nlp_ejemplo = pd.DataFrame([
    {
        "Texto de Evaluación Cualitativa (NLP)": "Perfil emergente en etapa de integración con alto potencial, requiere plan de inducción corporativo, seguimiento quincenal y tutoría continua.",
        "Clúster Real Predicho": "Clúster #3",
        "Etiqueta / Resultado del Modelo NLP": "Especialistas Intermedios Estables"
    },
    {
        "Texto de Evaluación Cualitativa (NLP)": "Consultor élite con dirección ejecutiva estratégica sobresaliente, liderazgo en cuentas corporativas, trabajo en equipo impecable y cumplimiento perfecto de metas.",
        "Clúster Real Predicho": "Clúster #3",
        "Etiqueta / Resultado del Modelo NLP": "Especialistas Intermedios Estables"
    },
    {
        "Texto de Evaluación Cualitativa (NLP)": "Personal de soporte operacional expuesto a alta carga laboral y fatiga extrema, acumulando demoras en incidencias que requieren redistribución inmediata.",
        "Clúster Real Predicho": "Clúster #0",
        "Etiqueta / Resultado del Modelo NLP": "Talento Inicial / En Desarrollo"
    },
    {
        "Texto de Evaluación Cualitativa (NLP)": "Especialista intermedio confiable de rendimiento estandarizado, caracterizado por puntualidad constante, estabilidad en entregas y buena colaboración.",
        "Clúster Real Predicho": "Clúster #2",
        "Etiqueta / Resultado del Modelo NLP": "Soporte Operativo / Alta Intensidad"
    }
])

output_filename = "Ejemplos_Clasificacion_RRHH.xlsx"
output_path = os.path.join(os.path.dirname(__file__), "..", output_filename)

try:
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df_candidatos_bd.to_excel(writer, sheet_name='Candidatos_BD_SQL', index=False)
        df_metricas_ejemplo.to_excel(writer, sheet_name='Métricas_Apartado_5', index=False)
        df_nlp_ejemplo.to_excel(writer, sheet_name='Evaluaciones_NLP_Apartado_5', index=False)
    print("Excel actualizado exitosamente en:", output_path)
except Exception as err:
    output_filename = "Ejemplos_Clasificacion_RRHH_v2.xlsx"
    output_path = os.path.join(os.path.dirname(__file__), "..", output_filename)
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df_candidatos_bd.to_excel(writer, sheet_name='Candidatos_BD_SQL', index=False)
        df_metricas_ejemplo.to_excel(writer, sheet_name='Métricas_Apartado_5', index=False)
        df_nlp_ejemplo.to_excel(writer, sheet_name='Evaluaciones_NLP_Apartado_5', index=False)
    print("Excel alternativo creado en:", output_path)
