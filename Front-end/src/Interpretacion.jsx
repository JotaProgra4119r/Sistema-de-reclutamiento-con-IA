import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORES = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Interpretacion() {
  // Consumimos el estado de validación real de tu AppContext
  const { modelosEntrenados } = useContext(AppContext);
  
  // Control de Dataset Activo ('freelancers' o 'resenas')
  const [activeDataset, setActiveDataset] = useState('freelancers');
  
  // Estados de datos separados para evitar colisiones matemáticas
  const [datosFreelancers, setDatosFreelancers] = useState([]);
  const [datosResenas, setDatosResenas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // REGLA DE SEGURIDAD GLOBAL: Si el modelo seleccionado no ha sido entrenado, abortamos
    if (!modelosEntrenados[activeDataset]) {
      return;
    }

    const cargarEstadisticas = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeDataset === 'freelancers') {
          // FLUJO CLÁSICO FREELANCERS
          const respuesta = await axios.get('http://localhost:8000/api/stats/freelancers');
          const payload = respuesta.data.data || respuesta.data;
          
          const parseNum = (val) => {
            const num = Number(val);
            return isNaN(num) ? 0 : Math.round(num);
          };

          const datosFormateados = payload.map(item => ({
            name: `Cluster ${item.segmento ?? item.cluster}`,
            cantidad: parseNum(item.cantidad ?? item.count),
            ingresos: parseNum(item.ingresos_totales),
            horas_mes: parseNum(item.horas_trabajadas_mes),
            experiencia: parseNum(item.anios_experiencia)
          }));
          setDatosFreelancers(datosFormateados);
        } else {
          // NUEVO FLUJO NLP RESEÑAS
          const respuesta = await axios.get('http://localhost:8000/api/stats/resenas');
          const payload = respuesta.data.data || respuesta.data;
          setDatosResenas(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        console.error(`Fallo al extraer estadísticas de ${activeDataset}:`, err);
        setError(err.response?.data?.message || "Error de conexión con FastAPI.");
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [activeDataset, modelosEntrenados]);

  // Manejo visual de carga
  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto mt-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-4 font-mono">Extrayendo vectores y distribuciones desde FastAPI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      {/* Encabezado Dinámico con Selector de Pestañas (Tabs) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">3. Interpretación de Segmentos</h2>
          <p className="text-gray-600 mt-1">Análisis de centroides y distribución semántica de la población.</p>
        </div>

        {/* Interruptor de Vistas */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl shadow-inner max-w-xs self-start md:self-auto">
          <button 
            onClick={() => setActiveDataset('freelancers')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeDataset === 'freelancers' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Freelancers
          </button>
          <button 
            onClick={() => setActiveDataset('resenas')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeDataset === 'resenas' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Reseñas (NLP)
          </button>
        </div>
      </div>

      {/* Manejo de Error en Conexión */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-center font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* BLOQUEO DE SEGURIDAD INTERACTIVO SI NO HA SIDO ENTRENADO */}
      {!modelosEntrenados[activeDataset] && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto mt-10">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold text-amber-900 mt-3">Segmentación Inactiva</h3>
          <p className="text-sm text-amber-700 mt-1">
            Debes navegar a la sección <strong className="font-semibold">2. Configuración y Entrenamiento</strong>, entrenar el dataset de <span className="capitalize font-semibold text-indigo-600">{activeDataset === 'resenas' ? 'reseñas' : activeDataset}</span> para cargar el clúster activo en memoria antes de visualizar sus analíticas.
          </p>
        </div>
      )}

      {/* INTERFAZ 1: RENDERIZADO GRÁFICO RECHARTS (FREELANCERS) */}
      {modelosEntrenados['freelancers'] && activeDataset === 'freelancers' && datosFreelancers.length > 0 && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico 1: PieChart Densidad */}
            <div className="bg-white p-6 rounded-xl shadow-sm border col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">Densidad Poblacional</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    isAnimationActive={false} 
                    data={datosFreelancers} 
                    cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={80} 
                    paddingAngle={5} dataKey="cantidad"
                  >
                    {datosFreelancers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 2: BarChart Ingresos */}
            <div className="bg-white p-6 rounded-xl shadow-sm border col-span-1 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">Ingresos Totales Promedio</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosFreelancers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar isAnimationActive={false} dataKey="ingresos" name="Ingresos (USD)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Gráfico 3: Multivariable Horas vs Exp */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">Horas Trabajadas vs Años de Experiencia</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={datosFreelancers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Legend />
                <Bar isAnimationActive={false} yAxisId="left" dataKey="horas_mes" name="Horas al Mes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar isAnimationActive={false} yAxisId="right" dataKey="experiencia" name="Años de Experiencia" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* INTERFAZ 2: RENDERIZADO LINGÜÍSTICO / NLP TARJETAS (RESEÑAS) */}
      {modelosEntrenados['resenas'] && activeDataset === 'resenas' && datosResenas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {datosResenas.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
                    Segmento #{item.segmento ?? index}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800">{item.cantidad}</span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Muestras Asignadas</span>
                  </div>
                </div>

                {/* Descripción Lingüística */}
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  "{item.descripcion || 'Perfil lingüístico agrupado de forma automatizada mediante similitud semántica de palabras.'}"
                </p>

                {/* Desglose de Palabras Frecuentes */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Términos más Frecuentes (TF-IDF Weight):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.terminos_frecuentes && item.terminos_frecuentes.map((word, wIdx) => (
                      <span 
                        key={wIdx} 
                        className="bg-slate-900 text-slate-100 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide border border-slate-800 shadow-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métrica Inferior de Extensión */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Extensión Promedio:</span>
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                  {Number(item.longitud_promedio_palabras ?? 0).toFixed(1)} palabras / comentario
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerta si el backend devolvió una lista vacía */}
      {((activeDataset === 'freelancers' && datosFreelancers.length === 0 && modelosEntrenados['freelancers']) ||
        (activeDataset === 'resenas' && datosResenas.length === 0 && modelosEntrenados['resenas'])) && !loading && (
        <div className="p-8 text-slate-500 font-mono text-center bg-white border rounded-2xl shadow-sm">
          El motor de FastAPI respondió con éxito, pero la matriz de centroides está vacía para este sub-modelo.
        </div>
      )}
    </div>
  );
}