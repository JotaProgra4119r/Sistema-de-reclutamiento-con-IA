import os
import sys
# Permitir importaciones relativas tanto ejecutando desde raíz como desde Backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from base_datos import engine, Base, SessionLocal, Candidato, Experiencia, Evaluacion, sincronizar_a_archivos_planos, cargar_desde_archivos_planos
from motor_ml import asegurar_datos_y_modelo_cargados
import rutas

# --- INICIALIZACIÓN DE LA BASE DE DATOS SQL (CASO 5 USAC EN /Database) ---
Base.metadata.create_all(bind=engine)

def poblar_datos_iniciales():
    """Siembra datos iniciales de prueba y mantiene sincronizados los archivos planos en /Database/"""
    db: Session = SessionLocal()
    try:
        total_candidatos = db.query(Candidato).count()
        if total_candidatos == 0:
            cargado_planos = cargar_desde_archivos_planos(db)
            if not cargado_planos or db.query(Candidato).count() == 0:
                candidatos_semilla = [
            # 1. CLÚSTER 1: Consultores Executive / Alta Facturación
            {
                "nombres": "Sofía Isabel",
                "apellidos": "Mendoza Ramírez",
                "direccion": "Av. Las Américas 14-20, Zona 14",
                "telefono": "+502 5512-3456",
                "fecha_nacimiento": "1990-08-12",
                "estado_civil": "Soltera",
                "anios_experiencia": 11.5,
                "calificacion_evaluacion": 4.9,
                "cumplimiento_metas": 92.0,
                "horas_mensuales": 65.0,
                "proyectos_recurrentes": 14,
                "comentario_evaluacion": "Consultor élite de dirección ejecutiva con liderazgo sobresaliente, trabajo en equipo impecable y máximo valor corporativo.",
                "experiencias": [
                    {"empresa": "Corporación Financiera del Norte", "direccion": "Zona 10", "desde_fecha": "2018-01-15", "hasta_fecha": "2023-11-30", "sueldo": 4500.0, "motivo_retiro": "Ascenso laboral"},
                    {"empresa": "Consultores Financieros SA", "direccion": "Zona 4", "desde_fecha": "2014-03-01", "hasta_fecha": "2017-12-31", "sueldo": 4166.67, "motivo_retiro": "Crecimiento profesional"}
                ],
                "evaluaciones": [
                    {"descripcion_evaluacion": "Evaluación de Análisis Financiero y Modelado Executive", "nota_minima": 85.0, "fecha_evaluacion": "2024-01-15", "nota_obtenida": 98.0},
                    {"descripcion_evaluacion": "Prueba de Trabajo en Equipo y Liderazgo Estratégico", "nota_minima": 80.0, "fecha_evaluacion": "2024-01-20", "nota_obtenida": 96.0}
                ]
            },
            # 2. CLÚSTER 2: Soporte Operativo / Alta Intensidad
            {
                "nombres": "Carlos Eduardo",
                "apellidos": "Gómez Estrada",
                "direccion": "Calle Mariscal 8-45, Zona 11",
                "telefono": "+502 5987-6543",
                "fecha_nacimiento": "1998-03-22",
                "estado_civil": "Soltero",
                "anios_experiencia": 1.2,
                "calificacion_evaluacion": 2.6,
                "cumplimiento_metas": 52.0,
                "horas_mensuales": 42.0,
                "proyectos_recurrentes": 2,
                "comentario_evaluacion": "Personal de soporte operacional expuesto a fatiga laboral extrema, requiriendo balance de cargas de trabajo inmediato.",
                "experiencias": [
                    {"empresa": "Ventas & Operaciones Globales", "direccion": "Zona 9", "desde_fecha": "2023-01-01", "hasta_fecha": "2024-02-15", "sueldo": 175.0, "motivo_retiro": "Reestructuración"}
                ],
                "evaluaciones": [
                    {"descripcion_evaluacion": "Evaluación de Soporte Operativo e Incidencias", "nota_minima": 60.0, "fecha_evaluacion": "2024-02-01", "nota_obtenida": 55.0}
                ]
            },
            # 3. CLÚSTER 0: Talento Inicial / En Desarrollo
            {
                "nombres": "Ana Lucía",
                "apellidos": "Hernández Morales",
                "direccion": "Bulevar Los Próceres 12-30, Zona 10",
                "telefono": "+502 5432-1098",
                "fecha_nacimiento": "1996-11-05",
                "estado_civil": "Soltera",
                "anios_experiencia": 7.2,
                "calificacion_evaluacion": 4.7,
                "cumplimiento_metas": 94.0,
                "horas_mensuales": 148.0,
                "proyectos_recurrentes": 35,
                "comentario_evaluacion": "Perfil en etapa de desarrollo con alto potencial, requiere seguimiento quincenal y acompañamiento en plan de inducción corporativa.",
                "experiencias": [
                    {"empresa": "Centro de Atención y Servicio al Cliente", "direccion": "Zona 1", "desde_fecha": "2017-02-01", "hasta_fecha": "2023-08-15", "sueldo": 2583.33, "motivo_retiro": "Fin de contrato"}
                ],
                "evaluaciones": [
                    {"descripcion_evaluacion": "Prueba de Atención al Cliente e Integración Corporativa", "nota_minima": 70.0, "fecha_evaluacion": "2024-02-10", "nota_obtenida": 94.0}
                ]
            },
            # 4. CLÚSTER 3: Especialistas Intermedios Estables
            {
                "nombres": "Fernando José",
                "apellidos": "Vásquez Castillo",
                "direccion": "Calzada Roosevelt 22-10, Zona 7",
                "telefono": "+502 5111-2233",
                "fecha_nacimiento": "1994-05-30",
                "estado_civil": "Casado",
                "anios_experiencia": 3.2,
                "calificacion_evaluacion": 4.0,
                "cumplimiento_metas": 80.0,
                "horas_mensuales": 90.0,
                "proyectos_recurrentes": 11,
                "comentario_evaluacion": "Especialista intermedio altamente confiable con trabajo en equipo constante, buena puntualidad y rendimiento estandarizado.",
                "experiencias": [
                    {"empresa": "Gestión Humana & Talento Corporativo", "direccion": "Zona 15", "desde_fecha": "2021-04-01", "hasta_fecha": "2024-01-31", "sueldo": 691.67, "motivo_retiro": "Mejor oferta salarial"}
                ],
                "evaluaciones": [
                    {"descripcion_evaluacion": "Evaluación de Selección de Personal y Clima Organizacional", "nota_minima": 75.0, "fecha_evaluacion": "2024-02-05", "nota_obtenida": 80.0}
                ]
            },
            # 5. CLÚSTER 1: Consultores Executive / Alta Facturación
            {
                "nombres": "Mariana Elizabeth",
                "apellidos": "Rios Salazar",
                "direccion": "Carretera a El Salvador Km 14",
                "telefono": "+502 5777-8899",
                "fecha_nacimiento": "1991-09-18",
                "estado_civil": "Soltera",
                "anios_experiencia": 10.8,
                "calificacion_evaluacion": 4.8,
                "cumplimiento_metas": 90.0,
                "horas_mensuales": 62.0,
                "proyectos_recurrentes": 13,
                "comentario_evaluacion": "Excelente precisión técnica, dirección de diseño de marca de primer nivel y alto valor aportado en la coordinación estratégica de cuentas corporativas.",
                "experiencias": [
                    {"empresa": "Estudio Creativo de Diseño & Marca", "direccion": "Zona 13", "desde_fecha": "2015-01-10", "hasta_fecha": "2023-12-20", "sueldo": 4041.67, "motivo_retiro": "Cambio de residencia"}
                ],
                "evaluaciones": [
                    {"descripcion_evaluacion": "Prueba de Diseño Gráfico Corporativo y UX Executive", "nota_minima": 75.0, "fecha_evaluacion": "2024-01-28", "nota_obtenida": 95.0}
                ]
            }
                ]
                for cand_dict in candidatos_semilla:
                    c = Candidato(
                        nombres=cand_dict["nombres"],
                        apellidos=cand_dict["apellidos"],
                        direccion=cand_dict["direccion"],
                        telefono=cand_dict["telefono"],
                        fecha_nacimiento=cand_dict["fecha_nacimiento"],
                        estado_civil=cand_dict["estado_civil"],
                        anios_experiencia=cand_dict["anios_experiencia"],
                        calificacion_evaluacion=cand_dict["calificacion_evaluacion"],
                        cumplimiento_metas=cand_dict["cumplimiento_metas"],
                        horas_mensuales=cand_dict["horas_mensuales"],
                        proyectos_recurrentes=cand_dict["proyectos_recurrentes"],
                        comentario_evaluacion=cand_dict["comentario_evaluacion"]
                    )
                    db.add(c)
                    db.commit()
                    db.refresh(c)

                    for exp in cand_dict["experiencias"]:
                        db.add(Experiencia(
                            id_candidato=c.id_candidato,
                            empresa=exp["empresa"],
                            direccion=exp["direccion"],
                            desde_fecha=exp["desde_fecha"],
                            hasta_fecha=exp["hasta_fecha"],
                            sueldo=exp["sueldo"],
                            motivo_retiro=exp["motivo_retiro"]
                        ))

                    for ev in cand_dict["evaluaciones"]:
                        db.add(Evaluacion(
                            id_candidato=c.id_candidato,
                            descripcion_evaluacion=ev["descripcion_evaluacion"],
                            nota_minima=ev["nota_minima"],
                            fecha_evaluacion=ev["fecha_evaluacion"],
                            nota_obtenida=ev["nota_obtenida"]
                        ))

                    db.commit()

        # Asegurar que los archivos planos estén siempre sincronizados
        sincronizar_a_archivos_planos(db)
    except Exception as e:
        print("Error sembrando candidatos iniciales:", e)
    finally:
        db.close()

# Sembrar candidatos al iniciar servidor y preparar modelos ML
poblar_datos_iniciales()
asegurar_datos_y_modelo_cargados("freelancers")
asegurar_datos_y_modelo_cargados("resenas")

app = FastAPI(
    title="TalentMosaic - API de RRHH",
    description="Plataforma Universal de Gestión de Talento y Reclutamiento de Recursos Humanos (Caso 5 USAC)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rutas.router)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "Front-end", "dist")

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Endpoint no encontrado.")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "sistema": "TalentMosaic RRHH Platform",
            "version": "2.0.0",
            "status": "online",
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)