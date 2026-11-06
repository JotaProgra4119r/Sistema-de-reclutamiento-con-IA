import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './services/api';
import { AppProvider } from './AppContext';
import CargaDatos from './CargaDatos';
import Entrenamiento from './Entrenamiento';
import Interpretacion from './Interpretacion';         
import Clasificacion from './Clasificacion';
import Exportacion from './Exportacion';
import Evaluacion from './components/Evaluacion';
import GestionCandidatos from './GestionCandidatos';
import RegistrosCandidatos from './RegistrosCandidatos';
import Dashboards from './Dashboards';

const NavigationBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mlDropdownOpen, setMlDropdownOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(null);
  const location = useLocation();

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
    setMlDropdownOpen(false);
  }, [location.pathname]);

  // Verificar estado del servidor backend FastAPI
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status`);
        setServerOnline(res.status === 200);
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const mlRoutes = ['/carga', '/entrenamiento', '/interpretacion', '/evaluacion', '/clasificacion'];
  const isMlActive = mlRoutes.some(route => location.pathname === route);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo y Branding Orgánico */}
          <div className="flex items-center gap-3">
            <NavLink to="/candidatos" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-all">
                <span className="text-xl">🌿</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base md:text-lg font-black tracking-tight text-slate-900">
                    Talent<span className="text-emerald-700">Mosaic</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    RRHH
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold hidden sm:block">Gestión de Talento & ML</p>
              </div>
            </NavLink>

            {/* Badge de Estado del Servidor */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-300 text-xs font-bold text-slate-700">
              <span className={`w-2.5 h-2.5 rounded-full ${serverOnline === true ? 'bg-emerald-500 animate-pulse' : serverOnline === false ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
              <span>{serverOnline === true ? 'FastAPI Online' : serverOnline === false ? 'Servidor Desconectado' : 'Conectando...'}</span>
            </div>
          </div>

          {/* Menú Horizontal para Pantallas Medianas y Grandes */}
          <nav className="hidden md:flex items-center gap-1.5">
            
            {/* 1. Reclutamiento (Principal - Opción 6) */}
            <NavLink
              to="/candidatos"
              className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'}`}
            >
              <span>📋</span> Reclutamiento
            </NavLink>

            {/* 2. Registros Base de Datos SQL */}
            <NavLink
              to="/registros"
              className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'}`}
            >
              <span>🗄️</span> Registros SQL
            </NavLink>

            {/* Dashboards y Desempeño del Sistema */}
            <NavLink
              to="/dashboards"
              className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'}`}
            >
              <span>📊</span> Dashboards & Gráficas
            </NavLink>

            {/* 3. Apartado de Configuraciones y Motor de Machine Learning (Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setMlDropdownOpen(!mlDropdownOpen)}
                onBlur={() => setTimeout(() => setMlDropdownOpen(false), 250)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isMlActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'}`}
              >
                <span>⚙️</span> Motor ML & Configuración
                <span className={`text-[10px] transition-transform duration-200 ${mlDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {mlDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/80 p-2 space-y-1 animate-scaleUp z-50">
                  <span className="block px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Pipeline de Machine Learning
                  </span>
                  <NavLink
                    to="/carga"
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>1.</span> Carga y Preprocesamiento
                  </NavLink>
                  <NavLink
                    to="/entrenamiento"
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>2.</span> Configuración y Entrenamiento
                  </NavLink>
                  <NavLink
                    to="/interpretacion"
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>3.</span> Interpretación de Segmentos
                  </NavLink>
                  <NavLink
                    to="/evaluacion"
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>4.</span> Evaluación y Validación
                  </NavLink>
                  <NavLink
                    to="/clasificacion"
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>5.</span> Clasificación en Tiempo Real
                  </NavLink>
                </div>
              )}
            </div>

            {/* 4. Exportación de Reportes */}
            <NavLink
              to="/exportacion"
              className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}`}
            >
              <span>📑</span> Exportar Reportes
            </NavLink>

          </nav>

          {/* Botón Menú Hamburguesa para Móviles (Android / Pantallas Pequeñas) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Drawer Móvil Desplegable (Glassmorphism para Android / Smartphones / Portátiles Pequeños) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 px-4 pt-2 pb-6 space-y-2 animate-fadeIn shadow-xl">
          <div className="px-3 py-1.5 mb-2 rounded-xl bg-slate-100/80 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Estado del Sistema:</span>
            <span className={`font-semibold ${serverOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
              {serverOnline ? '● FastAPI Activo' : '● Sin Conexión'}
            </span>
          </div>

          <NavLink
            to="/candidatos"
            className={({ isActive }) => `block p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            📋 Reclutamiento (Principal)
          </NavLink>

          <NavLink
            to="/registros"
            className={({ isActive }) => `block p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            🗄️ Registros en Base de Datos SQL
          </NavLink>

          <NavLink
            to="/dashboards"
            className={({ isActive }) => `block p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            📊 Dashboards & Gráficas del Sistema
          </NavLink>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="block px-3 py-1 text-[10px] font-black uppercase text-slate-400">
              Módulo de Machine Learning & Configuración
            </span>
            <NavLink
              to="/carga"
              className={({ isActive }) => `block p-2.5 rounded-xl text-xs font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              1. Carga y Preprocesamiento
            </NavLink>
            <NavLink
              to="/entrenamiento"
              className={({ isActive }) => `block p-2.5 rounded-xl text-xs font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              2. Configuración y Entrenamiento
            </NavLink>
            <NavLink
              to="/interpretacion"
              className={({ isActive }) => `block p-2.5 rounded-xl text-xs font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              3. Interpretación de Segmentos
            </NavLink>
            <NavLink
              to="/evaluacion"
              className={({ isActive }) => `block p-2.5 rounded-xl text-xs font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              4. Evaluación y Validación
            </NavLink>
            <NavLink
              to="/clasificacion"
              className={({ isActive }) => `block p-2.5 rounded-xl text-xs font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              5. Clasificación en Tiempo Real
            </NavLink>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <NavLink
              to="/exportacion"
              className={({ isActive }) => `block p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              📑 Exportar Reportes (ZIP)
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Fondos Decorativos Orgánicos con Gradientes y Mallas Borrosas */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-100/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Barra Horizontal Superior */}
      <NavigationBar />

      {/* Contenedor de Contenido Principal - Pantalla Completa Maximizada */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
        {children}
      </main>

      {/* Footer Minimalista Orgánico */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-600 bg-white/60 backdrop-blur-md">
        <p className="font-semibold">TalentMosaic • Plataforma Universal de Reclutamiento e Inteligencia de RRHH (Caso 5 USAC)</p>
        <p className="text-[11px] text-slate-500 mt-1">Compatible con Debian, Ubuntu, Linux y Windows • Motor de Machine Learning & NLP</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            {/* Opción 6 (Gestión de Candidatos) es la interfaz principal por defecto */}
            <Route path="/" element={<GestionCandidatos />} />
            <Route path="/candidatos" element={<GestionCandidatos />} />
            <Route path="/registros" element={<RegistrosCandidatos />} />
            <Route path="/dashboards" element={<Dashboards />} />
            
            {/* Pipeline de Machine Learning y Configuración */}
            <Route path="/carga" element={<CargaDatos />} />
            <Route path="/entrenamiento" element={<Entrenamiento />} />
            <Route path="/interpretacion" element={<Interpretacion />} />
            <Route path="/evaluacion" element={<Evaluacion />} />
            <Route path="/clasificacion" element={<Clasificacion />} />
            
            {/* Exportación de Reportes */}
            <Route path="/exportacion" element={<Exportacion />} />
            
            {/* Redirección por defecto a Reclutamiento */}
            <Route path="*" element={<GestionCandidatos />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </AppProvider>
  );
}