import { useContext, useState } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';

export default function Exportacion() {
  const { modelosEntrenados } = useContext(AppContext);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);

  // Estado que refleja EXACTAMENTE el modelo Pydantic de tu compañero
  const [configExportacion, setConfigExportacion] = useState({
    freelancers_csv: true,
    resumen_estadistico: true,
    reporte_grafico: true
  });

  const handleToggle = (campo) => {
    setConfigExportacion(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const ejecutarExportacion = async () => {
    // Validación: debe haber al menos un documento seleccionado
    if (!configExportacion.freelancers_csv && !configExportacion.resumen_estadistico && !configExportacion.reporte_grafico) {
      setError("Debes seleccionar al menos un tipo de reporte para exportar.");
      return;
    }

    setDescargando(true);
    setError(null);

    try {
      // Petición al endpoint real de tu compañero
      const respuesta = await axios.post('http://localhost:8000/api/export', configExportacion, {
        responseType: 'blob', // ¡CRÍTICO! Si falta esto, el ZIP se corrompe en el navegador
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Si el backend devuelve un error 400 (ej. zip vacío de 22 bytes), Axios lanza excepción.
      // Aquí procesamos el Blob binario y forzamos la descarga nativa
      const blob = new Blob([respuesta.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // El nombre del archivo puede ser dinámico, o usar el que envía el header Content-Disposition
      link.setAttribute('download', 'reportes_talentmosaic.zip');
      document.body.appendChild(link);
      link.click();
      
      // Limpieza de memoria
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Error en la descarga:", err);
      // Si Python lanza un JSONResponse(status_code=400), el Blob intenta leerlo como texto
      if (err.response && err.response.data instanceof Blob) {
          const text = await err.response.data.text();
          setError(`El servidor rechazó la petición: ${text}`);
      } else {
          setError("Error de conexión con el motor FastAPI. Asegúrate de que el servidor esté corriendo en el puerto 8000.");
      }
    } finally {
      setDescargando(false);
    }
  };

  // Bloqueo de seguridad: No exportar si no hay modelo en memoria
  if (!modelosEntrenados.freelancers && !modelosEntrenados.reseñas) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm text-center font-bold">
        Acceso denegado: El motor de exportación está bloqueado. Entrena un modelo en la Vista 2 para generar reportes.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configuración de Exportación</h2>
        <p className="text-slate-500 text-sm">Selecciona los artefactos que deseas compilar. El sistema generará un paquete ZIP comprimido.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Formulario que mapea a la clase ExportConfig de Python */}
        <div className="space-y-4">
          <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={configExportacion.freelancers_csv} 
              onChange={() => handleToggle('freelancers_csv')}
              className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="block font-bold text-slate-800">Dataset Segmentado (CSV)</span>
              <span className="block text-sm text-slate-500">El dataset original inyectado con una nueva columna que identifica el cluster asignado a cada freelancer.</span>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={configExportacion.resumen_estadistico} 
              onChange={() => handleToggle('resumen_estadistico')}
              className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="block font-bold text-slate-800">Resumen Estadístico (JSON/CSV)</span>
              <span className="block text-sm text-slate-500">Métricas consolidadas (centroides, cantidad de elementos por segmento).</span>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={configExportacion.reporte_grafico} 
              onChange={() => handleToggle('reporte_grafico')}
              className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="block font-bold text-slate-800">Reporte Visual Analítico (PDF)</span>
              <span className="block text-sm text-slate-500">Documento renderizado con Matplotlib que contiene el scatter plot y distribuciones de los clusters.</span>
            </div>
          </label>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button 
            onClick={ejecutarExportacion} 
            disabled={descargando} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            {descargando ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Empaquetando ZIP...
              </>
            ) : (
              "Descargar Paquete ZIP"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}