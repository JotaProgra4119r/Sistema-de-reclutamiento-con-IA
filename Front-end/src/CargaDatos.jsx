import React, { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import Papa from 'papaparse';
import axios from 'axios';

export default function CargaDatos() {
  const {
    fileFreelancers, setFileFreelancers,
    fileResenas, setFileResenas,
    previewFreelancers, setPreviewFreelancers,
    previewResenas, setPreviewResenas,
    limpiezaStatus, setLimpiezaStatus,
    resetFrontendStates
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    setFile(file);
    if (file) {
      Papa.parse(file, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setPreview({
              headers: Object.keys(results.data[0]),
              rows: results.data
            });
          }
        }
      });
    }
  };

  const handleLimpiarDatos = async () => {
    if (!fileFreelancers && !fileResenas) {
      setError("Por favor selecciona al menos un archivo CSV (Candidatos o Evaluaciones) para procesar.");
      return;
    }

    setLoading(true);
    setLimpiezaStatus(null);
    setError(null);
    setMensaje(null);
    let logsGlobales = {};

    try {
      if (fileFreelancers) {
        const formDataF = new FormData();
        formDataF.append('file', fileFreelancers);
        
        const resF = await axios.post('http://localhost:8000/api/upload/freelancers', formDataF, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (resF.data.status === "success") {
          logsGlobales = { ...logsGlobales, ...resF.data.limpieza_status };
        }
      }

      if (fileResenas) {
        const formDataR = new FormData();
        formDataR.append('file', fileResenas);
        
        const resR = await axios.post('http://localhost:8000/api/upload/resenas', formDataR, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (resR.data.status === "success") {
          const statsResenas = resR.data.limpieza_status || { 
            evaluaciones_procesadas: "Éxito en RAM", 
            estado: "Sanitizado" 
          };
          logsGlobales = { ...logsGlobales, ...statsResenas };
        }
      }

      setLimpiezaStatus(logsGlobales);
      setMensaje("Preprocesamiento y sanitización ejecutados con éxito en el servidor.");

    } catch (error) {
      console.error("Fallo la conexión con el backend:", error);
      const mensajeError = error.response?.data?.message || error.response?.data?.detail || "Error de comunicación con FastAPI.";
      setError(`Error al procesar los datos: ${mensajeError}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurgarMemoria = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente todos los datos y modelos de la memoria RAM del servidor?")) {
      return;
    }

    try {
      const respuesta = await axios.post('http://localhost:8000/api/clear-memory');
      if (respuesta.data.status === "success") {
        resetFrontendStates();
        setMensaje(respuesta.data.message);
      }
    } catch (error) {
      console.error("Error al purgar la memoria:", error);
      setError("No se pudo conectar con el servidor para purgar la memoria.");
    }
  };

  const RenderTable = ({ data, title }) => (
    <div className="flex-1 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs bg-white/90 backdrop-blur-md">
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        {data.headers.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50">
              <tr>
                {data.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-bold text-slate-600 truncate max-w-[130px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {data.headers.map((h, i) => (
                    <td key={i} className="px-3 py-2 text-slate-600 truncate max-w-[130px]">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-xs text-slate-400 text-center italic">Esperando archivo CSV para previsualizar...</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
          1. Módulo de Carga y Preprocesamiento
        </span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
          Ingesta y Sanitización de Datasets de RRHH
        </h1>
        <p className="text-xs md:text-sm text-slate-700 mt-1 font-medium">
          Carga archivos CSV de candidatos y evaluaciones cualitativas para limpieza matemática de valores nulos o atípicos.
        </p>
      </div>

      {mensaje && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-between shadow-xs">
          <span>✅ {mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-emerald-800 hover:text-emerald-950 font-black ml-2">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-between shadow-xs">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-800 hover:text-rose-950 font-black ml-2">✕</button>
        </div>
      )}

      {/* Grid de Carga Adaptable para Móvil / Android y Pantallas Anchas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[
          { label: 'Dataset de Candidatos / Talentos (CSV)', setFile: setFileFreelancers, setPreview: setPreviewFreelancers, filename: fileFreelancers?.name, hint: 'candidatos_talentos.csv' },
          { label: 'Evaluaciones Cualitativas de RRHH (CSV)', setFile: setFileResenas, setPreview: setPreviewResenas, filename: fileResenas?.name, hint: 'evaluaciones_cualitativas_rrhh.csv' }
        ].map((item, i) => (
          <div key={i} className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-900">{item.label}</label>
              <span className="text-xs text-slate-500 font-mono font-semibold">{item.hint}</span>
            </div>
            {item.filename && (
              <span className="inline-block text-xs bg-indigo-50 text-indigo-900 font-bold px-2.5 py-1 rounded-lg border border-indigo-300">
                Archivo cargado: {item.filename}
              </span>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, item.setFile, item.setPreview)}
              className="block w-full text-xs text-slate-700 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-indigo-200 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-800 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Vista Previa de Datos */}
      <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Vista Previa de Muestras (5 Primeros Registros)
        </h3>
        <div className="flex flex-col lg:flex-row gap-4">
          <RenderTable data={previewFreelancers} title="Candidatos (candidatos_talentos.csv)" />
          <RenderTable data={previewResenas} title="Evaluaciones (evaluaciones_cualitativas_rrhh.csv)" />
        </div>
      </div>

      {/* Acciones del Motor */}
      <div className="bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/60 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Acciones de Limpieza y Control de Memoria
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLimpiarDatos}
            disabled={loading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md text-xs md:text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Preprocesando en FastAPI..." : "🧹 Ejecutar Limpieza y Sanitización"}
          </button>
          
          <button
            onClick={handlePurgarMemoria}
            className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-3 px-6 rounded-2xl text-xs md:text-sm transition-all active:scale-95"
          >
            🗑️ Purgar Memoria RAM
          </button>
        </div>

        {/* Resumen de Saneamiento */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
          {limpiezaStatus ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(limpiezaStatus).map(([key, val]) => (
                <div key={key} className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[10px] uppercase text-slate-400 font-bold">{key.replace(/_/g, ' ')}</span>
                  <strong className="text-base text-emerald-700 font-black">{String(val)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Los registros de saneamiento y métricas de imputación se mostrarán aquí una vez ejecutada la limpieza.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}