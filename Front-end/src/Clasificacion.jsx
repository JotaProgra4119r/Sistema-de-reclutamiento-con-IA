import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext';
import { clusteringService } from './services/api';

export default function Clasificacion() {
  const { modelosEntrenados } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('freelancer'); // 'freelancer' o 'resena'
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  // 1. Estado para Formulario de Freelancer (9 Variables Numéricas)
  const [formDataFreelancer, setFormDataFreelancer] = useState({
    
  });

  // 2. Estado para Formulario de Reseña (Texto NLP libre)
  const [textoResena, setTextoResena] = useState('');

  const handleNumChange = (e) => {
    const { name, value } = e.target;
    setFormDataFreelancer({
      ...formDataFreelancer,
      [name]: parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    // BARRERA DE SEGURIDAD INTERNA
    const datasetKey = activeTab === 'freelancer' ? 'freelancers' : 'resenas';
    if (!modelosEntrenados[datasetKey]) {
      setError(`El modelo de ${datasetKey === 'resenas' ? 'reseñas' : 'freelancers'} no está entrenado en la Vista 2. No se puede predecir.`);
      setLoading(false);
      return;
    }

    try {
      let res;
      if (activeTab === 'freelancer') {
        // Ejecuta el método correcto del service unificado
        res = await clusteringService.predecirFreelancer(formDataFreelancer);
      } else {
        if (!textoResena.trim()) {
          throw new Error("Por favor, escribe un comentario antes de predecir.");
        }
        // Envía estrictamente la estructura JSON exigida por Pydantic: { "texto_reseña": "..." }
        res = await clusteringService.predecirResena({ texto_reseña: textoResena });
      }

      if (res.data && res.data.status === "success") {
        setResultado(res.data.segmento_asignado);
      } else {
        setResultado(res.data.segmento_asignado ?? 0);
      }
    } catch (err) {
      console.error("Fallo en predicción en tiempo real:", err);
      setError(err.response?.data?.message || err.message || "Error al procesar la clasificación en FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 animate-fadeIn">
      {/* Encabezado */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">5. Clasificación de Nuevo Registro</h2>
        <p className="text-gray-600 mt-1">Asigna nuevos elementos a los clústeres calculados por el motor de IA en tiempo real.</p>
      </div>

      {/* Sistema de Pestañas (Tabs) Habilitadas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('freelancer'); setResultado(null); setError(null); }}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'freelancer' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Clasificar Talento (Numérico)
        </button>
        <button
          onClick={() => { setActiveTab('resena'); setResultado(null); setError(null); }}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'resena' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Clasificar Reseña (Texto / NLP)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: FORMULARIOS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TAB FREELANCER (9 Inputs Numéricos) */}
            {activeTab === 'freelancer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Proyectos Completados</label>
                  <input type="number" name="proyectos_completados" value={formDataFreelancer.proyectos_completados} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ingresos Totales (USD)</label>
                  <input type="number" name="ingresos_totales" value={formDataFreelancer.ingresos_totales} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tarifa Promedio ($/hr)</label>
                  <input type="number" name="tarifa_hora_promedio" value={formDataFreelancer.tarifa_hora_promedio} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Años de Experiencia</label>
                  <input type="number" name="anios_experiencia" value={formDataFreelancer.anios_experiencia} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tiempo Respuesta (Hrs)</label>
                  <input type="number" name="tiempo_respuesta_horas" value={formDataFreelancer.tiempo_respuesta_horas} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tasa Finalización (%)</label>
                  <input type="number" name="tasa_finalizacion" value={formDataFreelancer.tasa_finalizacion} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Calificación Promedio</label>
                  <input type="number" step="0.1" name="calificacion_promedio" value={formDataFreelancer.calificacion_promedio} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Clientes Recurrentes</label>
                  <input type="number" name="clientes_recurrentes" value={formDataFreelancer.clientes_recurrentes} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Horas Mensuales</label>
                  <input type="number" name="horas_trabajadas_mes" value={formDataFreelancer.horas_trabajadas_mes} onChange={handleNumChange} className="w-full border p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            )}

            {/* TAB RESEÑA (Textarea NLP) */}
            {activeTab === 'resena' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Comentario u Opinión Libre sobre el Servicio:</label>
                <textarea
                  value={textoResena}
                  onChange={(e) => setTextoResena(e.target.value)}
                  placeholder="Ej. El freelancer entregó el software con retrasos pero la optimización del código de Python e interfaces en React fue soberbia..."
                  rows={5}
                  className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-medium text-slate-700"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-indigo-700 transition-all disabled:bg-slate-300"
            >
              {loading ? 'Calculando distancias vectoriales...' : 'Predecir Segmento'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: PANEL LATERAL DE RESULTADOS IDENTICO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Resultado del Motor</h3>
            
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {resultado !== null && !error && (
              <div className="mt-6 text-center animate-fadeIn">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Clasificación Exitosa
                </span>
                <p className="text-xs text-slate-400 mt-3 font-medium px-2">
                  El pipeline matemático de FastAPI procesó la muestra y la ha ubicado geométricamente en el:
                </p>
                <div className="text-4xl font-black text-slate-800 mt-4 tracking-tight">
                  Cluster <span className="text-indigo-600">{resultado}</span>
                </div>
              </div>
            )}

            {resultado === null && !error && (
              <div className="mt-12 text-center text-slate-400 text-xs font-medium italic">
                Ingresa los datos en el panel izquierdo y presiona el botón para consultar los centroides cargados en la RAM.
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-slate-400 border-t pt-2 mt-4 font-semibold uppercase tracking-wider text-center">
            Motor de Inferencia de Datos Activo
          </div>
        </div>

      </div>
    </div>
  );
}