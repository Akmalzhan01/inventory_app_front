import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://inventory-app-theta-two.vercel.app',
  timeout: 100000,
});

// Har bir so'rovdan oldin token qo'shish
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Har bir javobni tekshirish
instance.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'https://inventory-app-front.netlify.app/login';
  }
  return Promise.reject(error);
});

export default instance;
