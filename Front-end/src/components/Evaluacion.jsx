import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { AppContext } from '../AppContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Evaluacion() {
  const { modelosEntrenados } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('freelancers');
  const [metricas, setMetricas] = useState(null);
  const [graficaLineal, setGraficaLineal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modelosEntrenados[activeTab]) {
      setMetricas(null);
      setGraficaLineal([]);
      return;
    }

    const cargarEvaluacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/evaluacion/${activeTab}`;
        const respuesta = await axios.get(url);
        const payload = respuesta.data;

        if (payload.status === "error") {
          throw new Error(payload.message);
        }

        setMetricas({
          silhouette: payload.silhouette_score ?? 0,
          davies: payload.davies_bouldin ?? 0,
          calinski: payload.calinski_harabasz ?? 0
        });

        if (payload.grafica_lineal_codo && payload.grafica_lineal_codo.length > 0) {
          setGraficaLineal(payload.grafica_lineal_codo.map(p => ({
            k: p.k,
            "Métrica de Optimización": p.inercia
          })));
        } else {
          setGraficaLineal([]);
        }

      } catch (err) {
        console.error("Error al cargar evaluación frontal:", err);
        setError(err.response?.data?.message || err.message || "Error al conectar con los endpoints de evaluación.");
      } finally {
        setLoading(false);
      }
    };

    cargarEvaluacion();
  }, [activeTab, modelosEntrenados]);

  const formatNum = (val) => {
    if (typeof val === 'number') return val.toFixed(4);
    return val;
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
            4. Métricas de Validación del Modelo
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
            Evaluación y Validación de Clústeres (RRHH)
          </h1>
          <p className="text-xs md:text-sm text-slate-700 mt-1 font-medium">
            Análisis de cohesión interna, separación matemática y método del codo.
          </p>
        </div>

        {/* Botones de Selección */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('freelancers')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'freelancers' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            👥 Candidatos
          </button>
          <button 
            onClick={() => setActiveTab('resenas')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'resenas' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            📝 Evaluaciones NLP
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50/90 border border-rose-200 text-rose-800 p-4 rounded-2xl text-center font-semibold text-xs md:text-sm">
          ⚠️ {error}
        </div>
      )}

      {!modelosEntrenados[activeTab] && (
        <div className="bg-amber-50/80 backdrop-blur-md border border-amber-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-2">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-base font-bold text-amber-900">Validación Inactiva</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Para consultar las métricas de separación y curvas de optimización, primero entrena el algoritmo en la sección de Configuración y Entrenamiento.
          </p>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center bg-white/80 rounded-3xl shadow-sm border border-slate-100 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3 font-mono">Calculando matrices de distancia...</p>
        </div>
      )}

      {modelosEntrenados[activeTab] && metricas && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tarjetas de Métricas Internas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cohesión y Separación</span>
              <h4 className="text-base font-bold text-slate-800">Silhouette Score</h4>
              <div className="text-3xl md:text-4xl font-black text-indigo-600 my-2">{formatNum(metricas.silhouette)}</div>
              <p className="text-[11px] text-slate-500">Rango [-1, 1]. Valores mayores a 0.35 demuestran clústeres separados y homogéneos.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Compacidad de Grupos</span>
              <h4 className="text-base font-bold text-slate-800">Davies-Bouldin Index</h4>
              <div className="text-3xl md:text-4xl font-black text-emerald-600 my-2">{formatNum(metricas.davies)}</div>
              <p className="text-[11px] text-slate-500">Valores más bajos indican menor solapamiento entre los clústeres de RRHH.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Varianza Inter-Cluster</span>
              <h4 className="text-base font-bold text-slate-800">Calinski-Harabasz</h4>
              <div className="text-3xl md:text-4xl font-black text-teal-600 my-2">{formatNum(metricas.calinski)}</div>
              <p className="text-[11px] text-slate-500">Puntaje de dispersión; valores altos reflejan agrupamiento nítido.</p>
            </div>
          </div>

          {/* Gráfica de Método del Codo */}
          {graficaLineal.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base font-black text-slate-800">
                  Curva de Optimización de Clústeres (Método del Codo / Inercia)
                </h3>
                <span className="text-xs text-slate-400">Punto óptimo sugerido: k = 4</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graficaLineal}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="k" stroke="#64748b" label={{ value: 'Número de Clústeres (k)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Métrica de Optimización" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: "#4f46e5" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}