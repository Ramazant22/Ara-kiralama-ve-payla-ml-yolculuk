import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/database';

// Axios client'ı oluştur
const apiClient = axios.create(apiConfig);

// İstek öncesi interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // AsyncStorage'dan token al
      const token = await AsyncStorage.getItem('authToken');
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      // Eğer token varsa, istek header'ına ekle
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Cihaz kimliği ekle (varsa)
      if (deviceId) {
        config.headers['deviceid'] = deviceId;
      }
      
      return config;
    } catch (error) {
      console.error('API istek interceptor hatası:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor - yenileme token işlemi, hata işleme vb.
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Token süresi dolduysa ve bu ilk yenileme denemesiyse
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // RefreshToken ile yeni token al
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${apiConfig.baseURL}/auth/refresh-token`, {
            refreshToken
          });
          
          // Yeni tokenları storage'a kaydet
          if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
            
            if (response.data.refreshToken) {
              await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Orijinal isteği yeni token ile tekrarla
            originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token yenileme hatası:', refreshError);
        
        // Token yenileme başarısız olduğunda kullanıcıyı logout etmek için event yayınla
        // EventEmitter.emit('authLogout');
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 