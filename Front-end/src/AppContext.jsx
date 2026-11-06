import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [modelosEntrenados, setModelosEntrenados] = useState({
    freelancers: true,
    resenas: true
  });

  const [fileFreelancers, setFileFreelancers] = useState(null);
  const [fileResenas, setFileResenas] = useState(null);
  
  const [previewFreelancers, setPreviewFreelancers] = useState({ headers: [], rows: [] });
  const [previewResenas, setPreviewResenas] = useState({ headers: [], rows: [] });
  
  const [limpiezaStatus, setLimpiezaStatus] = useState(null);

  // Sincronización automática con el estado real del servidor backend de RRHH
  useEffect(() => {
    const verificarEstadoServidor = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status`);
        if (res.data && res.data.modelos_entrenados) {
          setModelosEntrenados({
            freelancers: Boolean(res.data.modelos_entrenados.freelancers),
            resenas: Boolean(res.data.modelos_entrenados.resenas)
          });
        }
      } catch (err) {
        console.log("Servidor backend iniciando o no disponible aún.");
      }
    };

    verificarEstadoServidor();
  }, []);

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