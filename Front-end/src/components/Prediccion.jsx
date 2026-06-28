import { useState } from 'react';
import { clusteringService } from '../services/api';

export default function Prediccion() {
  const [resultado, setResultado] = useState(null);
  
  const campos = [
    'proyectos_completados', 'ingresos_totales', 'tarifa_hora_promedio',
    'anios_experiencia', 'tiempo_respuesta_horas', 'tasa_finalizacion',
    'calificacion_promedio', 'clientes_recurrentes', 'horas_trabajadas_mes'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    // Convertir todo a números
    const numericPayload = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, parseFloat(v)])
    );

    const res = await clusteringService.predecir(numericPayload);
    setResultado(res.data.segmento_asignado);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow">
      <div className="grid grid-cols-3 gap-4">
        {campos.map(campo => (
          <div key={campo}>
            <label className="block text-sm capitalize">{campo.replace(/_/g, ' ')}</label>
            <input name={campo} type="number" step="any" required className="border p-2 w-full rounded" />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded">
        Predecir Segmento
      </button>
      {resultado !== null && <div className="mt-4 text-xl font-bold">Segmento: {resultado}</div>}
    </form>
  );
}