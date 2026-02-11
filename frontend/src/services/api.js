import axios from "axios";

const BACKEND_URL = "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

export const apiService = {
  getStatus: async () => {
    const response = await axios.get(`${API}/status`);
    return response.data;
  },

  getNPKPredictions: async () => {
    const response = await axios.get(`${API}/npk-predictions`);
    return response.data;
  },

  getWaterloggingRisk: async () => {
    const response = await axios.get(`${API}/waterlogging-risk`);
    return response.data;
  },

  getHistory: async (parameter, days = 7) => {
    const response = await axios.get(`${API}/history?parameter=${parameter}&days=${days}`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await axios.get(`${API}/alerts`);
    return response.data;
  },

  getFertilizationHistory: async () => {
    const response = await axios.get(`${API}/fertilization-history`);
    return response.data;
  },

  getIrrigationPredictions: async () => {
    const response = await axios.get(`${API}/irrigation-predictions`);
    return response.data;
  },

  getIrrigationHistory: async (days = 30) => {
    const response = await axios.get(`${API}/irrigation-history?days=${days}`);
    return response.data;
  },

  logIrrigation: async (data) => {
    const response = await axios.post(`${API}/irrigation/log`, data);
    return response.data;
  },

  getPhPredictions: async () => {
    const response = await axios.get(`${API}/ph-predictions`);
    return response.data;
  },

  getPhHistory: async (days = 90) => {
    const response = await axios.get(`${API}/ph-history?days=${days}`);
    return response.data;
  },
};
