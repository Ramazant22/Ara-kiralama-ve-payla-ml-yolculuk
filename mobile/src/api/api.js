import axios from 'axios';
import { getData } from './storage';

// API'nin temel URL'si
const BASE_URL = 'http://localhost:5000/api';

// Axios örneğini oluştur
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// İstek göndermeden önce token kontrolü
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getData('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Token eklenirken hata:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt işleme
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Oturum süresi dolmuşsa veya token geçersizse
    if (error.response && error.response.status === 401) {
      // Token yenileme veya çıkış işlemleri burada yapılabilir
      console.log('Oturum süresi doldu veya yetkilendirme hatası');
      
      // Event bus veya Context API ile uygulama genelinde bir oturum süresi doldu bildirimi gönderilebilir
      // Örnek: EventBus.emit('AUTH_ERROR', { message: 'Oturum süresi doldu' });
    }
    
    return Promise.reject(error);
  }
);

export default api; 