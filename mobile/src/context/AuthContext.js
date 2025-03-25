import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const generateDeviceId = () => {
    // Gerçek uygulamada cihaz benzersiz kimliği oluşturmak için 
    // expo-device veya benzeri kütüphaneler kullanılmalıdır
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const getDeviceInfo = async () => {
    // SecureStore'dan cihaz ID'sini al, yoksa yeni oluştur ve kaydet
    let deviceId = await SecureStore.getItemAsync('deviceId');
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      await SecureStore.setItemAsync('deviceId', deviceId);
    }
    
    return {
      deviceId,
      deviceName: 'TakDrive Mobile App', // Gerçek uygulamada cihaz adı alınmalı
      deviceType: 'android', // veya 'ios', Platform API ile tespit edilebilir
      appVersion: '1.0.0',
      osVersion: 'Android 12', // Gerçek uygulamada işletim sistemi sürümü alınmalı
    };
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Giriş isteği gönderiliyor:', `${API_URL}/mobile/auth/login`);
      console.log('Giriş e-posta:', email);
      
      // Giriş işlemi
      const response = await axios.post(`${API_URL}/mobile/auth/login`, {
        email,
        password
      }, { timeout: 30000 }); // 30 saniye timeout
      
      console.log('Sunucu yanıtı:', JSON.stringify(response.data));
      
      if (response.data.status === 'success') {
        const { token, data } = response.data;
        const user = data?.user || {};
        
        // Token'i kaydet
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        
        // Cihaz kaydı
        const deviceInfo = await getDeviceInfo();
        
        // API isteği için token'ı ayarla
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['deviceid'] = deviceInfo.deviceId;
        
        // Cihazı kaydet
        try {
          await axios.post(`${API_URL}/mobile/devices/register`, deviceInfo);
          console.log('Cihaz kaydı başarılı');
        } catch (deviceError) {
          console.log('Cihaz kaydı hatası (kritik değil):', deviceError);
        }
        
        setUserToken(token);
        setUser(user);
      } else {
        setError(response.data.message || 'Giriş başarısız');
        console.log('Giriş başarısız:', response.data);
      }
    } catch (error) {
      console.log('Login Error Details:', error);
      
      if (error.response) {
        // Sunucu yanıtı ile dönen hata (4xx, 5xx)
        console.log('Sunucu hata yanıtı:', error.response.data);
        setError(error.response.data.message || `Sunucu hatası: ${error.response.status}`);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.log('Sunucudan yanıt alınamadı:', error.request);
        setError('Sunucudan yanıt alınamadı. İnternet bağlantınızı kontrol edin.');
      } else {
        // İstek oluşturma sırasında hata
        console.log('İstek hatası:', error.message);
        setError(`İstek hatası: ${error.message}`);
      }
    }
    
    setIsLoading(false);
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Kayıt isteği gönderiliyor:', `${API_URL}/mobile/auth/register`);
      console.log('Kayıt verileri:', userData);
      
      const response = await axios.post(
        `${API_URL}/mobile/auth/register`, 
        userData,
        { timeout: 20000 } // Timeout süresini 20 saniyeye çıkaralım
      );
      
      console.log('Sunucu yanıtı:', response.data);
      
      if (response.data.status === 'success') {
        // Kayıt başarılı, otomatik giriş
        await login(userData.email, userData.password);
      } else {
        setError(response.data.message || 'Kayıt başarısız');
      }
    } catch (error) {
      console.log('Register Error Details:', error);
      
      if (error.response) {
        // Sunucu yanıtı ile dönen hata (4xx, 5xx)
        console.log('Sunucu hata yanıtı:', error.response.data);
        setError(error.response.data.message || `Sunucu hatası: ${error.response.status}`);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.log('Sunucudan yanıt alınamadı:', error.request);
        setError('Sunucudan yanıt alınamadı. İnternet bağlantınızı kontrol edin.');
      } else {
        // İstek oluşturma sırasında hata
        console.log('İstek hatası:', error.message);
        setError(`İstek hatası: ${error.message}`);
      }
    }
    
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Cihaz ID'sini al
      const deviceInfo = await getDeviceInfo();
      
      // Çıkış yapıldığında cihazı devre dışı bırak (isteğe bağlı)
      if (userToken) {
        try {
          await axios.delete(`${API_URL}/mobile/devices/${deviceInfo.deviceId}`);
        } catch (error) {
          console.log('Device deactivation error:', error);
        }
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Token'ı temizle
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      
      // Durum güncellemeleri
      setUserToken(null);
      setUser(null);
      
      // API istekleri için Authorization header'ı temizle
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['deviceid'];
      
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // SecureStore'dan token'ı al
      const token = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');
      
      if (token) {
        // Cihaz bilgilerini al
        const deviceInfo = await getDeviceInfo();
        
        // API isteği için header'ları ayarla
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['deviceid'] = deviceInfo.deviceId;
        
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('isLoggedIn error:', error);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        register, 
        logout, 
        isLoading, 
        userToken, 
        user, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 