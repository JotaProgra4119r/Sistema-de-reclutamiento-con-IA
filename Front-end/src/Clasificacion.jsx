import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';
import { clusteringService } from './services/api';

const GUIA_CLUSTERS = [
  {
    id: 1,
    icono: "👑",
    titulo: "Clúster 1: Consultores Executive / Alta Facturación",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    headerColor: "from-emerald-600 to-teal-700",
    colorBg: "bg-emerald-50/70 border-emerald-200",
    riesgo: "Bajo / Élite Corporativo",
    definicion: "Talento sénior élite con más de 10 años de experiencia, alta facturación (> $40,000 anuales), tarifas horarias de alto nivel y cumplimiento sobresaliente.",
    rangoTipico: "Exp: >10 años • Sueldo: >$4,000/mes • Metas: >90%",
    recomendacion: "Asignar a cuentas estratégicas corporativas y diseñar planes de fidelización y retención."
  },
  {
    id: 2,
    icono: "⚡",
    titulo: "Clúster 2: Soporte Operativo / Alta Intensidad",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    headerColor: "from-rose-600 to-red-700",
    colorBg: "bg-rose-50/70 border-rose-200",
    riesgo: "Crítico / Riesgo de Burnout",
    definicion: "Personal clave o perfiles de soporte expuestos a sobrecarga horaria o desbalance de tareas que requieren monitoreo preventivo de fatiga.",
    rangoTipico: "Horas: Altas / Intensivas • Exp: 1-3 años • Metas: Variables",
    recomendacion: "Redistribuir inmediatamente asignación de horas y carga de trabajo para prevenir deserción por fatiga laboral."
  },
  {
    id: 0,
    icono: "🌱",
    titulo: "Clúster 0: Talento Inicial / En Desarrollo",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    headerColor: "from-amber-500 to-amber-600",
    colorBg: "bg-amber-50/70 border-amber-200",
    riesgo: "Moderado / Requiere Mentoría",
    definicion: "Perfiles emergentes en etapa de integración y formación con alto potencial de absorción de competencias pero necesidad de acompañamiento.",
    rangoTipico: "Exp: Inicial / Intermedia • Metas: En consolidación",
    recomendacion: "Asignar plan de inducción corporativa, definir KPIs iniciales claros y dar seguimiento quincenal."
  },
  {
    id: 3,
    icono: "🛡️",
    titulo: "Clúster 3: Especialistas Intermedios Estables",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    headerColor: "from-indigo-600 to-blue-700",
    colorBg: "bg-indigo-50/70 border-indigo-200",
    riesgo: "Bajo / Estable",
    definicion: "Fuerza laboral confiable de rendimiento predecible y estandarizado, trabajo en equipo armónico y cumplimiento sostenido de metas.",
    rangoTipico: "Exp: 3 - 6 años • Sueldo: Moderado • Metas: ~80-85%",
    recomendacion: "Mantener asignación en operaciones regulares e impulsar programas de crecimiento profesional continuo."
  }
];

export default function Clasificacion() {
  const { modelosEntrenados } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('freelancer');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mapeoActual, setMapeoActual] = useState(null);
  const [error, setError] = useState(null);

  const [formDataFreelancer, setFormDataFreelancer] = useState({
    proyectos_completados: 12,
    ingresos_totales: 45000,
    tarifa_hora_promedio: 45,
    anios_experiencia: 4,
    tiempo_respuesta_horas: 2.5,
    tasa_finalizacion: 95,
    calificacion_promedio: 4.7,
    clientes_recurrentes: 5,
    horas_trabajadas_mes: 140
  });

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
    setMapeoActual(null);

    const datasetKey = activeTab === 'freelancer' ? 'freelancers' : 'resenas';
    if (!modelosEntrenados[datasetKey]) {
      setError(`El modelo de ${datasetKey === 'resenas' ? 'evaluaciones cualitativas' : 'expedientes de candidatos'} no está inicializado. Ejecuta el entrenamiento primero.`);
      setLoading(false);
      return;
    }

    try {
      let res;
      if (activeTab === 'freelancer') {
        res = await clusteringService.predecirFreelancer(formDataFreelancer);
      } else {
        if (!textoResena.trim()) {
          throw new Error("Por favor escribe una evaluación cualitativa antes de predecir.");
        }
        res = await clusteringService.predecirResena({ texto_reseña: textoResena });
      }

      if (res.data && res.data.status === "success") {
        const clusterId = res.data.segmento_asignado;
        setResultado(clusterId);
        const guiaEncontrada = GUIA_CLUSTERS.find(g => g.id === clusterId);
        setMapeoActual(res.data.mapeo_negocio || guiaEncontrada || GUIA_CLUSTERS[0]);
      } else {
        const clusterId = res.data.segmento_asignado ?? 0;
        setResultado(clusterId);
        const guiaEncontrada = GUIA_CLUSTERS.find(g => g.id === clusterId);
        setMapeoActual(guiaEncontrada || GUIA_CLUSTERS[0]);
      }
    } catch (err) {
      console.error("Fallo en predicción en tiempo real:", err);
      setError(err.response?.data?.message || err.message || "Error al procesar la clasificación en FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
          5. Módulo de Clasificación en Tiempo Real
        </span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
          Inferencia Predictiva y Clasificación de Candidatos
        </h1>
        <p className="text-sm text-slate-700 mt-1 max-w-3xl font-medium">
          Evalúa perfiles en tiempo real e identifica a cuál de los 4 segmentos organizacionales de Recursos Humanos pertenece el candidato, con interpretabilidad ejecutiva inmediata.
        </p>
      </div>

      {/* GUÍA DE IDENTIFICACIÓN DE CLÚSTERES (SOLICITADO EXPLÍCITAMENTE) */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📖</span> Guía de Identificación y Significado de Clústeres (RRHH)
            </h2>
            <p className="text-xs text-slate-500">
              Referencia ejecutiva para interpretar el perfil organizacional asignado a cada candidato:
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            4 Segmentos Corporativos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIA_CLUSTERS.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${item.colorBg} flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{item.icono}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badge}`}>
                    {item.riesgo}
                  </span>
                </div>
                <h3 className="font-extrabold text-xs text-slate-900 leading-snug">
                  {item.titulo}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.definicion}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[10px] space-y-1">
                <p className="text-slate-500 font-mono">
                  <strong>Perfil:</strong> {item.rangoTipico}
                </p>
                <p className="font-semibold text-slate-800">
                  <strong>Acción:</strong> {item.recomendacion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Selector: Métricas vs NLP */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => { setActiveTab('freelancer'); setResultado(null); setError(null); }}
          className={`py-3 px-6 font-bold text-xs md:text-sm rounded-t-2xl transition-all ${activeTab === 'freelancer' ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          📊 Clasificar por Métricas Numéricas
        </button>
        <button
          onClick={() => { setActiveTab('resena'); setResultado(null); setError(null); }}
          className={`py-3 px-6 font-bold text-xs md:text-sm rounded-t-2xl transition-all ${activeTab === 'resena' ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          📝 Clasificar por Evaluación Cualitativa (NLP)
        </button>
      </div>

      {error && (
        <div className="bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-800 p-4 rounded-2xl text-center font-semibold text-xs md:text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Grid: Formulario y Tarjeta de Resultado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Formulario */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/60 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'freelancer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Proyectos Completados</label>
                  <input
                    type="number"
                    name="proyectos_completados"
                    value={formDataFreelancer.proyectos_completados}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Ingresos / Facturación Anual ($)</label>
                  <input
                    type="number"
                    name="ingresos_totales"
                    value={formDataFreelancer.ingresos_totales}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tarifa Promedio ($/hr)</label>
                  <input
                    type="number"
                    name="tarifa_hora_promedio"
                    value={formDataFreelancer.tarifa_hora_promedio}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Años de Experiencia</label>
                  <input
                    type="number"
                    step="0.5"
                    name="anios_experiencia"
                    value={formDataFreelancer.anios_experiencia}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tiempo de Respuesta (Hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="tiempo_respuesta_horas"
                    value={formDataFreelancer.tiempo_respuesta_horas}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cumplimiento de Metas (%)</label>
                  <input
                    type="number"
                    name="tasa_finalizacion"
                    value={formDataFreelancer.tasa_finalizacion}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Calificación Evaluación</label>
                  <input
                    type="number"
                    step="0.1"
                    name="calificacion_promedio"
                    value={formDataFreelancer.calificacion_promedio}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Proyectos Recurrentes</label>
                  <input
                    type="number"
                    name="clientes_recurrentes"
                    value={formDataFreelancer.clientes_recurrentes}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Horas Trabajadas / Mes</label>
                  <input
                    type="number"
                    name="horas_trabajadas_mes"
                    value={formDataFreelancer.horas_trabajadas_mes}
                    onChange={handleNumChange}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'resena' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Evaluación Cualitativa de Desempeño (Texto Libre):
                </label>
                <textarea
                  value={textoResena}
                  onChange={(e) => setTextoResena(e.target.value)}
                  placeholder="Ej. El consultor demostró alta capacidad de liderazgo ejecutivo, puntualidad sobresaliente y precisión técnica impecable en la coordinación de proyectos estratégicos corporativos..."
                  rows={6}
                  className="w-full border border-slate-200 p-3 rounded-2xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none font-medium text-slate-700"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3.5 px-6 rounded-2xl font-bold text-xs md:text-sm tracking-wide shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Calculando Inferencia Predictiva...' : '⚡ Clasificar Candidato en Tiempo Real'}
            </button>
          </form>
        </div>

        {/* Tarjeta de Inferencia / Resultado */}
        <div className="lg:col-span-1">
          {resultado !== null && mapeoActual ? (
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-md border border-white/60 overflow-hidden animate-scaleUp">
              <div className={`p-5 bg-gradient-to-r ${mapeoActual.headerColor || 'from-indigo-600 to-blue-600'} text-white space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                    Clúster Asignado: #{resultado}
                  </span>
                  <span className="text-xl">{mapeoActual.icono || '🎯'}</span>
                </div>
                <h3 className="text-lg font-black leading-tight mt-1">{mapeoActual.titulo}</h3>
                <p className="text-xs text-white/90">{mapeoActual.subtitulo}</p>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-600">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Nivel de Riesgo:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${mapeoActual.badge || mapeoActual.badge_color || 'bg-slate-100'}`}>
                    {mapeoActual.riesgo || mapeoActual.nivel_riesgo}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">Descripción del Perfil:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium text-[11px]">
                    {mapeoActual.definicion || mapeoActual.perfil_resumen}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">💡 Plan de Acción Estratégico:</span>
                  <p className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed font-medium text-[11px]">
                    {mapeoActual.recomendacion}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center text-slate-400 space-y-2">
              <span className="text-4xl block">🎯</span>
              <h4 className="font-bold text-slate-700 text-xs">Sin Inferencia Activa</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ingresa los datos del candidato y haz clic en "Clasificar" para proyectar su clúster y estrategia de RRHH recomendada.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}