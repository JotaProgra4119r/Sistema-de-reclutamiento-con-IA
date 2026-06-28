import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './AppContext';
import CargaDatos from './CargaDatos';
import Entrenamiento from './Entrenamiento';
import Interpretacion from './Interpretacion';         
import Clasificacion from './Clasificacion';
import Exportacion from './Exportacion';
import Evaluacion from './components/Evaluacion';
import Prediccion from './components/Prediccion';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Menú Lateral Oscuro (SaaS Style) */}
      <aside className="w-72 bg-slate-900 text-slate-400 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Talent<span className="text-indigo-500">Mosaic</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Motor de Segmentación</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink to="/carga" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            1. Carga y Preprocesamiento
          </NavLink>
          <NavLink to="/entrenamiento" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            2. Configuración y Entrenamiento
          </NavLink>
          <NavLink to="/interpretacion" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            3. Interpretación de Segmentos
          </NavLink>
          <NavLink to="/evaluacion" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            4. Evaluación y Validación
          </NavLink>
          <NavLink to="/clasificacion" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            5. Clasificación de Nuevo Registro
          </NavLink>
          <NavLink to="/exportacion" className={({isActive}) => `block p-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            6. Exportación de Reportes
          </NavLink>
        </nav>
      </aside>

      {/* Contenedor Principal */}
      <main className="flex-1 p-10 overflow-auto bg-slate-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/carga" element={<CargaDatos />} />
            <Route path="/entrenamiento" element={<Entrenamiento />} />
            <Route path="/interpretacion" element={<Interpretacion />} />
            <Route path="/evaluacion" element={<Evaluacion />} />
            <Route path="/clasificacion" element={<Clasificacion />} />
            <Route path="/exportacion" element={<Exportacion />} />
            <Route path="/prediccion" element={<Prediccion />} />
            <Route path="*" element={<CargaDatos />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </AppProvider>
  );
}