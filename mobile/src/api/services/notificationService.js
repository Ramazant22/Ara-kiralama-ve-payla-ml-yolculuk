import apiClient from '../config/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Cihazı push bildirimleri için kaydeder
 * @returns {Promise<Object>} Kayıt sonucu
 */
const registerForPushNotifications = async () => {
  try {
    // Önce izinleri kontrol et
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // İzin yoksa, izin iste
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Hala izin yoksa, hata fırlat
    if (finalStatus !== 'granted') {
      throw new Error('Bildirim izni verilmedi!');
    }
    
    // Expo push token'ı al
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    // Token'ı API'ye kaydet
    const device = {
      token,
      platform: Platform.OS,
      deviceName: Constants.deviceName || 'Unknown Device',
    };
    
    const response = await apiClient.post('/notifications/devices', device);
    
    // Başarılı olursa token'ı local storage'a kaydet
    await AsyncStorage.setItem('pushToken', token);
    await AsyncStorage.setItem('deviceId', response.data.deviceId);
    
    return response.data;
  } catch (error) {
    console.error('Push bildirimleri için cihaz kaydedilirken hata:', error);
    throw error;
  }
};

/**
 * Bildirim ayarlarını getirir
 * @returns {Promise<Object>} Bildirim ayarları
 */
const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  } catch (error) {
    console.error('Bildirim ayarları alınırken hata:', error);
    throw error;
  }
};

/**
 * Bildirim ayarlarını günceller
 * @param {Object} settings - Güncellenecek ayarlar
 * @returns {Promise<Object>} Güncelleme sonucu
 */
const updateNotificationSettings = async (settings) => {
  try {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Bildirim ayarları güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri getirir
 * @param {Object} options - Sayfalama ve filtreleme seçenekleri
 * @returns {Promise<Object>} Bildirimler listesi
 */
const getNotifications = async (options = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params: options });
    return response.data;
  } catch (error) {
    console.error('Bildirimler alınırken hata:', error);
    throw error;
  }
};

/**
 * Bildirimi okundu olarak işaretler
 * @param {string} notificationId - Bildirim ID'si
 * @returns {Promise<Object>} İşlem sonucu
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri okundu olarak işaretler
 * @returns {Promise<Object>} İşlem sonucu
 */
const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};

/**
 * Bildirimi siler
 * @param {string} notificationId - Bildirim ID'si
 * @returns {Promise<Object>} İşlem sonucu
 */
const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Bildirim silinirken hata:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri siler
 * @returns {Promise<Object>} İşlem sonucu
 */
const deleteAllNotifications = async () => {
  try {
    const response = await apiClient.delete('/notifications');
    return response.data;
  } catch (error) {
    console.error('Tüm bildirimler silinirken hata:', error);
    throw error;
  }
};

/**
 * Bildirim aboneliğini kaldırır
 * @returns {Promise<Object>} İşlem sonucu
 */
const unsubscribeFromPushNotifications = async () => {
  try {
    const deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      throw new Error('Cihaz ID\'si bulunamadı!');
    }
    
    const response = await apiClient.delete(`/notifications/devices/${deviceId}`);
    
    // Başarılı olursa token ve deviceId'yi sil
    await AsyncStorage.removeItem('pushToken');
    await AsyncStorage.removeItem('deviceId');
    
    return response.data;
  } catch (error) {
    console.error('Push bildirimlerinden çıkılırken hata:', error);
    throw error;
  }
};

// Yerel bildirim ayarları için fonksiyonlar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Yerel bildirim gösterir
 * @param {Object} notification - Bildirim içeriği
 * @returns {Promise<string>} Bildirim ID'si
 */
const showLocalNotification = async (notification) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger: null, // Anında göster
    });
    return id;
  } catch (error) {
    console.error('Yerel bildirim gösterilirken hata:', error);
    throw error;
  }
};

export default {
  registerForPushNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  unsubscribeFromPushNotifications,
  showLocalNotification
}; 