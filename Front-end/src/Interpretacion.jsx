import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORES = ['#10b981', '#f43f5e', '#f59e0b', '#6366f1', '#06b6d4'];

const VARIABLES_ANALISIS = [
  { id: 'tarifa_hora_promedio', label: 'Tarifa Hora Promedio ($/hr)', icon: '💵', unit: '$/hr' },
  { id: 'anios_experiencia', label: 'Años de Experiencia', icon: '⏳', unit: 'años' },
  { id: 'horas_trabajadas_mes', label: 'Horas Mensuales', icon: '⏱️', unit: 'hrs' },
  { id: 'ingresos_totales', label: 'Ingresos Anuales ($)', icon: '💼', unit: '$' },
  { id: 'calificacion_promedio', label: 'Calificación (1-5)', icon: '⭐', unit: 'pts' },
  { id: 'proyectos_completados', label: 'Proyectos Completados', icon: '📁', unit: 'proy' }
];

export default function Interpretacion() {
  const { modelosEntrenados } = useContext(AppContext);
  const [activeDataset, setActiveDataset] = useState('freelancers');
  const [datosFreelancers, setDatosFreelancers] = useState([]);
  const [distribucionStats, setDistribucionStats] = useState([]);
  const [datosResenas, setDatosResenas] = useState([]);
  const [variableSeleccionada, setVariableSeleccionada] = useState('tarifa_hora_promedio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modelosEntrenados[activeDataset]) {
      return;
    }

    const cargarEstadisticas = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeDataset === 'freelancers') {
          const respuesta = await axios.get('http://localhost:8000/api/stats/freelancers');
          const payload = respuesta.data.data || [];
          const dist = respuesta.data.distribucion_estadistica || [];
          
          const parseNum = (val) => {
            const num = Number(val);
            return isNaN(num) ? 0 : Math.round(num);
          };

          const datosFormateados = payload.map(item => ({
            name: `Clúster ${item.segmento ?? item.cluster}`,
            cantidad: parseNum(item.cantidad ?? item.count),
            ingresos: parseNum(item.ingresos_totales),
            horas_mes: parseNum(item.horas_trabajadas_mes),
            experiencia: parseNum(item.anios_experiencia),
            mapeo: item.mapeo_negocio
          }));
          setDatosFreelancers(datosFormateados);
          setDistribucionStats(dist);
        } else {
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

  // Datos para la Gráfica de Media, Moda y Mediana
  const varActiva = VARIABLES_ANALISIS.find(v => v.id === variableSeleccionada) || VARIABLES_ANALISIS[0];
  const datosGraficaEstadistica = distribucionStats.map(item => {
    const v = item.variables?.[variableSeleccionada] || {};
    return {
      name: `Clúster ${item.segmento}`,
      titulo: item.mapeo_negocio?.titulo || `Clúster ${item.segmento}`,
      Media: Number(v.media ?? 0),
      Mediana: Number(v.mediana ?? 0),
      Moda: Number(v.moda ?? 0),
      desv: Number(v.desviacion_estandar ?? 0),
      min: Math.max(0, Number(v.minimo ?? 0)),
      max: Number(v.maximo ?? 0),
      asimetria: v.asimetria ?? 'Simétrica'
    };
  });

  if (loading) {
    return (
      <div className="p-12 text-center bg-white/95 rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto mt-10">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-xs text-slate-700 mt-4 font-bold">Calculando Media, Moda, Mediana y Centroides de RRHH...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
            3. Interpretación Empresarial
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
            Interpretación y Perfilado de Segmentos (RRHH)
          </h1>
          <p className="text-xs md:text-sm text-slate-700 mt-1 font-medium">
            Análisis de distribución de talento, horas de dedicación, medidas de tendencia central (Media, Moda y Mediana) y recomendaciones operacionales.
          </p>
        </div>

        {/* Interruptor de Vistas */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-300 self-start md:self-auto shadow-xs">
          <button 
            onClick={() => setActiveDataset('freelancers')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeDataset === 'freelancers' ? 'bg-white text-emerald-900 shadow-sm border border-slate-200' : 'text-slate-700 hover:text-slate-950'}`}
          >
            👥 Candidatos & Métricas
          </button>
          <button 
            onClick={() => setActiveDataset('resenas')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeDataset === 'resenas' ? 'bg-white text-indigo-900 shadow-sm border border-slate-200' : 'text-slate-700 hover:text-slate-950'}`}
          >
            📝 Evaluaciones NLP
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-2xl text-center font-bold text-xs md:text-sm shadow-xs">
          ⚠️ {error}
        </div>
      )}

      {!modelosEntrenados[activeDataset] && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-2 shadow-xs">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-base font-black text-amber-950">Segmentación Inactiva</h3>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Navega a la sección 2. Configuración y Entrenamiento para entrenar el modelo antes de visualizar sus gráficos y estadísticas.
          </p>
        </div>
      )}

      {/* RENDERIZADO CUANTITATIVO DE CANDIDATOS */}
      {modelosEntrenados['freelancers'] && activeDataset === 'freelancers' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* NUEVA SECCIÓN CRÍTICA: GRÁFICAS DE MEDIA, MODA Y MEDIANA */}
          <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Estadística Descriptiva Avanzada
                </span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 mt-1">
                  Comparativa de Media, Moda y Mediana por Clúster
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Identifica asimetrías salariales, experiencia típica y concentración de carga horaria en cada segmento.
                </p>
              </div>

              {/* Selector de Variables Estadísticas */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300">
                {VARIABLES_ANALISIS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariableSeleccionada(v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${variableSeleccionada === v.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'}`}
                  >
                    <span>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gráfica de Barras Agrupadas: Media vs Mediana vs Moda */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-50/70 p-5 rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {varActiva.label} — Tendencia Central (Media, Mediana y Moda)
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">Unidad: {varActiva.unit}</span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosGraficaEstadistica} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                      <XAxis dataKey="name" stroke="#334155" fontSize={11} fontWeight="bold" />
                      <YAxis stroke="#334155" fontSize={11} fontWeight="bold" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }} />
                      <Bar dataKey="Media" fill="#2563eb" name="Media (Promedio)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Mediana" fill="#7c3aed" name="Mediana (Punto Medio)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Moda" fill="#059669" name="Moda (Más Frecuente)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Guía Explicativa del Reclutador */}
              <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
                    Interpretación para Dirección de RRHH
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Al analizar <strong className="text-slate-900">{varActiva.label}</strong>, comparar estas tres métricas revela si el grupo es homogéneo o si perfiles atípicos distorsionan los costos de contratación:
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="font-black text-blue-900 block">🔵 Media (Aritmética):</span>
                    <span className="text-[11px] text-blue-800">Costo o volumen global prorrateado por candidato.</span>
                  </div>
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="font-black text-purple-900 block">🟣 Mediana (Punto Medio):</span>
                    <span className="text-[11px] text-purple-800">El valor central exacto; no se deja engañar por extremos.</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-black text-emerald-900 block">🟢 Moda (Más Frecuente):</span>
                    <span className="text-[11px] text-emerald-800">La oferta o experiencia más recurrente en el mercado.</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold">
                  📌 Regla de oro: Si la Media &gt; Mediana, hay &quot;sesgo positivo&quot; (pocos candidatos cobran o rinden muy por encima del promedio).
                </div>
              </div>
            </div>

            {/* Desglose Estadístico Numérico en Tarjetas para los 4 Clústeres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {datosGraficaEstadistica.map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-900">{c.name}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {c.asimetria.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 truncate">{c.titulo}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                    <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-100">
                      <span className="block text-[9px] font-black uppercase text-blue-700">Media</span>
                      <strong className="text-xs font-black text-blue-900">{c.Media}</strong>
                    </div>
                    <div className="bg-purple-50/80 p-2 rounded-xl border border-purple-100">
                      <span className="block text-[9px] font-black uppercase text-purple-700">Mediana</span>
                      <strong className="text-xs font-black text-purple-900">{c.Mediana}</strong>
                    </div>
                    <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                      <span className="block text-[9px] font-black uppercase text-emerald-700">Moda</span>
                      <strong className="text-xs font-black text-emerald-900">{c.Moda}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-1 pt-1 border-t border-slate-100">
                    <span>Mín: {c.min}</span>
                    <span>Desv: ±{c.desv}</span>
                    <span>Máx: {c.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DISTRIBUCIÓN GENERAL Y VOLUMEN DE TALENTO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PieChart Distribución */}
            <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1">
              <h3 className="text-xs font-black mb-4 text-slate-900 uppercase tracking-wide">Distribución de Talento (Headcount)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      isAnimationActive={false} 
                      data={datosFreelancers} 
                      cx="50%" cy="50%" 
                      innerRadius={55} outerRadius={80} 
                      paddingAngle={4} dataKey="cantidad"
                    >
                      {datosFreelancers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BarChart Promedios */}
            <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
              <h3 className="text-xs font-black mb-4 text-slate-900 uppercase tracking-wide">Métricas Consolidadas por Clúster</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosFreelancers}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="name" stroke="#334155" fontSize={11} fontWeight="bold" />
                    <YAxis stroke="#334155" fontSize={11} fontWeight="bold" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Bar dataKey="horas_mes" fill="#6366f1" name="Horas Mensuales" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="experiencia" fill="#10b981" name="Años de Experiencia" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tarjetas de Interpretabilidad de RRHH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {datosFreelancers.map((item, index) => {
              const mapInfo = item.mapeo || {};
              return (
                <div key={index} className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black uppercase px-3 py-1 bg-slate-100 text-slate-900 rounded-full border border-slate-200">
                      {item.name}
                    </span>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${mapInfo.color === 'emerald' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : mapInfo.color === 'rose' ? 'bg-rose-50 text-rose-900 border-rose-300' : mapInfo.color === 'amber' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-indigo-50 text-indigo-900 border-indigo-300'}`}>
                      {mapInfo.nivel_riesgo || 'Estándar'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">{mapInfo.titulo || item.name}</h4>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">{mapInfo.subtitulo}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-800">
                    <strong className="block text-slate-900 mb-0.5">💡 Recomendación Estratégica:</strong>
                    <p className="text-[11px] leading-relaxed font-medium">{mapInfo.recomendacion}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <span className="block text-slate-500 text-[10px] uppercase font-black">Volumen</span>
                      <strong className="text-slate-900 font-black">{item.cantidad}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <span className="block text-slate-500 text-[10px] uppercase font-black">Horas/Mes</span>
                      <strong className="text-slate-900 font-black">{item.horas_mes} hrs</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <span className="block text-slate-500 text-[10px] uppercase font-black">Experiencia</span>
                      <strong className="text-slate-900 font-black">{item.experiencia} años</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDERIZADO CUALITATIVO DE EVALUACIONES NLP */}
      {modelosEntrenados['resenas'] && activeDataset === 'resenas' && datosResenas.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {datosResenas.map((item, index) => {
              const mapInfo = item.mapeo_negocio || {};
              return (
                <div key={index} className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-base font-black text-slate-900">Clúster {item.segmento}: {mapInfo.titulo}</h4>
                    <span className="text-xs font-black bg-indigo-50 text-indigo-900 px-3 py-1 rounded-full border border-indigo-300">
                      {item.cantidad} evaluaciones
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{item.descripcion}</p>
                  <div>
                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                      Términos Frecuentes y Conceptos Clave (TF-IDF):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.terminos_frecuentes?.map((term, idx) => (
                        <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          #{term}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-800">
                    <strong className="block text-slate-900 mb-0.5">Estrategia de RRHH:</strong>
                    <p className="text-[11px] leading-relaxed font-medium">{mapInfo.recomendacion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}