import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8000/api'
    : '/api');

export const clusteringService = {
  // 1. Petición unificada para entrenar
  entrenarModelo: async (payload) => {
    return await axios.post(`${API_BASE_URL}/cluster`, payload);
  },

  // 2. Endpoints para la Vista 3 (Interpretación)
  getStatsFreelancers: async () => {
    return await axios.get(`${API_BASE_URL}/stats/freelancers`);
  },
  getStatsResenas: async () => {
    return await axios.get(`${API_BASE_URL}/stats/resenas`);
  },

  // 3. Endpoints para la Vista 4 (Evaluación)
  getEvaluacionFreelancers: async () => {
    return await axios.get(`${API_BASE_URL}/evaluacion/freelancers`);
  },
  getEvaluacionResenas: async () => {
    return await axios.get(`${API_BASE_URL}/evaluacion/resenas`);
  },

  // 4. Endpoints para la Vista 5 (Predicción/Clasificación en tiempo real)
  predecirFreelancer: async (datos) => {
    return await axios.post(`${API_BASE_URL}/predict/freelancers`, datos);
  },
  predecirResena: async (texto) => {
    return await axios.post(`${API_BASE_URL}/predict/resenas`, texto);
  },

  // 5. Diccionario e información de interpretabilidad de clústeres
  getClusterInfo: async () => {
    return await axios.get(`${API_BASE_URL}/clusters/info`);
  }
};

export const hrService = {
  // Endpoints para Base de Datos Relacional SQL y Archivos Planos
  getCandidatos: async () => {
    return await axios.get(`${API_BASE_URL}/hr/candidatos`);
  },
  getCandidatoById: async (id) => {
    return await axios.get(`${API_BASE_URL}/hr/candidatos/${id}`);
  },
  crearCandidato: async (candidatoData) => {
    return await axios.post(`${API_BASE_URL}/hr/candidatos`, candidatoData);
  },
  eliminarCandidato: async (id) => {
    return await axios.delete(`${API_BASE_URL}/hr/candidatos/${id}`);
  },
  predecirCandidatoSQL: async (id) => {
    return await axios.post(`${API_BASE_URL}/hr/candidatos/${id}/predict`);
  },
  sincronizarSQLConML: async () => {
    return await axios.post(`${API_BASE_URL}/hr/sync-to-ml`);
  },
  getFlatFilesStatus: async () => {
    return await axios.get(`${API_BASE_URL}/hr/flat-files-status`);
  },
  syncFlatFiles: async () => {
    return await axios.post(`${API_BASE_URL}/hr/sync-flat-files`);
  }
};