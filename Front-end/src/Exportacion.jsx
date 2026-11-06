import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './services/api';

export default function Exportacion() {
  const [descargando, setDescargando] = useState(false);
  const [descargandoIndividual, setDescargandoIndividual] = useState(null);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  const [configExportacion, setConfigExportacion] = useState({
    freelancers_csv: true,
    candidatos_json: true,
    resenas_csv: true,
    matriz_estadistica: true,
    matriz_estandar: true,
    dashboards_metricas: true,
    listado_candidatos: true,
    registro_sql: true,
    expedientes_candidatos: true,
    auditoria_ml: true,
    reporte_grafico: true,
    resumen_estadistico: true,
    resumen_ejecutivo: true
  });

  const handleToggle = (campo) => {
    setConfigExportacion(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const seleccionarTodos = (valor) => {
    const nuevo = {};
    Object.keys(configExportacion).forEach(k => { nuevo[k] = valor; });
    setConfigExportacion(nuevo);
  };

  const ejecutarExportacionZip = async () => {
    const haySeleccion = Object.values(configExportacion).some(v => v === true);
    if (!haySeleccion) {
      setError("Debes seleccionar al menos un tipo de archivo para empaquetar.");
      return;
    }

    setDescargando(true);
    setError(null);
    setExito(null);

    try {
      const respuesta = await axios.post(`${API_BASE_URL}/export`, configExportacion, {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/json' }
      });

      const blob = new Blob([respuesta.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reportes_rrhh_talentmosaic.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setExito("¡Paquete ZIP corporativo de RRHH descargado con éxito conteniendo todos los módulos seleccionados!");
    } catch (err) {
      console.error("Error en la descarga del ZIP:", err);
      setError("Error al generar el archivo ZIP. Asegúrate de que el servidor backend esté activo.");
    } finally {
      setDescargando(false);
    }
  };

  const descargarIndividual = async (tipo, nombreArchivo) => {
    setDescargandoIndividual(tipo);
    setError(null);
    setExito(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/export/single/${tipo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setExito(`Archivo "${nombreArchivo}" descargado individualmente con éxito.`);
    } catch (err) {
      console.error(`Error al descargar ${tipo}:`, err);
      setError(`No se pudo descargar ${nombreArchivo}.`);
    } finally {
      setDescargandoIndividual(null);
    }
  };

  const itemsExportables = [
    // 1. DATASETS
    {
      id: 'freelancers_csv',
      categoria: 'datasets',
      tipoSingle: 'candidatos-csv',
      nombreArchivo: 'dataset_candidatos_segmentado.csv',
      titulo: 'Dataset de Candidatos y Talento (CSV)',
      descripcion: '1,590 registros limpios con las 9 variables numéricas, clúster asignado por IA y perfil de RRHH.',
      formato: 'CSV',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      id: 'candidatos_json',
      categoria: 'datasets',
      tipoSingle: 'candidatos-json',
      nombreArchivo: 'dataset_candidatos_segmentado.json',
      titulo: 'Dataset de Candidatos y Talento (JSON)',
      descripcion: 'Vaciado JSON estructurado del dataset de talentos con todas las columnas numéricas y de negocio.',
      formato: 'JSON',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
    },
    {
      id: 'resenas_csv',
      categoria: 'datasets',
      tipoSingle: 'resenas-csv',
      nombreArchivo: 'dataset_evaluaciones_rrhh.csv',
      titulo: 'Dataset de Evaluaciones Cualitativas NLP (CSV)',
      descripcion: '5,250 evaluaciones cualitativas balanceadas con sus reseñas de desempeño y clúster lingüístico.',
      formato: 'CSV',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
    },

    // 2. MATRICES
    {
      id: 'matriz_estandar',
      categoria: 'matrices',
      tipoSingle: 'matriz-estandar-csv',
      nombreArchivo: 'matriz_estandarizada_zscore.csv',
      titulo: 'Matriz Estándar Normalizada (StandardScaler Z-Score) (CSV)',
      descripcion: 'Matriz matemática escalada con media 0 y varianza 1 de todas las variables numéricas utilizadas en el clustering.',
      formato: 'CSV',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
    },
    {
      id: 'matriz_estadistica',
      categoria: 'matrices',
      tipoSingle: 'matriz-estadistica-csv',
      nombreArchivo: 'matriz_estadistica_distribucion.csv',
      titulo: 'Matriz Estadística Detallada (Media, Moda, Mediana) (CSV)',
      descripcion: 'Medidas de tendencia central, dispersión (Desv. Estándar), mínimos y máximos por cada uno de los 4 clústeres.',
      formato: 'CSV',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      id: 'matriz_estadistica',
      categoria: 'matrices',
      tipoSingle: 'matriz-estadistica-json',
      nombreArchivo: 'matriz_estadistica_distribucion.json',
      titulo: 'Matriz Estadística en JSON Estructurado',
      descripcion: 'Mismo análisis estadístico estructurado por clúster y variable para integración analítica automatizada.',
      formato: 'JSON',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
    },

    // 3. DASHBOARDS Y DESEMPEÑO
    {
      id: 'dashboards_metricas',
      categoria: 'dashboards',
      tipoSingle: 'dashboards-json',
      nombreArchivo: 'dashboards_metricas_sistema.json',
      titulo: 'Métricas y Dashboards del Sistema (JSON)',
      descripcion: 'Métricas consolidadas de rendimiento del sistema: KPIs de talento, sueldos promedio, benchmark ML y evaluaciones.',
      formato: 'JSON',
      badgeColor: 'bg-violet-100 text-violet-900 border-violet-300'
    },
    {
      id: 'dashboards_metricas',
      categoria: 'dashboards',
      tipoSingle: 'dashboards-csv',
      nombreArchivo: 'dashboards_resumen_candidatos.csv',
      titulo: 'Resumen Ejecutivo de Dashboards (CSV)',
      descripcion: 'Tabla consolidada con salarios, horas asignadas, cumplimiento de metas y diagnóstico asignado por IA.',
      formato: 'CSV',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },

    // 4. LISTADOS Y BASE DE DATOS SQL
    {
      id: 'listado_candidatos',
      categoria: 'sql',
      tipoSingle: 'listado-candidatos-csv',
      nombreArchivo: 'listado_candidatos_completo.csv',
      titulo: 'Listado Tabular de Candidatos SQL (CSV)',
      descripcion: 'Candidatos registrados en la base de datos con contacto, sueldo mensual, horas asignadas y clúster.',
      formato: 'CSV',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      id: 'registro_sql',
      categoria: 'sql',
      tipoSingle: 'registro-sql',
      nombreArchivo: 'registro_sql_talentmosaic.sql',
      titulo: 'Volcado de Base de Datos SQL (Dump .SQL)',
      descripcion: 'Script SQL completo con DDL y DML (CREATE TABLE e INSERTS) compatible con SQLite, MySQL y PostgreSQL.',
      formato: 'SQL',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      id: 'expedientes_candidatos',
      categoria: 'sql',
      tipoSingle: 'expedientes-json',
      nombreArchivo: 'expedientes_candidatos_rrhh.json',
      titulo: 'Expedientes de Candidatos con Historial y Evaluaciones (JSON)',
      descripcion: 'Expediente integral con historial de empresas, salarios anteriores y notas de evaluaciones técnicas.',
      formato: 'JSON',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
    },

    // 5. INFORMES EJECUTIVOS & VISUALES
    {
      id: 'resumen_ejecutivo',
      categoria: 'informes',
      tipoSingle: 'resumen-ejecutivo-txt',
      nombreArchivo: 'resumen_ejecutivo_dashboards.txt',
      titulo: 'Informe Ejecutivo y Recomendaciones para Dirección (TXT)',
      descripcion: 'Documento en texto plano con alineación de perfiles, advertencias operacionales, listado SQL y recomendaciones.',
      formato: 'TXT',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      id: 'reporte_grafico',
      categoria: 'informes',
      tipoSingle: 'dossier-pdf',
      nombreArchivo: 'dossier_ejecutivo_dashboards.pdf',
      titulo: 'Dossier Corporativo Completo con Dashboards y Gráficas (PDF)',
      descripcion: 'Documento multipágina en alta resolución con portada corporativa, dashboards de barras y donas, dispersión PCA y tabla SQL.',
      formato: 'PDF',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300'
    },
    {
      id: 'auditoria_ml',
      categoria: 'informes',
      tipoSingle: 'auditoria-json',
      nombreArchivo: 'auditoria_motor_ml.json',
      titulo: 'Auditoría y Benchmark del Motor de IA (JSON)',
      descripcion: 'Métricas de validación matemática (Silhouette 0.5621, Calinski-Harabasz 3934, Davies-Bouldin 0.67).',
      formato: 'JSON',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
    }
  ];

  const itemsFiltrados = itemsExportables.filter(item => {
    if (filtroCategoria === 'todos') return true;
    return item.categoria === filtroCategoria;
  });

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      
      {/* Encabezado */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            Exportación Corporativa Universal
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
            Centro de Exportación de Datos, Matrices y Reportes
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
            Descarga datasets balanceados, matriz estándar Z-score, volcados SQL, métricas de dashboards, JSONs y el dossier corporativo en PDF.
          </p>
        </div>

        {/* Acciones Globales */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => seleccionarTodos(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-300"
          >
            Marcar Todos
          </button>
          <button
            onClick={() => seleccionarTodos(false)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-300"
          >
            Desmarcar
          </button>
          <button
            onClick={ejecutarExportacionZip}
            disabled={descargando}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>📦</span> {descargando ? "Empaquetando..." : "Descargar Paquete ZIP (Completo)"}
          </button>
        </div>
      </div>

      {/* Contenedor Principal de Descargas */}
      <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Notificaciones */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-between shadow-xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-800 hover:text-rose-950 font-black ml-2 cursor-pointer">✕</button>
          </div>
        )}

        {exito && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-between shadow-xs">
            <span>✅ {exito}</span>
            <button onClick={() => setExito(null)} className="text-emerald-800 hover:text-emerald-950 font-black ml-2 cursor-pointer">✕</button>
          </div>
        )}

        {/* Pestañas de Filtro por Categoría */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {[
            { id: 'todos', label: 'Todos los Archivos (14)' },
            { id: 'datasets', label: '📊 Datasets (3)' },
            { id: 'matrices', label: '📐 Matrices Estándar & Estadísticas (3)' },
            { id: 'dashboards', label: '📈 Dashboards & Métricas (2)' },
            { id: 'sql', label: '🗄️ Registros SQL & Listados (3)' },
            { id: 'informes', label: '📑 PDFs & Informes TXT (3)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroCategoria(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtroCategoria === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rejilla de Módulos Exportables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsFiltrados.map((item, index) => (
            <div 
              key={index}
              className="p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={configExportacion[item.id] || false} 
                      onChange={() => handleToggle(item.id)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-slate-900 text-xs md:text-sm line-clamp-1">{item.titulo}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${item.badgeColor}`}>
                    {item.formato}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 font-medium leading-relaxed">
                  {item.descripcion}
                </p>
              </div>

              {/* Botón de Descarga Directa Individual */}
              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                  {item.nombreArchivo}
                </span>
                <button
                  type="button"
                  disabled={descargandoIndividual === item.tipoSingle}
                  onClick={() => descargarIndividual(item.tipoSingle, item.nombreArchivo)}
                  className="px-3 py-1 rounded-xl bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-300 hover:border-indigo-300 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                >
                  {descargandoIndividual === item.tipoSingle ? (
                    <span>Descargando...</span>
                  ) : (
                    <>
                      <span>⬇️</span> Descargar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Barra Inferior con Botón de Empaquetado ZIP */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl">
          <div>
            <span className="block text-xs font-black text-slate-900">Paquete Consolidado para Dirección y Auditoría</span>
            <span className="text-xs text-slate-500 font-medium">Archivo comprimido de salida: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-indigo-700">reportes_rrhh_talentmosaic.zip</code></span>
          </div>

          <button 
            onClick={ejecutarExportacionZip} 
            disabled={descargando} 
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm active:scale-95 cursor-pointer"
          >
            {descargando ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                Empaquetando ZIP Corporativo...
              </>
            ) : (
              <>
                <span>📦</span> Descargar Paquete ZIP Consolidado (15 Archivos)
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
