import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kullanıcı kaydı
const register = async (userData) => {
  try {
    // Gerçek API çağrısı yapılıyor
    const response = await apiClient.post('/auth/register', userData);
    
    // Kayıt başarılı ise token'ları kaydet
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Kullanıcı verilerini kaydet
      if (response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      console.log('Kullanıcı kayıt başarılı:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Kayıt hatası:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Giriş işlemi
const login = async (email, password) => {
  try {
    // Gerçek API isteği
    const response = await apiClient.post('/auth/login', { email, password });
    
    // Token'ları ve kullanıcı bilgilerini kaydet
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Kullanıcı verilerini kaydet
      if (response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Çıkış işlemi
const logout = async () => {
  try {
    // İsteğe bağlı olarak backend'e bildirim
    // await apiClient.post('/mobile/auth/logout');
    
    // Local storage temizle
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userData');
    
    return { success: true };
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

// Token yenileme
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('Refresh token bulunamadı');
    }
    
    const response = await apiClient.post('/mobile/auth/refresh-token', { refreshToken });
    
    // Yeni token'ları kaydet
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Token yenileme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Şifre sıfırlama isteği
const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/mobile/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Şifre sıfırlama kodu doğrulama ve yeni şifre belirleme
const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.patch(`/mobile/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Şifre güncelleme (giriş yapmış kullanıcı için)
const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.patch('/mobile/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Auth durumunu kontrol et
const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token; // Boolean olarak dönüş - token varsa true, yoksa false
  } catch (error) {
    console.error('Auth durumu kontrol hatası:', error);
    return false;
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  checkAuthStatus
}; 