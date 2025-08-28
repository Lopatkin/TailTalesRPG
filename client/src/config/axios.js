import axios from 'axios';

// Настройка базового URL для всех API запросов через переменную окружения
const API_URL = process.env.REACT_APP_API_URL || 'https://tailtalesrpg.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default api;
export { API_URL };
