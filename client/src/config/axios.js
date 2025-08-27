import axios from 'axios';

// Настройка базового URL для всех API запросов
const api = axios.create({
  baseURL: 'https://tailtalesrpg.onrender.com',
  timeout: 10000,
});

export default api;
