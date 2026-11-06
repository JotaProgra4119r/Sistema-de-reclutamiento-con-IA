import os
import json
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from typing import List, Optional

# --- CONFIGURACIÓN DE BASE DE DATOS RELACIONAL EN /Database ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_DIR = os.path.join(BASE_DIR, "Database")
os.makedirs(DATABASE_DIR, exist_ok=True)

DB_PATH = os.path.join(DATABASE_DIR, "talentmosaic.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Rutas de Archivos Planos (Flat Files) para Compatibilidad Multiplataforma (Linux / Debian / Windows)
FLAT_JSON_PATH = os.path.join(DATABASE_DIR, "candidatos.json")
FLAT_CANDIDATOS_CSV = os.path.join(DATABASE_DIR, "candidatos.csv")
FLAT_EXPERIENCIAS_CSV = os.path.join(DATABASE_DIR, "experiencias.csv")
FLAT_EVALUACIONES_CSV = os.path.join(DATABASE_DIR, "evaluaciones.csv")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MODELOS ORM SQLALCHEMY (CASO 5 USAC & MÉTRICAS DE IA DE RRHH) ---

class Candidato(Base):
    __tablename__ = "candidatos"

    id_candidato = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=True)
    telefono = Column(String(50), nullable=True)
    fecha_nacimiento = Column(String(20), nullable=True)
    estado_civil = Column(String(50), nullable=True)

    # Campos adicionales de clasificación en tiempo real & NLP cualitativo
    anios_experiencia = Column(Float, nullable=True, default=2.0)
    calificacion_evaluacion = Column(Float, nullable=True, default=4.5)
    cumplimiento_metas = Column(Float, nullable=True, default=90.0)
    horas_mensuales = Column(Float, nullable=True, default=160.0)
    proyectos_recurrentes = Column(Integer, nullable=True, default=3)
    comentario_evaluacion = Column(Text, nullable=True)

    experiencias = relationship("Experiencia", back_populates="candidato", cascade="all, delete-orphan")
    evaluaciones = relationship("Evaluacion", back_populates="candidato", cascade="all, delete-orphan")

class Experiencia(Base):
    __tablename__ = "experiencia"

    id_experiencia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_candidato = Column(Integer, ForeignKey("candidatos.id_candidato"), nullable=False)
    empresa = Column(String(150), nullable=False)
    direccion = Column(String(200), nullable=True)
    desde_fecha = Column(String(20), nullable=True)
    hasta_fecha = Column(String(20), nullable=True)
    sueldo = Column(Float, nullable=True, default=0.0)
    motivo_retiro = Column(String(255), nullable=True)

    candidato = relationship("Candidato", back_populates="experiencias")

class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id_evaluacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_candidato = Column(Integer, ForeignKey("candidatos.id_candidato"), nullable=False)
    descripcion_evaluacion = Column(String(255), nullable=True)
    nota_minima = Column(Float, nullable=False, default=0.0)
    fecha_evaluacion = Column(String(20), nullable=True)
    nota_obtenida = Column(Float, nullable=False, default=0.0)

    candidato = relationship("Candidato", back_populates="evaluaciones")

# --- ESQUEMAS PYDANTIC DE VALIDACIÓN Y SERIALIZACIÓN ---

class ExperienciaBase(BaseModel):
    empresa: str
    direccion: Optional[str] = None
    desde_fecha: Optional[str] = None
    hasta_fecha: Optional[str] = None
    sueldo: Optional[float] = 0.0
    motivo_retiro: Optional[str] = None

class ExperienciaCreate(ExperienciaBase):
    pass

class ExperienciaResponse(ExperienciaBase):
    id_experiencia: int
    id_candidato: int

    class Config:
        from_attributes = True

class EvaluacionBase(BaseModel):
    descripcion_evaluacion: Optional[str] = None
    nota_minima: float = 0.0
    fecha_evaluacion: Optional[str] = None
    nota_obtenida: float = 0.0

class EvaluacionCreate(EvaluacionBase):
    pass

class EvaluacionResponse(EvaluacionBase):
    id_evaluacion: int
    id_candidato: int

    class Config:
        from_attributes = True

class CandidatoBase(BaseModel):
    nombres: str
    apellidos: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    estado_civil: Optional[str] = None
    anios_experiencia: Optional[float] = 2.0
    calificacion_evaluacion: Optional[float] = 4.5
    cumplimiento_metas: Optional[float] = 90.0
    horas_mensuales: Optional[float] = 160.0
    proyectos_recurrentes: Optional[int] = 3
    comentario_evaluacion: Optional[str] = None

class CandidatoCreate(CandidatoBase):
    experiencias: Optional[List[ExperienciaCreate]] = []
    evaluaciones: Optional[List[EvaluacionCreate]] = []

class CandidatoResponse(CandidatoBase):
    id_candidato: int
    experiencias: List[ExperienciaResponse] = []
    evaluaciones: List[EvaluacionResponse] = []

    class Config:
        from_attributes = True


# =============================================================================
# PERSISTENCIA Y SINCRONIZACIÓN EN ARCHIVOS PLANOS (/Database/*.json, *.csv)
# =============================================================================

def sincronizar_a_archivos_planos(db):
    """Sincroniza el estado actual de la BD relacional hacia archivos planos en /Database/"""
    try:
        candidatos = db.query(Candidato).all()
        lista_candidatos = []
        filas_candidatos_csv = []
        filas_exp_csv = []
        filas_eval_csv = []

        for c in candidatos:
            c_dict = {
                "id_candidato": c.id_candidato,
                "nombres": c.nombres,
                "apellidos": c.apellidos,
                "direccion": c.direccion,
                "telefono": c.telefono,
                "fecha_nacimiento": c.fecha_nacimiento,
                "estado_civil": c.estado_civil,
                "anios_experiencia": c.anios_experiencia,
                "calificacion_evaluacion": c.calificacion_evaluacion,
                "cumplimiento_metas": c.cumplimiento_metas,
                "horas_mensuales": c.horas_mensuales,
                "proyectos_recurrentes": c.proyectos_recurrentes,
                "comentario_evaluacion": c.comentario_evaluacion,
                "experiencias": [],
                "evaluaciones": []
            }

            filas_candidatos_csv.append({
                "id_candidato": c.id_candidato,
                "nombres": c.nombres,
                "apellidos": c.apellidos,
                "direccion": c.direccion,
                "telefono": c.telefono,
                "fecha_nacimiento": c.fecha_nacimiento,
                "estado_civil": c.estado_civil,
                "anios_experiencia": c.anios_experiencia,
                "calificacion_evaluacion": c.calificacion_evaluacion,
                "cumplimiento_metas": c.cumplimiento_metas,
                "horas_mensuales": c.horas_mensuales,
                "proyectos_recurrentes": c.proyectos_recurrentes,
                "comentario_evaluacion": c.comentario_evaluacion
            })

            for e in c.experiencias:
                e_dict = {
                    "id_experiencia": e.id_experiencia,
                    "id_candidato": e.id_candidato,
                    "empresa": e.empresa,
                    "direccion": e.direccion,
                    "desde_fecha": e.desde_fecha,
                    "hasta_fecha": e.hasta_fecha,
                    "sueldo": e.sueldo,
                    "motivo_retiro": e.motivo_retiro
                }
                c_dict["experiencias"].append(e_dict)
                filas_exp_csv.append(e_dict)

            for ev in c.evaluaciones:
                ev_dict = {
                    "id_evaluacion": ev.id_evaluacion,
                    "id_candidato": ev.id_candidato,
                    "descripcion_evaluacion": ev.descripcion_evaluacion,
                    "nota_minima": ev.nota_minima,
                    "fecha_evaluacion": ev.fecha_evaluacion,
                    "nota_obtenida": ev.nota_obtenida
                }
                c_dict["evaluaciones"].append(ev_dict)
                filas_eval_csv.append(ev_dict)

            lista_candidatos.append(c_dict)

        # 1. Guardar archivo plano JSON estructurado
        with open(FLAT_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(lista_candidatos, f, indent=2, ensure_ascii=False)

        # 2. Guardar archivos planos CSV
        df_c = pd.DataFrame(filas_candidatos_csv)
        df_c.to_csv(FLAT_CANDIDATOS_CSV, index=False, encoding="utf-8")

        df_exp = pd.DataFrame(filas_exp_csv) if filas_exp_csv else pd.DataFrame(columns=["id_experiencia", "id_candidato", "empresa", "direccion", "desde_fecha", "hasta_fecha", "sueldo", "motivo_retiro"])
        df_exp.to_csv(FLAT_EXPERIENCIAS_CSV, index=False, encoding="utf-8")

        df_eval = pd.DataFrame(filas_eval_csv) if filas_eval_csv else pd.DataFrame(columns=["id_evaluacion", "id_candidato", "descripcion_evaluacion", "nota_minima", "fecha_evaluacion", "nota_obtenida"])
        df_eval.to_csv(FLAT_EVALUACIONES_CSV, index=False, encoding="utf-8")

        return True
    except Exception as e:
        print("Error al sincronizar con archivos planos en /Database:", e)
        return False

def cargar_desde_archivos_planos(db):
    """Carga candidatos desde el archivo plano JSON hacia SQLite si la base de datos está vacía"""
    if not os.path.exists(FLAT_JSON_PATH):
        return False
    try:
        with open(FLAT_JSON_PATH, "r", encoding="utf-8") as f:
            candidatos_data = json.load(f)

        for cd in candidatos_data:
            c = Candidato(
                nombres=cd["nombres"],
                apellidos=cd["apellidos"],
                direccion=cd.get("direccion"),
                telefono=cd.get("telefono"),
                fecha_nacimiento=cd.get("fecha_nacimiento"),
                estado_civil=cd.get("estado_civil"),
                anios_experiencia=cd.get("anios_experiencia", 2.0),
                calificacion_evaluacion=cd.get("calificacion_evaluacion", 4.5),
                cumplimiento_metas=cd.get("cumplimiento_metas", 90.0),
                horas_mensuales=cd.get("horas_mensuales", 160.0),
                proyectos_recurrentes=cd.get("proyectos_recurrentes", 3),
                comentario_evaluacion=cd.get("comentario_evaluacion")
            )
            db.add(c)
            db.commit()
            db.refresh(c)

            for exp in cd.get("experiencias", []):
                db.add(Experiencia(
                    id_candidato=c.id_candidato,
                    empresa=exp["empresa"],
                    direccion=exp.get("direccion"),
                    desde_fecha=exp.get("desde_fecha"),
                    hasta_fecha=exp.get("hasta_fecha"),
                    sueldo=exp.get("sueldo", 0.0),
                    motivo_retiro=exp.get("motivo_retiro")
                ))

            for ev in cd.get("evaluaciones", []):
                db.add(Evaluacion(
                    id_candidato=c.id_candidato,
                    descripcion_evaluacion=ev.get("descripcion_evaluacion"),
                    nota_minima=ev.get("nota_minima", 0.0),
                    fecha_evaluacion=ev.get("fecha_evaluacion"),
                    nota_obtenida=ev.get("nota_obtenida", 0.0)
                ))

            db.commit()
        return True
    except Exception as e:
        print("Error cargando desde archivos planos:", e)
        return False
