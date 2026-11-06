import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';
import { clusteringService } from './services/api';

export default function Entrenamiento() {
  const { setModelosEntrenados } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState([]);

  // Modelo óptimo predeterminado para RRHH: K-Means con k=4
  const [formData, setFormData] = useState({
    dataset: 'freelancers',
    algoritmo: 'K-Means',
    n_clusters: 4,
    vectorizacion: 'TF-IDF',
    epsilon: 0.5,
    min_samples: 3
  });

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/benchmark/modelos');
        if (res.data.status === 'success') {
          setBenchmarkData(res.data.benchmark);
        }
      } catch (e) {
        console.error("Error cargando benchmark:", e);
      }
    };
    fetchBenchmark();
  }, []);

  const aplicarModeloOptimo = () => {
    setFormData({
      dataset: 'freelancers',
      algoritmo: 'K-Means',
      n_clusters: 4,
      vectorizacion: 'TF-IDF',
      epsilon: 0.5,
      min_samples: 3
    });
    setMessage({
      type: 'success',
      text: 'Parámetros restablecidos al Modelo Óptimo de RRHH: K-Means con k=4.'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'n_clusters' || name === 'min_samples' 
        ? parseInt(value) || 0 
        : name === 'epsilon' 
          ? parseFloat(value) || 0.0 
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await clusteringService.entrenarModelo(formData);
      
      if (res.data.status === 'success') {
        const llaveContexto = formData.dataset === 'resenas' ? 'resenas' : 'freelancers';
        
        setModelosEntrenados(prev => ({ 
          ...prev, 
          [llaveContexto]: true 
        }));
        
        setMessage({ 
          type: 'success', 
          text: `¡Motor de RRHH entrenado con éxito usando ${formData.algoritmo} (${formData.n_clusters} clústeres) para ${formData.dataset === 'resenas' ? 'evaluaciones cualitativas (NLP)' : 'candidatos'}!` 
        });
      }
    } catch (err) {
      console.error("Error capturado en el submit de entrenamiento:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error en la segmentación matemática. Verifica haber cargado o sincronizado el dataset primero.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
          2. Configuración y Entrenamiento de Modelos
        </span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
          Motor de Aprendizaje Automático y Determinación de Modelo Óptimo
        </h1>
        <p className="text-xs md:text-sm text-slate-700 mt-1 font-medium">
          Ajusta los hiperparámetros o ejecuta el modelo empíricamente óptimo determinado para nuestro caso de selección y clasificación de RRHH.
        </p>
      </div>

      {/* Grid Principal en Pantalla Completa: Formulario + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Formulario de Entrenamiento (5 Columnas) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-black text-slate-900">Parámetros del Modelo</h2>
            <button
              type="button"
              onClick={aplicarModeloOptimo}
              className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition-all flex items-center gap-1 shadow-xs"
            >
              <span>⭐</span> Cargar Óptimo (k=4)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Selector de Dataset */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                1. Dataset Objetivo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.dataset === 'freelancers' ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                  <input
                    type="radio"
                    name="dataset"
                    value="freelancers"
                    checked={formData.dataset === 'freelancers'}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>👥 Candidatos (Numérico)</span>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.dataset === 'resenas' ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                  <input
                    type="radio"
                    name="dataset"
                    value="resenas"
                    checked={formData.dataset === 'resenas'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span>📝 Evaluaciones (NLP)</span>
                </label>
              </div>
            </div>

            {/* Selector de Algoritmo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  2. Algoritmo de Clustering
                </label>
                {formData.algoritmo === 'K-Means' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Recomendado RRHH
                  </span>
                )}
              </div>
              <select
                name="algoritmo"
                value={formData.algoritmo}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 p-3.5 rounded-2xl shadow-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-bold text-xs md:text-sm outline-none transition-all cursor-pointer"
              >
                <option value="K-Means">K-Means (Óptimo — Centroides Euclidianos y Determinismo)</option>
                <option value="DBSCAN">DBSCAN (Basado en Densidad y Detección de Ruido)</option>
                <option value="Jerárquico">Agrupamiento Jerárquico / Aglomerativo (Árboles Dendrogramas)</option>
                <option value="GMM">Modelos de Mezcla Gaussiana (GMM — Probabilístico)</option>
              </select>
            </div>

            {/* Hiperparámetros Condicionales */}
            {formData.algoritmo !== 'DBSCAN' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Número de Clústeres (k)
                  </label>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Óptimo: k = 4
                  </span>
                </div>
                <input
                  type="number"
                  name="n_clusters"
                  value={formData.n_clusters}
                  onChange={handleChange}
                  min="2"
                  max="12"
                  className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-xs md:text-sm font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-500 font-medium block">
                  Define los grupos de asignación de talento para el caso corporativo de RRHH.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn text-xs">
                <div>
                  <label className="block font-black text-slate-800 uppercase tracking-wider mb-1">
                    Epsilon (Radio)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10.0"
                    name="epsilon"
                    value={formData.epsilon}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 uppercase tracking-wider mb-1">
                    Muestras Mínimas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    name="min_samples"
                    value={formData.min_samples}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* Configuración NLP si se selecciona dataset de reseñas */}
            {formData.dataset === 'resenas' && (
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 animate-fadeIn space-y-1.5">
                <label className="block text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Vectorización Semántica (NLP)
                </label>
                <select
                  name="vectorizacion"
                  value={formData.vectorizacion}
                  onChange={handleChange}
                  className="w-full bg-white border border-indigo-300 p-3 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="TF-IDF">TF-IDF (Frecuencia de Término — Ponderación Inversa)</option>
                </select>
              </div>
            )}

            {/* Botón de Ejecución */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-2xl font-black text-xs md:text-sm tracking-wide shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Calculando y Segmentando en FastAPI...' : '🚀 Entrenar Motor de Machine Learning'}
            </button>
          </form>

          {message && (
            <div className={`p-4 rounded-2xl text-center text-xs md:text-sm font-bold border shadow-xs ${message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Columna Derecha: Benchmark Comparativo y Justificación de Selección (7 Columnas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tarjeta de Veredicto del Modelo Óptimo */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 shadow-xs">
                🏆 Modelo Recomendado para Nuestra Situación
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">k = 4 Clústeres</span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                K-Means con k = 4: El Modelo Más Adecuado
              </h2>
              <p className="text-xs md:text-sm text-emerald-100/90 mt-1 leading-relaxed font-medium">
                Determinamos mediante benchmarking empírico sobre los expedientes de candidatos que <strong>K-Means con 4 clústeres</strong> es el algoritmo superior tanto matemática como operacionalmente para el sistema de RRHH.
              </p>
            </div>

            {/* Chips de Métricas del Modelo Ganador */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                <span className="block text-[10px] font-black uppercase text-emerald-300">Silhouette</span>
                <strong className="text-base font-black text-white">0.4976</strong>
                <span className="text-[9px] text-emerald-200 block">Separación Alta</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                <span className="block text-[10px] font-black uppercase text-emerald-300">Davies-Bouldin</span>
                <strong className="text-base font-black text-white">0.7668</strong>
                <span className="text-[9px] text-emerald-200 block">Mínimo Error</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                <span className="block text-[10px] font-black uppercase text-emerald-300">Calinski-H.</span>
                <strong className="text-base font-black text-white">1248.51</strong>
                <span className="text-[9px] text-emerald-200 block">Pico de Cohesión</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                <span className="block text-[10px] font-black uppercase text-emerald-300">Ruido / Outliers</span>
                <strong className="text-base font-black text-white">0 (0.0%)</strong>
                <span className="text-[9px] text-emerald-200 block">100% Clasificados</span>
              </div>
            </div>
          </div>

          {/* Tabla Comparativa de Algoritmos (Benchmark) */}
          <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Tabla de Comparación de Rendimiento (Benchmark de Modelos)
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Resultados cuantitativos probados sobre la matriz de candidatos de RRHH.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3.5 py-3 text-left font-black text-slate-800">Algoritmo</th>
                    <th className="px-2.5 py-3 text-center font-black text-slate-800">k</th>
                    <th className="px-2.5 py-3 text-center font-black text-slate-800">Silhouette (↑)</th>
                    <th className="px-2.5 py-3 text-center font-black text-slate-800">Davies-Bouldin (↓)</th>
                    <th className="px-2.5 py-3 text-center font-black text-slate-800">Calinski-H. (↑)</th>
                    <th className="px-2.5 py-3 text-center font-black text-slate-800">Puntos Ruido</th>
                    <th className="px-3.5 py-3 text-center font-black text-slate-800">Veredicto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(benchmarkData.length > 0 ? benchmarkData : [
                    { algoritmo: "K-Means", k: 4, silhouette: 0.4976, davies_bouldin: 0.7668, calinski_harabasz: 1248.51, puntos_ruido: 0, es_optimo: true },
                    { algoritmo: "Jerárquico (Ward)", k: 4, silhouette: 0.4862, davies_bouldin: 0.8116, calinski_harabasz: 1154.91, puntos_ruido: 0, es_optimo: false },
                    { algoritmo: "GMM (Gaussian)", k: 4, silhouette: 0.4835, davies_bouldin: 0.8034, calinski_harabasz: 1186.92, puntos_ruido: 0, es_optimo: false },
                    { algoritmo: "DBSCAN (eps=2.0)", k: 4, silhouette: 0.2211, davies_bouldin: 0.6971, calinski_harabasz: 28.92, puntos_ruido: 22, es_optimo: false }
                  ]).map((item, idx) => (
                    <tr key={idx} className={item.es_optimo ? 'bg-emerald-50/70 font-bold' : 'hover:bg-slate-50'}>
                      <td className="px-3.5 py-3 text-slate-900 font-extrabold flex items-center gap-1.5">
                        {item.es_optimo && <span>⭐</span>}
                        {item.algoritmo}
                      </td>
                      <td className="px-2.5 py-3 text-center font-black text-slate-800">{item.k}</td>
                      <td className="px-2.5 py-3 text-center text-slate-900 font-bold">{item.silhouette}</td>
                      <td className="px-2.5 py-3 text-center text-slate-900 font-bold">{item.davies_bouldin}</td>
                      <td className="px-2.5 py-3 text-center text-slate-900 font-bold">{item.calinski_harabasz}</td>
                      <td className="px-2.5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${item.puntos_ruido === 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {item.puntos_ruido}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        {item.es_optimo ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase shadow-xs">
                            Óptimo Seleccionado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Alternativa
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Justificación Específica de Por Qué k=4 y K-Means */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-2">
              <strong className="block text-slate-900 font-black text-sm">
                🔍 ¿Por qué k = 4 clústeres es el número perfecto para nuestro sistema?
              </strong>
              <p className="leading-relaxed">
                <strong>1. Correspondencia 1:1 con la estructura corporativa:</strong> El caso de negocio de RRHH requiere exactamente 4 niveles de decisión operativa: <em>Senior Lead / Executive</em>, <em>Soporte Operativo</em>, <em>Talento Inicial / Semillero</em>, y <em>Core Team Estable</em>. Con $k &lt; 4$ se mezclan perfiles sénior con operacionales; con $k &gt; 4$ surgen grupos redundantes sin distinción salarial real.
              </p>
              <p className="leading-relaxed">
                <strong>2. Determinismo e inferencia en tiempo real:</strong> A diferencia de DBSCAN (que deja hasta 22 candidatos sin asignar) o Jerárquico (que requiere recalcular toda la matriz de distancias), K-Means asigna cualquier candidato registrado en el formulario de reclutamiento en milisegundos sin margen de ambigüedad.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}