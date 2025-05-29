import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend server URL - Expo için bilgisayarın IP adresi kullanılmalı
// localhost yerine 192.168.x.x veya 10.0.2.2 (Android emulator) kullanın
const BASE_URL = __DEV__ 
  ? 'http://192.168.137.21:5000/api'  // Geliştirme - güncel IP adresi
  : 'https://your-production-api.com/api'; // Production

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - token eklemek için
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - token süresi dolduğunda logout yapmak için
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API Response Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Navigation veya state güncelleme burada yapılabilir
    }
    
    // Network error kontrolü
    if (!error.response) {
      console.log('Network Error - Backend bağlantısı kurulamadı');
    }
    
    return Promise.reject(error);
  }
);

export default api; 