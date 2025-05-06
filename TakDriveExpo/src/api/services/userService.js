import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cacheService from '../config/cacheService';

// Kullanıcı profili bilgilerini getir
const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/mobile/users/me');
    
    // Kullanıcı bilgilerini güncelle
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Profil bilgilerini getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Profil bilgilerini güncelle
const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.patch('/mobile/users/update-me', profileData);
    
    // Güncellenen kullanıcı bilgilerini kaydet
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Profil güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Profil fotoğrafını güncelle
const updateProfilePicture = async (formData) => {
  try {
    // FormData için özel header kullan
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    
    const response = await apiClient.post('/mobile/users/profile-picture', formData, config);
    
    // Güncellenen fotoğraf URL'ini içeren kullanıcı verisini kaydet
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Profil fotoğrafı güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Doğrulama belgesi yükle
const uploadVerificationDocument = async (documentType, formData) => {
  try {
    // FormData için özel header kullan
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    
    const response = await apiClient.post(`/mobile/verifications/upload/${documentType}`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Doğrulama belgesi yükleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Doğrulama durumunu kontrol et
const getVerificationStatus = async () => {
  try {
    const response = await apiClient.get('/mobile/verifications/status');
    return response.data;
  } catch (error) {
    console.error('Doğrulama durumu kontrol hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Cihaz kaydet
const registerDevice = async (deviceInfo) => {
  try {
    const response = await apiClient.post('/mobile/devices/register', deviceInfo);
    
    // Cihaz ID'sini kaydet
    if (response.data && response.data.deviceId) {
      await AsyncStorage.setItem('deviceId', response.data.deviceId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Cihaz kayıt hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Bildirim token güncelle
const updatePushToken = async (token) => {
  try {
    const deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      throw new Error('Cihaz ID bulunamadı');
    }
    
    const response = await apiClient.put('/mobile/devices/push-token', {
      deviceId,
      pushToken: token
    });
    
    return response.data;
  } catch (error) {
    console.error('Push token güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kullanıcı hesabını sil
const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/mobile/users/delete-me');
    
    // Yerel depolamayı temizle
    await AsyncStorage.clear();
    
    return response.data;
  } catch (error) {
    console.error('Hesap silme hatası:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * İnternet bağlantısı geldiğinde bekleyen profil güncelleme işlemlerini gerçekleştirir
 * @returns {Promise<{success: boolean}>}
 */
const processPendingProfileUpdates = async () => {
  try {
    const pendingKey = 'pending_profile_updates';
    
    // Bekleyen profil güncelleme işlemlerini işle
    await cacheService.processPendingRequests(pendingKey, async (requestData) => {
      const { action, data } = requestData;
      
      switch (action) {
        case 'updateProfile':
          await updateUserProfile(data);
          break;
        case 'updateProfilePicture':
          // FormData özellikle işlenmeli
          const formData = new FormData();
          formData.append('profilePicture', {
            uri: data.uri,
            type: data.type || 'image/jpeg',
            name: data.fileName || 'profile.jpg'
          });
          await updateProfilePicture(formData);
          break;
        case 'uploadDocument':
          // Doküman yükleme işlemi
          const documentData = new FormData();
          documentData.append('document', {
            uri: data.uri,
            type: data.type,
            name: data.fileName
          });
          documentData.append('documentType', data.documentType);
          await uploadVerificationDocument(documentData);
          break;
        default:
          console.warn('Bilinmeyen profil işlemi:', action);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bekleyen profil işlemleri hatası:', error);
    throw error;
  }
};

/**
 * Çevrimdışı durumda bir profil işlemini bekleyen işlemlere ekler
 * @param {string} action - İşlem tipi ('updateProfile', 'updateProfilePicture', 'uploadDocument')
 * @param {Object} data - İşlem verileri
 * @returns {Promise<void>}
 */
const addPendingProfileUpdate = async (action, data) => {
  const pendingKey = 'pending_profile_updates';
  await cacheService.addPendingRequest(pendingKey, { action, data });
};

export default {
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  uploadVerificationDocument,
  getVerificationStatus,
  registerDevice,
  updatePushToken,
  deleteAccount,
  processPendingProfileUpdates,
  addPendingProfileUpdate
}; 