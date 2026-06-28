import { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext'; // Asumiendo que controlas el acceso aquí

export default function Prediccion() {
  const { modelosEntrenados } = useContext(AppContext);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    ingresos_totales: '',
    proyectos_completados: '',
    tarifa_hora_promedio: '',
    // Añade aquí más campos si el CSV original tiene otras variables numéricas
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    // Validación básica de frontend
    if (!formData.ingresos_totales || !formData.proyectos_completados || !formData.tarifa_hora_promedio) {
      setError("Todos los campos numéricos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      // Formateamos a números estrictos antes de enviar
      const payload = {
        ingresos_totales: parseFloat(formData.ingresos_totales),
        proyectos_completados: parseFloat(formData.proyectos_completados),
        tarifa_hora_promedio: parseFloat(formData.tarifa_hora_promedio)
      };

      console.log("Enviando a API:", payload);

      // TODO: Descomentar esto cuando tu compañero tenga el endpoint listo
      /*
      const respuesta = await axios.post('http://localhost:8000/api/predict/freelancers', payload);
      setResultado(respuesta.data.cluster_asignado);
      */

      // MOCK DATA: Simulación de respuesta de red (Bórralo cuando conectes el backend real)
      setTimeout(() => {
        setResultado(Math.floor(Math.random() * 4)); // Simula que la IA le asignó un cluster (0-3)
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Error al conectar con el motor de predicción.");
      setLoading(false);
    }
  };

  // Bloqueo de seguridad: No puedes predecir si no hay un modelo en RAM
  if (!modelosEntrenados?.freelancers) {
    return (
      <div className="p-8 text-red-800 bg-red-50 rounded-lg border border-red-200 font-medium max-w-2xl mx-auto mt-10">
        ⚠️ Operación denegada: No existe un modelo entrenado en la memoria del sistema. Regresa a la Vista 2 y ejecuta el motor de clustering primero.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-3xl font-bold border-b pb-2 text-slate-800">Motor de Predicción</h2>
        <p className="text-gray-600 mt-2">Introduce las métricas de un nuevo freelancer para que la IA lo asigne al cluster correspondiente basándose en el modelo actual.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos Totales (USD)</label>
              <input 
                type="number" 
                name="ingresos_totales" 
                value={formData.ingresos_totales} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyectos Completados</label>
              <input 
                type="number" 
                name="proyectos_completados" 
                value={formData.proyectos_completados} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Promedio ($/hr)</label>
              <input 
                type="number" 
                name="tarifa_hora_promedio" 
                value={formData.tarifa_hora_promedio} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 45"
              />
            </div>

          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-3 px-8 rounded-lg shadow-md transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? 'Calculando tensores...' : 'Clasificar Freelancer'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        {resultado !== null && !loading && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center shadow-inner">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Análisis Completado</h3>
            <p className="text-gray-700">El modelo ha posicionado a este individuo en el:</p>
            <p className="text-4xl font-black mt-2 text-indigo-700">Cluster {resultado}</p>
          </div>
        )}
      </div>
    </div>
  );
}