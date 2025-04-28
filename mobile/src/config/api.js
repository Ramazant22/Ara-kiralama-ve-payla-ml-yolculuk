import { Platform } from 'react-native';

// Mock API kullanımını etkinleştirmek için bu değeri değiştirin
export const useLocalMock = false;

// Platform'a göre otomatik API URL seçimi
const getApiUrl = () => {
  if (useLocalMock) {
    // Mock API kullanımı için yerel URL
    return 'http://localhost:3003/api';
  }
  
  if (Platform.OS === 'android') {
    if (__DEV__) {
      // Android Emülatör dev modu
      return 'http://10.0.2.2:3003/api';
    } else {
      // Gerçek Android cihaz
      return 'http://192.168.1.100:3003/api'; // Kendi IP adresinizi girin
    }
  } else if (Platform.OS === 'ios') {
    if (__DEV__) {
      // iOS Simulator dev modu
      return 'http://localhost:3003/api';
    } else {
      // Gerçek iOS cihaz
      return 'http://192.168.1.100:3003/api'; // Kendi IP adresinizi girin
    }
  }
  // Varsayılan değer
  return 'http://192.168.1.100:3003/api'; // Kendi IP adresinizi girin
};

// API URL
export const API_URL = getApiUrl();

// API Timeout süresi (milisaniye)
export const API_TIMEOUT = 30000; // 30 saniye timeout

// HTTP İstek Yapılandırmaları
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Offline durumu kontrol etmek için yardımcı fonksiyon
export const isOffline = (error) => {
  return !error.response && !error.request && error.message === 'Network Error';
};
