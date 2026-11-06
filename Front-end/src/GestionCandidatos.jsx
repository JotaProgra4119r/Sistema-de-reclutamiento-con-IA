import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrService } from './services/api';

export default function GestionCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [ultimoCandidato, setUltimoCandidato] = useState(null);
  const [prediccionReciente, setPrediccionReciente] = useState(null);

  const [formCandidato, setFormCandidato] = useState({
    nombres: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    fecha_nacimiento: '',
    estado_civil: 'Soltero',
    anios_experiencia: 3,
    calificacion_evaluacion: 4.5,
    cumplimiento_metas: 90,
    horas_mensuales: 160,
    proyectos_recurrentes: 3,
    comentario_evaluacion: ''
  });

  const [experiencias, setExperiencias] = useState([
    { empresa: '', direccion: '', desde_fecha: '', hasta_fecha: '', sueldo: 0, motivo_retiro: '' }
  ]);

  const [evaluaciones, setEvaluaciones] = useState([
    { descripcion_evaluacion: 'Prueba Técnica de Selección', nota_minima: 70, fecha_evaluacion: new Date().toISOString().split('T')[0], nota_obtenida: 85 }
  ]);

  const cargarCandidatos = async () => {
    try {
      setLoading(true);
      const res = await hrService.getCandidatos();
      setCandidatos(res.data || []);
    } catch (err) {
      console.error("Error al cargar candidatos de SQL:", err);
      setError("No se pudo conectar con la base de datos SQL de RRHH.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCandidatos();
  }, []);

  const handleCandidatoChange = (e) => {
    const { name, value } = e.target;
    setFormCandidato({ 
      ...formCandidato, 
      [name]: ['anios_experiencia', 'calificacion_evaluacion', 'cumplimiento_metas', 'horas_mensuales', 'proyectos_recurrentes'].includes(name)
        ? parseFloat(value) || 0
        : value 
    });
  };

  const handleExpChange = (index, e) => {
    const newExp = [...experiencias];
    newExp[index][e.target.name] = e.target.value;
    setExperiencias(newExp);
  };
  const addExpRow = () => {
    setExperiencias([...experiencias, { empresa: '', direccion: '', desde_fecha: '', hasta_fecha: '', sueldo: 0, motivo_retiro: '' }]);
  };
  const removeExpRow = (index) => {
    if (experiencias.length > 1) {
      setExperiencias(experiencias.filter((_, i) => i !== index));
    }
  };

  const handleEvalChange = (index, e) => {
    const newEval = [...evaluaciones];
    newEval[index][e.target.name] = e.target.value;
    setEvaluaciones(newEval);
  };
  const addEvalRow = () => {
    setEvaluaciones([...evaluaciones, { descripcion_evaluacion: '', nota_minima: 70, fecha_evaluacion: '', nota_obtenida: 0 }]);
  };
  const removeEvalRow = (index) => {
    if (evaluaciones.length > 1) {
      setEvaluaciones(evaluaciones.filter((_, i) => i !== index));
    }
  };

  const handleCrearCandidato = async (e) => {
    e.preventDefault();
    if (!formCandidato.nombres.trim() || !formCandidato.apellidos.trim()) {
      setError("Nombres y Apellidos son campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMensaje(null);
      setPrediccionReciente(null);

      const payload = {
        ...formCandidato,
        experiencias: experiencias.filter(exp => exp.empresa.trim() !== '').map(exp => ({
          ...exp,
          sueldo: parseFloat(exp.sueldo) || 0
        })),
        evaluaciones: evaluaciones.filter(ev => ev.descripcion_evaluacion.trim() !== '').map(ev => ({
          ...ev,
          nota_minima: parseFloat(ev.nota_minima) || 0,
          nota_obtenida: parseFloat(ev.nota_obtenida) || 0
        }))
      };

      const res = await hrService.crearCandidato(payload);
      const nuevoCand = res.data;
      setUltimoCandidato(nuevoCand);

      setMensaje(`¡Candidato "${nuevoCand.nombres} ${nuevoCand.apellidos}" guardado exitosamente en SQL y archivos planos (/Database)!`);
      
      // Limpiar formulario con valores por defecto
      setFormCandidato({ 
        nombres: '', apellidos: '', direccion: '', telefono: '', fecha_nacimiento: '', estado_civil: 'Soltero',
        anios_experiencia: 3, calificacion_evaluacion: 4.5, cumplimiento_metas: 90, horas_mensuales: 160, proyectos_recurrentes: 3, comentario_evaluacion: ''
      });
      setExperiencias([{ empresa: '', direccion: '', desde_fecha: '', hasta_fecha: '', sueldo: 0, motivo_retiro: '' }]);
      setEvaluaciones([{ descripcion_evaluacion: 'Prueba Técnica de Selección', nota_minima: 70, fecha_evaluacion: new Date().toISOString().split('T')[0], nota_obtenida: 85 }]);
      
      await cargarCandidatos();
    } catch (err) {
      console.error("Error al registrar candidato:", err);
      setError(err.response?.data?.message || err.message || "Fallo al registrar candidato en la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredecirNuevo = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrService.predecirCandidatoSQL(id);
      setPrediccionReciente(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Error al clasificar candidato con IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSincronizarML = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrService.sincronizarSQLConML();
      setMensaje(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || "Fallo al sincronizar base de datos relacional con el motor de IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-16 animate-fadeIn">
      
      {/* Banner Principal / Hero Orgánico Claro */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-indigo-50/50 p-6 md:p-8 rounded-3xl shadow-xs relative overflow-hidden border border-emerald-200/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-black uppercase tracking-wider">
              <span>🌿 Interfaz Principal</span>
              <span>•</span>
              <span>Caso 5 USAC (RRHH SQL)</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
              Sistema de Reclutamiento y Selección
            </h1>
            <p className="text-slate-700 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              Formulario integral de candidatos, historial laboral, evaluaciones y clasificación automatizada en tiempo real mediante algoritmos de Machine Learning y NLP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={handleSincronizarML}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              title="Carga todos los candidatos de SQL como dataset activo en la memoria del motor de IA"
            >
              ⚡ Sincronizar con Motor ML
            </button>
            <Link
              to="/registros"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 hover:text-slate-950 px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              🗄️ Ver Base de Datos ({candidatos.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {mensaje && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm rounded-2xl font-bold flex items-center justify-between animate-fadeIn shadow-xs">
          <span className="flex items-center gap-2">✅ {mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-emerald-800 hover:text-emerald-950 font-black ml-2">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-950 text-sm rounded-2xl font-bold flex items-center justify-between animate-fadeIn shadow-xs">
          <span className="flex items-center gap-2">⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-800 hover:text-rose-950 font-black ml-2">✕</button>
        </div>
      )}

      {/* Tarjeta de Éxito / Candidato Recién Guardado con Inferencia Rápida */}
      {ultimoCandidato && (
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-emerald-500 shadow-md animate-scaleUp space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">Último Candidato Registrado Exitosamente</span>
              <h3 className="text-xl font-black text-slate-900">{ultimoCandidato.nombres} {ultimoCandidato.apellidos}</h3>
              <p className="text-xs text-slate-600 font-semibold">ID #{ultimoCandidato.id_candidato} • Exp: {ultimoCandidato.anios_experiencia} años • Metas: {ultimoCandidato.cumplimiento_metas}%</p>
            </div>
            <button
              onClick={() => handlePredecirNuevo(ultimoCandidato.id_candidato)}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              🤖 Clasificar Ahora con IA
            </button>
          </div>

          {prediccionReciente && (
            <div className="p-4 bg-indigo-50/90 rounded-2xl border border-indigo-200 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 uppercase">Resultado de Segmentación:</span>
                <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                  Clúster #{prediccionReciente.segmento_asignado}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">{prediccionReciente.mapeo_negocio?.titulo}</h4>
              <p className="text-xs text-slate-700 font-semibold">{prediccionReciente.mapeo_negocio?.subtitulo}</p>
              <div className="pt-2 text-xs text-slate-800 bg-white p-3 rounded-xl border border-indigo-200 font-medium">
                <strong className="text-slate-900">💡 Recomendación RRHH:</strong> {prediccionReciente.mapeo_negocio?.recomendacion}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO ESTILO GLASSMORPHISM ORGÁNICO */}
      <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Formulario de Registro: Candidato</h2>
            <p className="text-xs text-slate-600 font-medium">Completa la información del candidato para almacenar en SQL y archivos planos.</p>
          </div>
          <span className="text-[11px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full self-start sm:self-auto">
            Campos marcados con (*) son requeridos
          </span>
        </div>

        <form onSubmit={handleCrearCandidato} className="space-y-6">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>👤</span> Información General del Candidato
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombres *</label>
                <input
                  type="text"
                  name="nombres"
                  value={formCandidato.nombres}
                  onChange={handleCandidatoChange}
                  required
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-slate-800 font-medium transition-all"
                  placeholder="Ej. Sofía Isabel"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formCandidato.apellidos}
                  onChange={handleCandidatoChange}
                  required
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-slate-800 font-medium transition-all"
                  placeholder="Ej. Mendoza Ramírez"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formCandidato.direccion}
                  onChange={handleCandidatoChange}
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-medium transition-all"
                  placeholder="Ej. Av. Las Américas 14-20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formCandidato.telefono}
                  onChange={handleCandidatoChange}
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-medium transition-all"
                  placeholder="+502 5555-1234"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formCandidato.fecha_nacimiento}
                  onChange={handleCandidatoChange}
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estado Civil</label>
                <select
                  name="estado_civil"
                  value={formCandidato.estado_civil}
                  onChange={handleCandidatoChange}
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                >
                  <option value="Soltero">Soltero/a</option>
                  <option value="Casado">Casado/a</option>
                  <option value="Divorciado">Divorciado/a</option>
                  <option value="Viudo">Viudo/a</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: MÉTRICAS DE CLASIFICACIÓN DE IA */}
          <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <span>📊</span> Métricas de Desempeño y Evaluación (Motor de IA)
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                Parámetros Numéricos de Segmentación
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Años de Experiencia</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="anios_experiencia"
                  value={formCandidato.anios_experiencia}
                  onChange={handleCandidatoChange}
                  className="w-full border border-indigo-200 p-3 rounded-xl bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Calificación Evaluación (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  name="calificacion_evaluacion"
                  value={formCandidato.calificacion_evaluacion}
                  onChange={handleCandidatoChange}
                  className="w-full border border-indigo-200 p-3 rounded-xl bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="4.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cumplimiento de Metas (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="cumplimiento_metas"
                  value={formCandidato.cumplimiento_metas}
                  onChange={handleCandidatoChange}
                  className="w-full border border-indigo-200 p-3 rounded-xl bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horas Mensuales</label>
                <input
                  type="number"
                  min="1"
                  name="horas_mensuales"
                  value={formCandidato.horas_mensuales}
                  onChange={handleCandidatoChange}
                  className="w-full border border-indigo-200 p-3 rounded-xl bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="160"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proyectos Recurrentes</label>
                <input
                  type="number"
                  min="0"
                  name="proyectos_recurrentes"
                  value={formCandidato.proyectos_recurrentes}
                  onChange={handleCandidatoChange}
                  className="w-full border border-indigo-200 p-3 rounded-xl bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="3"
                />
              </div>
            </div>

            {/* Comentario Cualitativo para NLP */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Evaluación Cualitativa / Comentario RRHH (Para Vectorización de Texto NLP)
              </label>
              <textarea
                name="comentario_evaluacion"
                value={formCandidato.comentario_evaluacion}
                onChange={handleCandidatoChange}
                rows={3}
                placeholder="Ej. El candidato demostró alto liderazgo en proyectos estratégicos corporativos, trabajo en equipo impecable y exactitud técnica en el cumplimiento de metas..."
                className="w-full border border-indigo-200 p-3 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none font-medium text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* SECCIÓN 3: EXPERIENCIA LABORAL */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>💼</span> Experiencia (Historial Laboral)
              </h3>
              <button
                type="button"
                onClick={addExpRow}
                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
              >
                + Agregar Empresa
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Empresa</th>
                    <th className="p-2.5">Dirección</th>
                    <th className="p-2.5">Desde</th>
                    <th className="p-2.5">Hasta</th>
                    <th className="p-2.5">Sueldo ($)</th>
                    <th className="p-2.5">Motivo Retiro</th>
                    <th className="p-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {experiencias.map((exp, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          name="empresa"
                          value={exp.empresa}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none focus:border-emerald-500"
                          placeholder="Ej. TechCorp"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          name="direccion"
                          value={exp.direccion}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                          placeholder="Zona 10"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          name="desde_fecha"
                          value={exp.desde_fecha}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          name="hasta_fecha"
                          value={exp.hasta_fecha}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          name="sueldo"
                          value={exp.sueldo}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-800"
                          placeholder="3500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          name="motivo_retiro"
                          value={exp.motivo_retiro}
                          onChange={(e) => handleExpChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                          placeholder="Ascenso"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {experiencias.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExpRow(idx)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded"
                            title="Eliminar fila"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 4: EVALUACIONES RENDIDAS */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>📝</span> Evaluaciones Rendidas
              </h3>
              <button
                type="button"
                onClick={addEvalRow}
                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
              >
                + Agregar Evaluación
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Descripción de la Evaluación</th>
                    <th className="p-2.5">Nota Mínima</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Nota Obtenida</th>
                    <th className="p-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((ev, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          name="descripcion_evaluacion"
                          value={ev.descripcion_evaluacion}
                          onChange={(e) => handleEvalChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none focus:border-emerald-500"
                          placeholder="Ej. Prueba Técnica de Selección"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          name="nota_minima"
                          value={ev.nota_minima}
                          onChange={(e) => handleEvalChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                          placeholder="70"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          name="fecha_evaluacion"
                          value={ev.fecha_evaluacion}
                          onChange={(e) => handleEvalChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          name="nota_obtenida"
                          value={ev.nota_obtenida}
                          onChange={(e) => handleEvalChange(idx, e)}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-indigo-600"
                          placeholder="85"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {evaluaciones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEvalRow(idx)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded"
                            title="Eliminar fila"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTÓN SUBMIT PRINCIPAL */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando en Base de Datos y Archivos Planos...' : '💾 Guardar Candidato en Base de Datos SQL'}
            </button>
            <Link
              to="/registros"
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
            >
              Consultar Registros ({candidatos.length})
            </Link>
          </div>

        </form>
      </div>

    </div>
  );
}
