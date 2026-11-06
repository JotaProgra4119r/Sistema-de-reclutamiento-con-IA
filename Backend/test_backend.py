import unittest
import os
import io
import sys
import pandas as pd

# Permitir importación directa del directorio Backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from base_datos import engine, Base, SessionLocal, Candidato, DB_PATH
from motor_ml import MAPEO_CLUSTER_NEGOCIO

client = TestClient(app)

class TestBackendRRHH(unittest.TestCase):

    def test_01_database_path_and_tables(self):
        """Verifica que la base de datos relacional del Caso 5 exista en /Database y contenga tablas"""
        self.assertTrue(os.path.exists(DB_PATH), f"La base de datos SQLite no existe en: {DB_PATH}")
        db = SessionLocal()
        count_candidatos = db.query(Candidato).count()
        db.close()
        self.assertGreater(count_candidatos, 0, "Debe existir al menos 1 candidato semilla en la BD SQL.")

    def test_02_mapeo_cluster_negocio_rrhh(self):
        """Verifica la interpretabilidad empresarial elegida para los 4 clústeres de RRHH"""
        self.assertIn("Talento Inicial / En Desarrollo", MAPEO_CLUSTER_NEGOCIO[0]["etiqueta"])
        self.assertIn("Consultores Executive / Alta Facturación", MAPEO_CLUSTER_NEGOCIO[1]["etiqueta"])
        self.assertIn("Soporte Operativo / Alta Intensidad", MAPEO_CLUSTER_NEGOCIO[2]["etiqueta"])
        self.assertIn("Especialistas Intermedios Estables", MAPEO_CLUSTER_NEGOCIO[3]["etiqueta"])

    def test_03_flujo_ml_y_clustering(self):
        """Prueba la ingesta de CSV, clustering K-Means, estadísticas, predicción y exportación ZIP"""
        # 1. Ingesta Candidatos
        f_csv = os.path.join(os.path.dirname(__file__), "freelancers_dev.csv")
        with open(f_csv, "rb") as f:
            res_upload_f = client.post("/api/upload/freelancers", files={"file": ("freelancers_dev.csv", f, "text/csv")})
        self.assertEqual(res_upload_f.status_code, 200)

        # 2. Ingesta Evaluaciones Cualitativas
        r_csv = os.path.join(os.path.dirname(__file__), "resenas_clientes_dev.csv")
        with open(r_csv, "rb") as f:
            res_upload_r = client.post("/api/upload/resenas", files={"file": ("resenas_clientes_dev.csv", f, "text/csv")})
        self.assertEqual(res_upload_r.status_code, 200)

        # 3. Clustering K-Means Candidatos
        res_cluster = client.post("/api/cluster", json={
            "dataset": "freelancers",
            "algoritmo": "K-Means",
            "n_clusters": 4
        })
        self.assertEqual(res_cluster.status_code, 200)

        # 4. Clustering K-Means Evaluaciones NLP
        res_cluster_r = client.post("/api/cluster", json={
            "dataset": "resenas",
            "algoritmo": "K-Means",
            "n_clusters": 4
        })
        self.assertEqual(res_cluster_r.status_code, 200)

        # 5. Estadísticas de Candidatos
        res_stats_f = client.get("/api/stats/freelancers")
        self.assertEqual(res_stats_f.status_code, 200)
        self.assertIn("data", res_stats_f.json())

        # 6. Estadísticas de Evaluaciones Cualitativas
        res_stats_r = client.get("/api/stats/resenas")
        self.assertEqual(res_stats_r.status_code, 200)

        # 7. Evaluación de Métricas (Silhouette, Davies-Bouldin, Calinski-Harabasz)
        res_eval_f = client.get("/api/evaluacion/freelancers")
        self.assertEqual(res_eval_f.status_code, 200)
        self.assertIn("silhouette_score", res_eval_f.json())

        # 8. Predicción en tiempo real de nuevo candidato
        res_pred = client.post("/api/predict/freelancers", json={
            "proyectos_completados": 15,
            "ingresos_totales": 50000,
            "tarifa_hora_promedio": 40,
            "anios_experiencia": 5,
            "tiempo_respuesta_horas": 2,
            "tasa_finalizacion": 98,
            "calificacion_promedio": 4.8,
            "clientes_recurrentes": 6,
            "horas_trabajadas_mes": 150
        })
        self.assertEqual(res_pred.status_code, 200)
        self.assertIn("segmento_asignado", res_pred.json())

        # 9. Predicción de candidato desde SQL (Caso 5)
        res_pred_sql = client.post("/api/hr/candidatos/1/predict")
        self.assertEqual(res_pred_sql.status_code, 200)
        self.assertIn("segmento_asignado", res_pred_sql.json())

        # 10. Exportación de Paquete ZIP de Reportes Ampliado
        res_exp = client.post("/api/export", json={
            "freelancers_csv": True,
            "resenas_csv": True,
            "resumen_estadistico": True,
            "reporte_grafico": True,
            "matriz_estadistica": True,
            "expedientes_candidatos": True,
            "auditoria_ml": True,
            "resumen_ejecutivo": True
        })
        self.assertEqual(res_exp.status_code, 200)
        self.assertEqual(res_exp.headers.get("content-type"), "application/x-zip-compressed")

        # 11. Endpoint de Benchmark de Modelos
        res_bench = client.get("/api/benchmark/modelos")
        self.assertEqual(res_bench.status_code, 200)
        self.assertEqual(res_bench.json().get("modelo_recomendado"), "K-Means")
        self.assertEqual(res_bench.json().get("k_optimo"), 4)

        # 12. Descargas Individuales Directas
        res_single_matriz = client.get("/api/export/single/matriz-estadistica-json")
        self.assertEqual(res_single_matriz.status_code, 200)
        res_single_auditoria = client.get("/api/export/single/auditoria-json")
        self.assertEqual(res_single_auditoria.status_code, 200)
        res_single_sql = client.get("/api/export/single/registro-sql")
        self.assertEqual(res_single_sql.status_code, 200)
        res_single_std = client.get("/api/export/single/matriz-estandar-csv")
        self.assertEqual(res_single_std.status_code, 200)
        res_single_pdf = client.get("/api/export/single/dossier-pdf")
        self.assertEqual(res_single_pdf.status_code, 200)
        res_single_dash = client.get("/api/export/single/dashboards-json")
        self.assertEqual(res_single_dash.status_code, 200)

        # 13. Endpoint de Dashboards y Desempeño
        res_dash = client.get("/api/dashboard/stats")
        self.assertEqual(res_dash.status_code, 200)
        self.assertEqual(res_dash.json().get("status"), "success")
        self.assertIn("resumen_general", res_dash.json())
        self.assertIn("candidatos_detallados", res_dash.json())
        self.assertEqual(len(res_dash.json().get("candidatos_detallados", [])), 5)

if __name__ == "__main__":
    unittest.main()

