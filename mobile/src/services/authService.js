import api from './api';

export const authService = {
  // Kullanıcı girişi
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Mevcut kullanıcı bilgileri
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Şifre değiştirme
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Şifremi unuttum
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Profil güncelleme
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Çıkış
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};