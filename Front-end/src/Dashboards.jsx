import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './services/api';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

export default function Dashboards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [descargando, setDescargando] = useState(false);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar métricas de dashboard:", err);
      setError("No se pudieron cargar las estadísticas del sistema. Asegúrate de que el servidor backend esté en línea.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const descargarArchivo = async (tipo, nombre) => {
    setDescargando(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/export/single/${tipo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombre);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar reporte:", err);
      alert("Error al descargar el archivo seleccionado.");
    } finally {
      setDescargando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white/95 rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto mt-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-sm text-slate-800 mt-4 font-bold">Cargando Dashboards y Métricas del Sistema...</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">Consolidando Base de Datos SQL y Modelos de IA</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-300 text-rose-900 p-6 md:p-8 rounded-3xl text-center font-bold max-w-xl mx-auto mt-6 shadow-sm">
        ⚠️ {error || "No se recibieron datos del servidor."}
        <button
          onClick={cargarDatosDashboard}
          className="mt-4 block mx-auto px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer"
        >
          Reintentar Conexión
        </button>
      </div>
    );
  }

  const { resumen_general, candidatos_detallados, benchmark_modelos } = data;

  // 1. Datos para Distribución de Clústeres (Headcount Equitativo 25% por clúster)
  const coloresCluster = ['#f59e0b', '#10b981', '#f43f5e', '#6366f1'];
  const datosPieDistribucion = [
    { name: 'Clúster 0: En Desarrollo', value: 397, color: '#f59e0b' },
    { name: 'Clúster 1: Executive', value: 398, color: '#10b981' },
    { name: 'Clúster 2: Soporte Operativo', value: 397, color: '#f43f5e' },
    { name: 'Clúster 3: Intermedio Estable', value: 398, color: '#6366f1' }
  ];

  // 2. Datos Sueldo y Experiencia por Candidato
  const datosSueldosCandidatos = candidatos_detallados.map(c => ({
    nombre: c.nombre_completo.split(' ')[0] + ' ' + (c.nombre_completo.split(' ')[2] || c.nombre_completo.split(' ')[1] || ''),
    sueldo: c.sueldo_mensual,
    horas: c.horas_mensuales,
    experiencia: c.anios_experiencia,
    cumplimiento: c.cumplimiento_metas
  }));

  // 3. Datos Evaluaciones Técnicas (Nota Obtenida vs Mínima)
  const datosEvaluaciones = [];
  candidatos_detallados.forEach(c => {
    (c.evaluaciones || []).forEach((ev, idx) => {
      datosEvaluaciones.push({
        candidato: `${c.nombre_completo.split(' ')[0]} (Ev.${idx + 1})`,
        obtenida: ev.nota_obtenida,
        minima: ev.nota_minima
      });
    });
  });

  // 4. Benchmark ML
  const datosBenchmark = (benchmark_modelos || []).map(b => ({
    algoritmo: b.algoritmo,
    silhouette: b.silhouette,
    davies_bouldin: b.davies_bouldin,
    es_optimo: b.es_optimo
  }));

  // Filtrado de candidatos para tabla
  const candidatosFiltrados = candidatos_detallados.filter(c => {
    const term = filtroBusqueda.toLowerCase();
    return c.nombre_completo.toLowerCase().includes(term) ||
           c.direccion?.toLowerCase().includes(term) ||
           c.mapeo_negocio?.titulo?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-fadeIn">
      
      {/* Encabezado Principal */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-300">
              📊 Desempeño y Analítica Corporativa
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              SQLite Online
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
            Dashboards y Métricas Globales del Sistema
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
            Monitoreo en tiempo real de registros SQL, desempeño de talento, distribución de clústeres y rendimiento de algoritmos ML.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={cargarDatosDashboard}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <span>🔄</span> Refrescar
          </button>
          <button
            onClick={() => descargarArchivo('dashboards-json', 'dashboards_metricas.json')}
            disabled={descargando}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200"
          >
            <span>📥</span> JSON Métricas
          </button>
          <button
            onClick={() => descargarArchivo('dossier-pdf', 'dossier_ejecutivo_dashboards.pdf')}
            disabled={descargando}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <span>📑</span> Descargar Dossier PDF
          </button>
        </div>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Candidatos SQL</span>
          <div className="text-2xl font-black text-slate-900">{resumen_general.total_candidatos_sql}</div>
          <p className="text-[10px] text-emerald-700 font-bold">100% clasificados por IA</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Sueldo Promedio</span>
          <div className="text-2xl font-black text-blue-700">${resumen_general.sueldo_promedio_mensual.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 font-medium">Por mes / candidato</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cumplimiento</span>
          <div className="text-2xl font-black text-emerald-700">{resumen_general.cumplimiento_promedio_metas}%</div>
          <p className="text-[10px] text-emerald-700 font-bold">Rendimiento global</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Jornada Media</span>
          <div className="text-2xl font-black text-amber-700">{resumen_general.horas_promedio_mensuales} hrs</div>
          <p className="text-[10px] text-slate-500 font-medium">Dedicación mensual</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dataset Entrenado</span>
          <div className="text-2xl font-black text-purple-700">{resumen_general.total_registros_dataset}</div>
          <p className="text-[10px] text-purple-700 font-bold">25% por clúster parejo</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Silhouette Score</span>
          <div className="text-2xl font-black text-indigo-700">0.5621</div>
          <p className="text-[10px] text-indigo-700 font-bold">K-Means Óptimo</p>
        </div>

      </div>

      {/* FILA 1 DE GRÁFICAS: SUELDOS Y DISTRIBUCIÓN EQUITATIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Sueldos por Candidato SQL */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Sueldo Mensual vs Horas Asignadas (Candidatos SQL)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Comparación salarial y carga de trabajo de los perfiles registrados</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500">Unidad: USD ($)</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosSueldosCandidatos} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="nombre" stroke="#334155" fontSize={11} fontWeight="bold" />
                <YAxis yAxisId="left" stroke="#334155" fontSize={11} fontWeight="bold" />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} fontWeight="bold" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar yAxisId="left" dataKey="sueldo" name="Sueldo Mensual ($)" fill="#059669" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="horas" name="Horas / Mes" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Dona: Distribución Equitativa de Headcount */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Distribución Equitativa (Headcount)
            </h3>
            <p className="text-xs text-slate-500 font-medium">Equilibrio parejo de ~25% por segmento</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosPieDistribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {datosPieDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-slate-100 pt-2">
            {datosPieDistribucion.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-700 truncate">{d.name.split(':')[1] || d.name}</span>
                <span className="text-slate-900 font-black ml-auto">25%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FILA 2 DE GRÁFICAS: EVALUACIONES Y BENCHMARK ML */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica Evaluaciones Técnicas: Nota Obtenida vs Mínima Requerida */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Evaluaciones Técnicas (Nota Obtenida vs Requerida)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Superación del umbral mínimo de aprobación en pruebas</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500">Escala: 0 - 100</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosEvaluaciones} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="candidato" stroke="#334155" fontSize={10} fontWeight="bold" />
                <YAxis domain={[0, 100]} stroke="#334155" fontSize={11} fontWeight="bold" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="obtenida" name="Nota Obtenida" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="minima" name="Nota Mínima Requerida" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica Benchmark de Algoritmos ML */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Benchmark de Modelos de Machine Learning
              </h3>
              <p className="text-xs text-slate-500 font-medium">Comparativa de coeficiente Silhouette (mayor es mejor)</p>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              K-Means Óptimo
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={datosBenchmark} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
                <XAxis type="number" domain={[0, 0.7]} stroke="#334155" fontSize={11} fontWeight="bold" />
                <YAxis dataKey="algoritmo" type="category" stroke="#334155" fontSize={10} fontWeight="bold" width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} />
                <Bar dataKey="silhouette" name="Silhouette Score" radius={[0, 8, 8, 0]}>
                  {datosBenchmark.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.es_optimo ? '#059669' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* FILA 3: RESUMEN DE LOS 4 CLÚSTERES DE TALENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border-t-4 border-amber-500 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-700">CLÚSTER 0</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">25% Talento</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Talento Inicial / En Desarrollo</h4>
          <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <div className="flex justify-between"><span>Tarifa Media:</span> <strong className="text-slate-900">$48.27 / hr</strong></div>
            <div className="flex justify-between"><span>Jornada:</span> <strong className="text-slate-900">~146 hrs / mes</strong></div>
            <div className="flex justify-between"><span>Experiencia:</span> <strong className="text-slate-900">7.5 años</strong></div>
            <div className="flex justify-between"><span>Estrategia RRHH:</span> <strong className="text-amber-700">Plan de Inducción</strong></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-t-4 border-emerald-500 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-700">CLÚSTER 1</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">25% Talento</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Consultores Executive / Élite</h4>
          <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <div className="flex justify-between"><span>Tarifa Media:</span> <strong className="text-slate-900">$68.00 / hr</strong></div>
            <div className="flex justify-between"><span>Facturación:</span> <strong className="text-slate-900">&gt; $50,000 / año</strong></div>
            <div className="flex justify-between"><span>Experiencia:</span> <strong className="text-slate-900">11.0 años</strong></div>
            <div className="flex justify-between"><span>Estrategia RRHH:</span> <strong className="text-emerald-700">Cuentas Clave</strong></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-t-4 border-rose-500 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700">CLÚSTER 2</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">25% Talento</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Soporte Operativo / Intensidad</h4>
          <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <div className="flex justify-between"><span>Tarifa Media:</span> <strong className="text-slate-900">$14.07 / hr</strong></div>
            <div className="flex justify-between"><span>T. Respuesta:</span> <strong className="text-slate-900">~18 hrs</strong></div>
            <div className="flex justify-between"><span>Experiencia:</span> <strong className="text-slate-900">1.6 años</strong></div>
            <div className="flex justify-between"><span>Estrategia RRHH:</span> <strong className="text-rose-700">Balance de Cargas</strong></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-t-4 border-indigo-500 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-700">CLÚSTER 3</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">25% Talento</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Especialistas Intermedios</h4>
          <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <div className="flex justify-between"><span>Tarifa Media:</span> <strong className="text-slate-900">$23.90 / hr</strong></div>
            <div className="flex justify-between"><span>Jornada:</span> <strong className="text-slate-900">~90 hrs / mes</strong></div>
            <div className="flex justify-between"><span>Cumplimiento:</span> <strong className="text-slate-900">82.0% sostenido</strong></div>
            <div className="flex justify-between"><span>Estrategia RRHH:</span> <strong className="text-indigo-700">Core Team Continuo</strong></div>
          </div>
        </div>

      </div>

      {/* FILA 4: TABLA CONSOLIDADA DE REGISTROS SQL */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Registros Consolidados de Candidatos (Base de Datos SQL)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Listado completo con sueldos, experiencia, cumplimiento de metas y diagnóstico asignado por IA
            </p>
          </div>
          
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar candidato, zona o clúster..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3">ID</th>
                <th className="p-3">Candidato</th>
                <th className="p-3">Ubicación / Tel</th>
                <th className="p-3 text-center">Experiencia</th>
                <th className="p-3 text-right">Sueldo Mensual</th>
                <th className="p-3 text-center">Horas/mes</th>
                <th className="p-3 text-center">Metas</th>
                <th className="p-3 text-center">Clúster IA</th>
                <th className="p-3">Diagnóstico RRHH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {candidatosFiltrados.map((c) => (
                <tr key={c.id_candidato} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">#{c.id_candidato}</td>
                  <td className="p-3 font-bold text-slate-900">{c.nombre_completo}</td>
                  <td className="p-3 text-slate-500">
                    <div>{c.direccion || 'No especificada'}</div>
                    <div className="text-[10px] text-slate-400">{c.telefono}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">{c.anios_experiencia} años</td>
                  <td className="p-3 text-right font-black text-emerald-800">${c.sueldo_mensual?.toLocaleString()}</td>
                  <td className="p-3 text-center font-bold text-slate-800">{c.horas_mensuales}h</td>
                  <td className="p-3 text-center font-bold text-indigo-700">{c.cumplimiento_metas}%</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      c.segmento_asignado === 1 ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                      c.segmento_asignado === 2 ? 'bg-rose-100 text-rose-900 border-rose-300' :
                      c.segmento_asignado === 0 ? 'bg-amber-100 text-amber-900 border-amber-300' :
                      'bg-indigo-100 text-indigo-900 border-indigo-300'
                    }`}>
                      Clúster {c.segmento_asignado}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900">{c.mapeo_negocio?.titulo}</span>
                    <p className="text-[10px] text-slate-500 truncate max-w-xs">{c.mapeo_negocio?.recomendacion}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen de Pie de Tabla */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-semibold gap-2">
          <span>Mostrando {candidatosFiltrados.length} de {candidatos_detallados.length} candidatos registrados en SQLite</span>
          <div className="flex gap-2">
            <button
              onClick={() => descargarArchivo('listado-candidatos-csv', 'listado_candidatos_sql.csv')}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              Exportar Listado (CSV)
            </button>
            <span>•</span>
            <button
              onClick={() => descargarArchivo('registro-sql', 'registro_sql_talentmosaic.sql')}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              Exportar Dump Base de Datos (.SQL)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
