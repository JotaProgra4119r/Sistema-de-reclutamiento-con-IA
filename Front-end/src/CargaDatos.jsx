import React, { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import Papa from 'papaparse';
import axios from 'axios';

export default function CargaDatos() {
  // Consumimos de manera global los estados del AppContext
  const {
    fileFreelancers, setFileFreelancers,
    fileResenas, setFileResenas,
    previewFreelancers, setPreviewFreelancers,
    previewResenas, setPreviewResenas,
    limpiezaStatus, setLimpiezaStatus,
    resetFrontendStates
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

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

  // --- SOLUCIÓN DE RAÍZ: CARGA INDEPENDIENTE O SIMULTÁNEA DE AMBOS DATASETS ---
  const handleLimpiarDatos = async () => {
    if (!fileFreelancers && !fileResenas) {
      alert("Por favor, selecciona al menos un archivo CSV (Freelancers o Reseñas) para preprocesar.");
      return;
    }

    setLoading(true);
    setLimpiezaStatus(null);
    let logsGlobales = {};

    try {
      // Flujo A: Si el usuario cargó el archivo de Freelancers, lo mandamos a su endpoint
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

      // Flujo B: Si el usuario cargó el archivo de Reseñas, lo mandamos a su respectivo endpoint
      if (fileResenas) {
        const formDataR = new FormData();
        formDataR.append('file', fileResenas); // La llave exacta que espera FastAPI
        
        const resR = await axios.post('http://localhost:8000/api/upload/resenas', formDataR, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (resR.data.status === "success") {
          // Fusionamos las respuestas de limpieza de texto para mostrarlas en la UI
          const statsResenas = resR.data.limpieza_status || { 
            reseñas_procesadas: "Éxito en RAM", 
            estado: "Sanitizado" 
          };
          logsGlobales = { ...logsGlobales, ...statsResenas };
        }
      }

      // Desplegamos el log combinado en la interfaz
      setLimpiezaStatus(logsGlobales);
      alert("Preprocesamiento ejecutado con éxito en el servidor FastAPI.");

    } catch (error) {
      console.error("Fallo la conexión con el backend:", error);
      const mensajeError = error.response?.data?.message || error.response?.data?.detail || "Error de comunicación con FastAPI.";
      alert(`Error al procesar los datos: ${mensajeError}`);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA ACCIÓN: PURGAR DATOS DE LA MEMORIA RAM ---
  const handlePurgarMemoria = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente todos los datos y modelos de la memoria RAM del servidor?")) {
      return;
    }

    try {
      const respuesta = await axios.post('http://localhost:8000/api/clear-memory');
      if (respuesta.data.status === "success") {
        resetFrontendStates(); // Purgamos visualmente el Frontend
        alert(respuesta.data.message);
      }
    } catch (error) {
      console.error("Error al purgar la memoria:", error);
      alert("No se pudo conectar con el servidor para purgar la memoria.");
    }
  };

  const RenderTable = ({ data, title }) => (
    <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        {data.headers.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                {data.headers.map((h, i) => <th key={i} className="px-4 py-2 text-left font-semibold text-slate-600">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row, idx) => (
                <tr key={idx}>
                  {data.headers.map((h, i) => <td key={i} className="px-4 py-2 text-slate-500 truncate max-w-[120px]">{row[h]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-sm text-slate-400 text-center italic">Esperando archivo...</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Carga y Preprocesamiento</h2>
        <p className="text-slate-500 text-sm">Gestiona la ingesta de datos para iniciar el flujo de TalentMosaic.</p>
      </div>

      {/* Grid de Carga */}
      <div className="grid grid-cols-2 gap-6">
        {[
          { label: 'Freelancers (CSV)', setFile: setFileFreelancers, setPreview: setPreviewFreelancers, filename: fileFreelancers?.name },
          { label: 'Reseñas (CSV)', setFile: setFileResenas, setPreview: setPreviewResenas, filename: fileResenas?.name }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-1">{item.label}</label>
            {item.filename && <span className="block text-xs text-indigo-500 font-medium mb-2">Archivo actual: {item.filename}</span>}
            <input
              type="file" accept=".csv" onChange={(e) => handleFileUpload(e, item.setFile, item.setPreview)} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
          </div>
        ))}
      </div>

      {/* Vista Previa */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Vista Previa de Datos</h3>
        <div className="flex gap-6">
          <RenderTable data={previewFreelancers} title="freelancers.csv" />
          <RenderTable data={previewResenas} title="reseñas_clientes.csv" />
        </div>
      </div>

      {/* Preprocesamiento */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Acciones</h3>
        <div className="flex gap-4">
          <button
            onClick={handleLimpiarDatos} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "Preprocesando..." : "Ejecutar Limpieza"}
          </button>
          
          <button
            onClick={handlePurgarMemoria} 
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all active:scale-95"
          >
            Purgar Memoria RAM
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          {limpiezaStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-700">
              {Object.entries(limpiezaStatus).map(([key, val]) => (
                <div key={key}>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold">{key.replace(/_/g, ' ')}</span>
                  <strong className="text-lg text-indigo-600">{String(val)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Los resultados de la limpieza aparecerán aquí...</p>
          )}
        </div>
      </div>
    </div>
  );
}