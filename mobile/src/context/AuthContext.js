import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL, useLocalMock } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      console.log('Giriş işlemi başladı');
      console.log('Giriş isteği gönderiliyor:', `${API_URL}/mobile/auth/login`);
      
      // API sunucusu çalışıyor mu kontrol et
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sunucu bağlantılı zaman aşımı')), 5000)
        );
        const ping = axios.get(`${API_URL.split('/api')[0]}/health`, { timeout: 5000 });
        await Promise.race([ping, timeout]);
      } catch (pingError) {
        console.log('API sunucusu bağlantılı hatası:', pingError.message);
        setError('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        setIsLoading(false);
        return { success: false, error: 'Sunucu bağlantı hatası' };
      }
      
      // Giriş işlemi
      const response = await axios.post(`${API_URL}/mobile/auth/login`, {
        email,
        password
      }, { timeout: 30000 }); // 30 saniye timeout
      
      console.log('Sunucu yanıtı alındı:', response.status);
      
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
        
        return { success: true, user };
      } else {
        setError(response.data.message || 'Giriş başarısız');
        console.log('Giriş başarısız:', response.data);
        return { success: false, error: response.data.message || 'Giriş başarısız' };
      }
    } catch (error) {
      console.log('Login Error Details:', error);
      let errorMessage = 'Bilinmeyen bir hata oluştu';
      
      if (error.response) {
        // Sunucu yanıtı ile dönen hata (4xx, 5xx)
        console.log('Sunucu hata yanıtı:', error.response.status);
        console.log('Sunucu hata detayları:', JSON.stringify(error.response.data));
        
        // Hata kodlarına göre daha bilgilendirici mesajlar
        if (error.response.status === 401) {
          errorMessage = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
          setError(errorMessage);
        } else if (error.response.status === 404) {
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
          setError(errorMessage);
        } else {
          errorMessage = error.response.data?.message || `Sunucu hatası: ${error.response.status}`;
          setError(errorMessage);
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.log('Sunucudan yanıt alınamadı:', error.request);
        errorMessage = 'Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı ve sunucunun çalıştığını kontrol edin.';
        setError(errorMessage);
      } else {
        // İstek oluşturma sırasında hata
        console.log('İstek hatası:', error.message);
        
        if (error.message.includes('Network Error')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin. Ağa bağlı değilsiniz.';
          setError(errorMessage);
        } else {
          errorMessage = `İstek hatası: ${error.message}`;
          setError(errorMessage);
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Kayıt işlemi başladı');
      console.log('Kayıt isteği gönderiliyor:', `${API_URL}/mobile/auth/register`);
      
      // API sunucusu çalışıyor mu kontrol et
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sunucu bağlantı zaman aşımı')), 5000)
        );
        const ping = axios.get(`${API_URL.split('/api')[0]}/health`, { timeout: 5000 });
        await Promise.race([ping, timeout]);
      } catch (pingError) {
        console.log('API sunucusu bağlantı hatası:', pingError.message);
        const errorMsg = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
      
      // Frontend validasyonu - loglama amaçlı
      console.log('Frontend validasyonu');
      console.log('Email var mı:', !!userData.email);
      console.log('Password var mı:', !!userData.password);
      console.log('firstName var mı:', !!userData.firstName);
      console.log('lastName var mı:', !!userData.lastName);
      console.log('fullname var mı:', !!userData.fullname);
      
      // Gerekli alanlar kontrolü - her durum için ayrı mesaj
      if (!userData.email) {
        const errorMsg = 'E-posta adresi girmelisiniz';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
      
      if (!userData.password) {
        const errorMsg = 'Şifre girmelisiniz';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
      
      if (!userData.firstName || !userData.lastName) {
        const errorMsg = 'Ad ve Soyad alanlarını doldurmalısınız';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
      
      // E-posta doğrulama
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        const errorMsg = 'Lütfen geçerli bir e-posta adresi girin';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
      
      // Şifre güvenliği kontrolü
      if (userData.password.length < 6) {
        const errorMsg = 'Şifre en az 6 karakter olmalıdır';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      // Backend için veri formatını düzenle
      const backendData = {
        ...userData,
        // Arka uç fullname bekliyor olabilir - iki kez kontrol edelim
        fullname: userData.fullname || `${userData.firstName} ${userData.lastName}`
      };
      
      console.log('Backend\'e gönderilen son veri:', JSON.stringify(backendData));
      
      const response = await axios.post(
        `${API_URL}/mobile/auth/register`, 
        backendData,
        { 
          timeout: 20000, // Timeout süresini 20 saniyeye çıkaralım
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Sunucu yanıtı alındı:', response.status);
      
      if (response.data.status === 'success') {
        // Kayıt başarılı, ancak otomatik giriş yapmak yerine bir başarı mesajı dönüyoruz
        setSuccess('Kayıt işlemi başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz.');
        return { success: true, message: 'Kayıt başarılı' };
      } else {
        setError(response.data.message || 'Kayıt başarısız');
        return { success: false, error: response.data.message || 'Kayıt başarısız' };
      }
    } catch (error) {
      console.log('Register Error Details:', error);
      
      if (error.response) {
        // Sunucu yanıtı ile dönen hata (4xx, 5xx)
        console.log('Sunucu hata yanıtı:', error.response.status);
        console.log('Sunucu hata detayları:', JSON.stringify(error.response.data));
        
        // Hata kodlarına göre daha bilgilendirici mesajlar
        if (error.response.status === 409) {
          setError('Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta adresi deneyin.');
          return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta adresi deneyin.' };
        } else if (error.response.status === 400) {
          setError('Geçersiz kayıt bilgileri. Lütfen bilgilerinizi kontrol edin.');
          return { success: false, error: 'Geçersiz kayıt bilgileri. Lütfen bilgilerinizi kontrol edin.' };
        } else {
          setError(error.response.data?.message || `Sunucu hatası: ${error.response.status}`);
          return { success: false, error: error.response.data?.message || `Sunucu hatası: ${error.response.status}` };
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.log('Sunucudan yanıt alınamadı:', error.request);
        setError('Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı ve sunucunun çalıştığını kontrol edin.');
        return { success: false, error: 'Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı ve sunucunun çalıştığını kontrol edin.' };
      } else {
        // İstek oluşturma sırasında hata
        console.log('İstek hatası:', error.message);
        
        if (error.message.includes('Network Error')) {
          setError('İnternet bağlantınızı kontrol edin. Ağa bağlı değilsiniz.');
          return { success: false, error: 'İnternet bağlantınızı kontrol edin. Ağa bağlı değilsiniz.' };
        } else {
          setError(`İstek hatası: ${error.message}`);
          return { success: false, error: `İstek hatası: ${error.message}` };
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Çıkış işlemi başlatılıyor...');
    setIsLoading(true);
    
    try {
      // Cihaz ID'sini al
      const deviceInfo = await getDeviceInfo();
      console.log('Cihaz bilgileri alındı');
      
      // Çıkış yapıldığında cihazı devre dışı bırak (isteğe bağlı)
      if (userToken) {
        try {
          console.log('Cihaz kaydı siliniyor...');
          await axios.delete(`${API_URL}/mobile/devices/${deviceInfo.deviceId}`);
          console.log('Cihaz kaydı başarıyla silindi');
        } catch (error) {
          console.log('Cihaz devre dışı bırakma hatası:', error);
          // Bu hata kritik değil, devam ediyoruz
        }
      }
    } catch (error) {
      console.log('Çıkış hatası:', error);
      // Hata olsa bile devam etmeye çalışacağız
    } finally {
      try {
        console.log('Oturum verileri temizleniyor...');
        // Token'ı temizle
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        
        // Durum güncellemeleri
        setUserToken(null);
        setUser(null);
        setError(null);
        setSuccess(null);
        
        // API istekleri için Authorization header'ı temizle
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['deviceid'];
        
        console.log('Çıkış işlemi başarıyla tamamlandı');
      } catch (finalError) {
        console.log('Token temizleme hatası:', finalError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      console.log('isLoggedIn fonksiyonu çalıştırıldı');
      
      // SecureStore'dan token'ı al
      const token = await SecureStore.getItemAsync('userToken');
      console.log('Token kontrolü:', token ? 'Token var' : 'Token yok');
      
      const userData = await SecureStore.getItemAsync('userData');
      console.log('UserData kontrolü:', userData ? 'Kullanıcı verisi var' : 'Kullanıcı verisi yok');
      
      if (token) {
        try {
          // Cihaz bilgilerini al
          const deviceInfo = await getDeviceInfo();
          console.log('Cihaz bilgileri alındı:', deviceInfo.deviceId);
          
          // API isteği için header'ları ayarla
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.headers.common['deviceid'] = deviceInfo.deviceId;
          console.log('API headers ayarlandı');
          
          setUserToken(token);
          
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            console.log('Kullanıcı verileri yüklendi:', parsedUserData.email);
            setUser(parsedUserData);
          } else {
            console.log('Kullanıcı verisi bulunamadı ama token var');
          }
        } catch (error) {
          console.log('Token yükleme hatası (detay):', error.message);
          console.log('Tam hata:', JSON.stringify(error));
          
          // Token hatası varsa temizle
          console.log('Token hatası nedeniyle veriler temizleniyor');
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
          setUserToken(null);
          setUser(null);
        }
      } else {
        console.log('Token bulunamadı, oturum açılmamış');
      }
    } catch (error) {
      console.log('isLoggedIn genel hata:', error.message);
      console.log('Tam hata detayı:', JSON.stringify(error));
    } finally {
      // Bütün durumlarda yükleme durumunu kapat
      console.log('isLoggedIn tamamlandı, loading kapatılıyor');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Otomatik giriş kontrolünü devre dışı bırak, splash ekranlarını göstermek için
    setIsLoading(false);
    
    // Splash ekranı onboarding'i kontrol edecek ve oturum açma durumunu yönetecek
    // Bu nedenle buradaki otomatik giriş kontrolünü devre dışı bırakıyoruz
    
    /* Eski kod, devre dışı bırakıldı
    // Mock verileri kullanıyoruz, API kontrolünü atlıyoruz
    if (useLocalMock) {
      console.log('Mock veri modu aktif, API kontrolü atlanıyor');
      // Sadece yükleme durumunu kapatıyoruz
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Gerçek API kullanılacaksa normal işlem:
    setTimeout(() => {
      isLoggedIn().catch(() => {
        // Hatalar yakalandı ve işlem her durumda tamamlanıyor
        setIsLoading(false);
      });
      
      // En geç 5 saniye sonra her durumda yükleme durumunu durdur
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    }, 500);
    */
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
        error,
        success,
        setSuccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 