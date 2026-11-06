import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrService } from './services/api';

const CLUSTER_CONFIG = {
  1: {
    nombre: "Consultores Executive / Alta Facturación",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    glow: "shadow-emerald-500/10",
    icono: "👑"
  },
  2: {
    nombre: "Soporte Operativo / Alta Intensidad",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    glow: "shadow-rose-500/10",
    icono: "⚡"
  },
  0: {
    nombre: "Talento Inicial / En Desarrollo",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    glow: "shadow-amber-500/10",
    icono: "🌱"
  },
  3: {
    nombre: "Especialistas Intermedios Estables",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    glow: "shadow-indigo-500/10",
    icono: "🛡️"
  }
};

export default function RegistrosCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCluster, setFiltroCluster] = useState('todos');
  const [predicciones, setPredicciones] = useState({});
  const [flatFilesStatus, setFlatFilesStatus] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const cargarCandidatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrService.getCandidatos();
      setCandidatos(res.data || []);
      
      try {
        const statusRes = await hrService.getFlatFilesStatus();
        setFlatFilesStatus(statusRes.data);
      } catch (e) {
        // Silencioso si falla status de archivos planos
      }
    } catch (err) {
      console.error("Error al cargar candidatos:", err);
      setError("No se pudo conectar con la base de datos de RRHH.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCandidatos();
  }, []);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente a ${nombre} (ID #${id}) de la base de datos SQL y archivos planos?`)) return;
    try {
      setLoading(true);
      await hrService.eliminarCandidato(id);
      setMensaje(`Candidato "${nombre}" eliminado correctamente de la BD y archivos planos.`);
      setPredicciones(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      await cargarCandidatos();
    } catch (err) {
      setError("Error al eliminar el registro.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredecir = async (id) => {
    try {
      setError(null);
      const res = await hrService.predecirCandidatoSQL(id);
      setPredicciones(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Error al clasificar candidato.");
    }
  };

  const handleSincronizarPlanos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrService.syncFlatFiles();
      setMensaje(res.data.message);
      const statusRes = await hrService.getFlatFilesStatus();
      setFlatFilesStatus(statusRes.data);
    } catch (err) {
      setError("Fallo al sincronizar archivos planos en /Database.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de candidatos
  const candidatosFiltrados = candidatos.filter(c => {
    const textoCompleto = `${c.nombres} ${c.apellidos} ${c.telefono || ''} ${c.direccion || ''} ${c.comentario_evaluacion || ''}`.toLowerCase();
    const coincideBusqueda = textoCompleto.includes(busqueda.toLowerCase());

    if (!coincideBusqueda) return false;

    if (filtroCluster !== 'todos') {
      const pred = predicciones[c.id_candidato];
      if (!pred) return true; // Mostrar si aún no se ha clasificado o según filtro
      return String(pred.segmento_asignado) === String(filtroCluster);
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      {/* Cabecera Orgánica con Glassmorphism */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
                🗄️ Base de Datos Relacional + Archivos Planos
              </span>
              <span className="text-xs text-slate-600 font-bold">Caso 5 USAC</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Registros de Candidatos y Talento
            </h1>
            <p className="text-sm text-slate-700 mt-1 max-w-2xl font-medium">
              Consulta, clasifica mediante inferencia predictiva en tiempo real y gestiona todos los perfiles almacenados en SQLite y archivos planos JSON/CSV en <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono text-xs font-bold">/Database</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboards"
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-black transition-all flex items-center gap-2 border border-indigo-200 shadow-xs"
            >
              📊 Ver Dashboards & Gráficas
            </Link>
            <button
              onClick={handleSincronizarPlanos}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 cursor-pointer"
              title="Forzar actualización de candidatos.json y candidatos.csv"
            >
              🔄 Sincronizar Archivos Planos
            </button>
            <Link
              to="/candidatos"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              ➕ Nuevo Candidato
            </Link>
          </div>
        </div>

        {/* Tarjeta Informativa de Archivos Planos */}
        {flatFilesStatus && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Archivos Planos: <strong className="text-slate-900">candidatos.json</strong> ({Math.round(flatFilesStatus.json_size_bytes / 1024)} KB)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                CSV Tabular: <strong className="text-slate-900">candidatos.csv</strong> ({Math.round(flatFilesStatus.csv_size_bytes / 1024)} KB)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Compatibilidad nativa con Debian / Linux garantizada
            </span>
          </div>
        )}
      </div>

      {/* Alertas */}
      {mensaje && (
        <div className="p-4 bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-800 text-sm rounded-2xl font-medium flex items-center justify-between animate-fadeIn">
          <span>✅ {mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-800 text-sm rounded-2xl font-medium flex items-center justify-between animate-fadeIn">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, teléfono, dirección o evaluación..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarCandidatos}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {loading ? 'Cargando...' : '🔄 Recargar'}
          </button>

          <span className="text-xs font-semibold text-slate-500 px-3 py-2 bg-slate-100 rounded-xl">
            Total: <strong>{candidatosFiltrados.length}</strong> {candidatosFiltrados.length === 1 ? 'candidato' : 'candidatos'}
          </span>
        </div>
      </div>

      {/* Lista de Tarjetas de Candidatos */}
      {candidatosFiltrados.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-base font-bold text-slate-700">No se encontraron candidatos registrados</p>
          <p className="text-xs text-slate-500 mt-1">Registra nuevos candidatos desde el formulario principal de Reclutamiento.</p>
          <Link
            to="/candidatos"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
          >
            Ir a Reclutamiento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {candidatosFiltrados.map((c) => {
            const pred = predicciones[c.id_candidato];
            const clusterConfig = pred ? CLUSTER_CONFIG[pred.segmento_asignado] : null;

            return (
              <div
                key={c.id_candidato}
                className="bg-white/85 backdrop-blur-xl border border-white/60 p-5 md:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4 relative"
              >
                {/* Cabecera del Candidato */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Candidato #{c.id_candidato}
                      </span>
                      {c.estado_civil && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {c.estado_civil}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900">
                      {c.nombres} {c.apellidos}
                    </h3>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>📍 {c.direccion || 'Sin dirección registrada'}</span>
                      <span>📞 {c.telefono || 'Sin teléfono'}</span>
                      {c.fecha_nacimiento && <span>🎂 {c.fecha_nacimiento}</span>}
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => handlePredecir(c.id_candidato)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      ⚡ Clasificar con IA
                    </button>
                    <button
                      onClick={() => handleEliminar(c.id_candidato, `${c.nombres} ${c.apellidos}`)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition-all"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>

                {/* Métricas Principales (Píldoras) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Experiencia</span>
                    <span className="text-sm font-extrabold text-slate-800">{c.anios_experiencia ?? 2} años</span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Evaluación</span>
                    <span className="text-sm font-extrabold text-indigo-700">{c.calificacion_evaluacion ?? 4.5} / 5.0</span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Cumplimiento</span>
                    <span className="text-sm font-extrabold text-emerald-700">{c.cumplimiento_metas ?? 90}%</span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Horas / Mes</span>
                    <span className="text-sm font-extrabold text-slate-800">{c.horas_mensuales ?? 160} hrs</span>
                  </div>
                </div>

                {/* Historial Laboral y Evaluaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Historial Laboral */}
                  <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider flex items-center justify-between">
                      <span>💼 Historial Laboral</span>
                      <span className="text-[10px] font-normal text-slate-400">({c.experiencias?.length || 0})</span>
                    </span>
                    {c.experiencias && c.experiencias.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-600">
                        {c.experiencias.map((exp, idx) => (
                          <li key={exp.id_experiencia || idx} className="border-b border-slate-100 last:border-0 pb-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{exp.empresa}</span>
                              <span className="text-emerald-700 font-semibold">${exp.sueldo}/mes</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {exp.desde_fecha || 'N/A'} a {exp.hasta_fecha || 'N/A'} • {exp.direccion || 'S/D'} • Retiro: {exp.motivo_retiro || 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Sin experiencia registrada.</p>
                    )}
                  </div>

                  {/* Evaluaciones Rendidas */}
                  <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider flex items-center justify-between">
                      <span>📝 Evaluaciones Rendidas</span>
                      <span className="text-[10px] font-normal text-slate-400">({c.evaluaciones?.length || 0})</span>
                    </span>
                    {c.evaluaciones && c.evaluaciones.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-600">
                        {c.evaluaciones.map((ev, idx) => (
                          <li key={ev.id_evaluacion || idx} className="border-b border-slate-100 last:border-0 pb-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{ev.descripcion_evaluacion}</span>
                              <span className="font-bold text-indigo-700">{ev.nota_obtenida} / 100</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Mínimo: {ev.nota_minima} • Fecha: {ev.fecha_evaluacion || 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Sin evaluaciones registradas.</p>
                    )}

                    {c.comentario_evaluacion && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl">
                        <strong className="text-indigo-900 block font-semibold mb-0.5">Evaluación Cualitativa (NLP):</strong>
                        <p className="italic font-medium text-slate-700">"{c.comentario_evaluacion}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel de Resultado Predictivo con Glassmorphism */}
                {pred && (
                  <div className="mt-3 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 backdrop-blur-md animate-fadeIn space-y-3">
                    <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🤖 Resultado de Inferencia Predictiva</span>
                      </span>
                      <button
                        onClick={() => setPredicciones(prev => {
                          const copy = { ...prev };
                          delete copy[c.id_candidato];
                          return copy;
                        })}
                        className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-xl shadow-md space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">
                          Interpretación RRHH (Caso 5)
                        </span>
                        <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          Clúster {pred.segmento_asignado}
                        </span>
                      </div>
                      <h4 className="text-lg font-black tracking-tight leading-snug">
                        {pred.mapeo_negocio?.titulo || pred.etiqueta_negocio}
                      </h4>
                      <p className="text-xs text-indigo-100">
                        {pred.mapeo_negocio?.subtitulo}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                        <strong className="text-slate-800 block mb-1">Evaluación de Riesgo:</strong>
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800">
                          {pred.mapeo_negocio?.nivel_riesgo || 'Normal'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                        <strong className="text-slate-800 block mb-1">💡 Plan de Acción Recomendado:</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {pred.mapeo_negocio?.recomendacion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
