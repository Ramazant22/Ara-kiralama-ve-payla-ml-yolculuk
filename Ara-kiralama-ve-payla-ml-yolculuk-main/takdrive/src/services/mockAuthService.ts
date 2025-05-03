import React from 'react';
// Kullanıcı kaydı için tür tanımı
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Giriş verisi için tür tanımı
interface LoginData {
  email: string;
  password: string;
}

// Kullanıcı bilgileri için tür tanımı
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

// Mock Authentication servisi - gerçek API yerine kullanılacak
class MockAuthService {
  // Kullanıcı kaydı
  register = async (userData: RegisterData) => {
    // API isteği simülasyonu (1 saniye bekletme)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Artık test@test.com kontrolü yapmıyoruz - her e-posta kabul edilecek
    
    // Başarılı kayıt simülasyonu
    return {
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi.',
      user: {
        id: 'mock-id-123',
        ...userData,
        createdAt: new Date().toISOString()
      }
    };
  };

  // Kullanıcı girişi
  login = async (loginData: LoginData) => {
    // API isteği simülasyonu (1 saniye bekletme)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Giriş bilgilerini kontrol et - YENİ GİRİŞ BİLGİLERİ
    if (loginData.email === 'deneme56@gmail.com' && loginData.password === '89562374') {
      // Başarılı giriş simülasyonu
      const user = {
        id: 'mock-id-123',
        firstName: 'Test',
        lastName: 'User',
        email: loginData.email,
        phoneNumber: '05551234567',
        createdAt: new Date().toISOString()
      };
      
      // Token ve kullanıcı bilgilerini localStorage'a kaydetme
      const token = 'mock-jwt-token-xyz';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        message: 'Giriş başarılı.',
        token,
        user
      };
    } else {
      // Başarısız giriş simülasyonu
      throw new Error('Geçersiz e-posta veya şifre.');
    }
  };

  // Çıkış yapma
  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Mevcut kullanıcıyı getirme
  getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  // Token'ı getirme
  getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // Kullanıcı giriş yapmış mı kontrolü
  isLoggedIn = (): boolean => {
    return this.getToken() !== null;
  };
}

export default new MockAuthService(); 