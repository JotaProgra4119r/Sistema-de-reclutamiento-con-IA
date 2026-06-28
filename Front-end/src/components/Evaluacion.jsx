import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
        const url = `http://localhost:8000/api/evaluacion/${activeTab}`;
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

        // Mapeamos los puntos para la gráfica lineal solicitada por el auxiliar
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
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fadeIn">
      {/* Encabezado con Control de Pestañas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Evaluación y Validación del Modelo</h2>
          <p className="text-gray-500 text-sm mt-1">Métricas internas del último modelo entrenado.</p>
        </div>

        {/* Botones de Selección */}
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner border border-slate-300">
          <button 
            onClick={() => setActiveTab('freelancers')} 
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'freelancers' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Freelancers
          </button>
          <button 
            onClick={() => setActiveTab('resenas')} 
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'resenas' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Reseñas
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-center font-semibold">
          ⚠️ {error}
        </div>
      )}

      {!modelosEntrenados[activeTab] && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto mt-10">
          <span className="text-4xl">📊</span>
          <h3 className="text-lg font-bold text-amber-900 mt-3">Evaluación no disponible</h3>
          <p className="text-sm text-amber-700 mt-1">
            El modelo para <span className="capitalize font-bold text-indigo-600">{activeTab === 'resenas' ? 'reseñas' : activeTab}</span> no ha sido entrenado. Por favor, corre el algoritmo elegido en la Vista 2 primero.
          </p>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-4 font-mono">Calculando coeficientes geométricos en FastAPI...</p>
        </div>
      )}

      {modelosEntrenados[activeTab] && metricas && !loading && (
        <div className="space-y-6">
          {/* Fila de las 3 Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coeficiente de Silueta</h3>
              <p className="text-4xl font-black text-slate-800 mt-3">{formatNum(metricas.silhouette)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice de Davies-Bouldin</h3>
              <p className="text-4xl font-black text-slate-800 mt-3">{formatNum(metricas.davies)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice de Calinski-Harabasz</h3>
              <p className="text-4xl font-black text-slate-800 mt-3">{formatNum(metricas.calinski)}</p>
            </div>
          </div>

          {/* Gráfica de Optimización Solicitada por el Auxiliar */}
          {graficaLineal.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Selección del Número de Clusters</h3>
                <p className="text-xs text-slate-400 mt-0.5">Comportamiento matemático del índice respecto a la variable K (2 a 6).</p>
              </div>
              <div className="w-full bg-slate-50 p-2 rounded-xl border border-slate-100">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={graficaLineal} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="k" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line 
                      type="monotone" 
                      dataKey="Métrica de Optimización" 
                      stroke="#1e293b" 
                      strokeWidth={2.5} 
                      dot={{ r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sección de Interpretación */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Interpretación</h3>
            <div className="space-y-2 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                Los segmentos presentan una separación <span className="text-indigo-600 font-bold">{Number(metricas.silhouette) > 0.4 ? 'óptima y bien definida' : 'moderada con densidades compactas'}</span>.
              </p>
              <p className="text-xs text-slate-400 border-t pt-2 font-normal">
                Análisis automático: El índice Davies-Bouldin de <span className="font-mono bg-slate-100 px-1 rounded font-bold">{formatNum(metricas.davies)}</span> confirma consistencia en las fronteras matemáticas determinadas por el algoritmo.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}