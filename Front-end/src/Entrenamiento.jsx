import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext';
import { clusteringService } from './services/api'; 

export default function Entrenamiento() {
  const { setModelosEntrenados } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Inicialización de estados alineada estrictamente con las clases ClusterConfig de FastAPI
  const [formData, setFormData] = useState({
    dataset: 'freelancers', // Mantenemos el estándar esperado por datos_limpios["freelancers"]
    algoritmo: 'K-Means',
    n_clusters: 4,
    vectorizacion: 'TF-IDF',
    epsilon: 0.5,
    min_samples: 3
  });

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
      // Se envía el payload unificado al endpoint POST /api/cluster
      const res = await clusteringService.entrenarModelo(formData);
      
      if (res.data.status === 'success') {
        // CORREGIDO: Mapeo exacto sobre el estado global de AppContext utilizando la llave del dataset
        const llaveContexto = formData.dataset === 'resenas' ? 'resenas' : 'freelancers';
        
        setModelosEntrenados(prev => ({ 
          ...prev, 
          [llaveContexto]: true 
        }));
        
        setMessage({ 
          type: 'success', 
          text: `¡Motor entrenado con éxito usando ${formData.algoritmo} para ${formData.dataset === 'resenas' ? 'reseñas' : 'freelancers'}!` 
        });
      }
    } catch (err) {
      console.error("Error capturado en el submit de entrenamiento:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error en la segmentación matemática. Verifica haber cargado el dataset primero.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configuración del Motor de IA</h2>
        <p className="text-sm text-slate-500 mt-1">Ajusta los hiperparámetros de los algoritmos e inicia el clustering en tiempo real.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de Dataset */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">1. Selección de Dataset</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.dataset === 'freelancers' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              <input type="radio" name="dataset" value="freelancers" checked={formData.dataset === 'freelancers'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
              Freelancers (Numérico)
            </label>
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.dataset === 'resenas' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              <input type="radio" name="dataset" value="resenas" checked={formData.dataset === 'resenas'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
              Reseñas (Texto / NLP)
            </label>
          </div>
        </div>

        {/* Selector de Algoritmo */}
        <div>
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">2. Algoritmo de Aprendizaje</label>
          <select name="algoritmo" value={formData.algoritmo} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium outline-none">
            <option value="K-Means">K-Means (Agrupación por Centroides)</option>
            <option value="DBSCAN">DBSCAN (Algoritmo basado en Densidad)</option>
            <option value="Clustering jerárquico">Clustering Hierárquico Aglomerativo</option>
            <option value="GMM">GMM (Modelos Mixtos Gaussianos)</option>
          </select>
        </div>

        {/* Parámetros Condicionales */}
        {formData.algoritmo !== 'DBSCAN' ? (
          <div className="animate-fadeIn">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Número de Clusters (k)</label>
            <input type="number" name="n_clusters" value={formData.n_clusters} onChange={handleChange} min="2" max="15" className="w-full border border-slate-200 p-3 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Epsilon (Radio)</label>
              <input type="number" step="0.1" name="epsilon" value={formData.epsilon} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Min Samples (Densidad Mín.)</label>
              <input type="number" name="min_samples" value={formData.min_samples} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" />
            </div>
          </div>
        )}

        {/* Configuración de Vectorización para Texto */}
        {formData.dataset === 'resenas' && (
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-fadeIn">
            <label className="block text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Vectorización de Lenguaje Natural</label>
            <select name="vectorizacion" value={formData.vectorizacion} onChange={handleChange} className="w-full bg-white border border-indigo-200 p-3 rounded-xl shadow-sm text-slate-700 font-medium focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              <option value="TF-IDF">TF-IDF (Term Frequency - Inverse Document Frequency)</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed">
          {loading ? 'Calculando y Entrenando Modelos...' : 'Iniciar Procesamiento de Machine Learning'}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-xl text-center font-semibold border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}