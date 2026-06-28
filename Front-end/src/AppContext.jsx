import { createContext, useState } from 'react';

// 1. Creamos el contexto global
export const AppContext = createContext();

// 2. Creamos el proveedor que envolverá la aplicación
export const AppProvider = ({ children }) => {
  // Estado global corregido: "resenas" con 'n' para mapear dinámicamente con FastAPI
  const [modelosEntrenados, setModelosEntrenados] = useState({
    freelancers: false,
    resenas: false
  });

  // --- ESTADOS GLOBALES PARA LA PERSISTENCIA DE LA VISTA PREVIA ---
  const [fileFreelancers, setFileFreelancers] = useState(null);
  const [fileResenas, setFileResenas] = useState(null);
  
  const [previewFreelancers, setPreviewFreelancers] = useState({ headers: [], rows: [] });
  const [previewResenas, setPreviewResenas] = useState({ headers: [], rows: [] });
  
  const [limpiezaStatus, setLimpiezaStatus] = useState(null);

  // Función para resetear todo el estado local/global del frontend
  const resetFrontendStates = () => {
    setFileFreelancers(null);
    setFileResenas(null);
    setPreviewFreelancers({ headers: [], rows: [] });
    setPreviewResenas({ headers: [], rows: [] });
    setLimpiezaStatus(null);
    setModelosEntrenados({ freelancers: false, resenas: false });
  };

  return (
    <AppContext.Provider value={{
      modelosEntrenados, setModelosEntrenados,
      fileFreelancers, setFileFreelancers,
      fileResenas, setFileResenas,
      previewFreelancers, setPreviewFreelancers,
      previewResenas, setPreviewResenas,
      limpiezaStatus, setLimpiezaStatus,
      resetFrontendStates
    }}>
      {children}
    </AppContext.Provider>
  );
};