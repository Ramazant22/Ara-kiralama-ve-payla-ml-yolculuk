import axios from 'axios';

// API için temel URL'yi yapılandırma
const API = axios.create({
  baseURL: 'http://localhost:3003/api',  // Backend API adresi doğru olduğundan emin olun
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // CORS için cookie desteğini açalım
  timeout: 30000 // Zaman aşımını 30 saniyeye çıkaralım
});

// İstek gönderilmeden önce çalışacak interceptor
API.interceptors.request.use(
  (config) => {
    console.log("API İsteği Gönderiliyor:", config.url, config.method);
    // Token'ı localStorage'dan alma ve isteğe ekleme
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API İstek Hatası:", error);
    return Promise.reject(error);
  }
);

// Yanıt alındıktan sonra çalışacak interceptor
API.interceptors.response.use(
  (response) => {
    console.log("API Yanıtı Alındı:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Yanıt Hatası:", error.message);
    if (error.response) {
      console.error("Durum:", error.response.status);
      console.error("Veri:", error.response.data);
    } else if (error.request) {
      console.error("Yanıt Alınamadı:", error.request);
    }
    
    // 401 Unauthorized hatası gelirse kullanıcıyı giriş sayfasına yönlendirme
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/giris';
    }
    return Promise.reject(error);
  }
);

export default API; 