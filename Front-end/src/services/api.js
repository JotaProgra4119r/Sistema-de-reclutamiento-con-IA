import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const clusteringService = {
  // 1. Petición unificada para entrenar (Requisito 2 de tu compañero)
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

  // 4. Endpoints para la Vista 5 (Predicción/Clasificación)
  predecirFreelancer: async (datos) => {
    return await axios.post(`${API_BASE_URL}/predict/freelancers`, datos);
  },
  predecirResena: async (texto) => {
    return await axios.post(`${API_BASE_URL}/predict/resenas`, texto);
  }
};