import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend"))
from base_datos import SessionLocal, Candidato
from rutas import predecir_candidato_sql
from motor_ml import MAPEO_CLUSTER_NEGOCIO

db = SessionLocal()
cands = db.query(Candidato).all()
print(f"Total candidates in DB: {len(cands)}")
for c in cands:
    res = predecir_candidato_sql(c.id_candidato, db)
    print(f"ID {c.id_candidato}: {c.nombres} {c.apellidos} -> Clúster {res['segmento_asignado']} | {res['mapeo_negocio']['titulo']}")
db.close()
