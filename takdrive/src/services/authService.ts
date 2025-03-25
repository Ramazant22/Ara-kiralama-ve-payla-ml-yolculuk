import API from './api';

// Kullanıcı için tür tanımı
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

// Giriş verileri için tür tanımı
interface LoginData {
  email: string;
  password: string;
}

// Kayıt verileri için tür tanımı
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

/**
 * Kimlik doğrulama servisi - API ile iletişim kuran metotları içerir
 */
class AuthService {
  /**
   * Kullanıcı kaydı yapar
   * @param userData - Kayıt için gerekli kullanıcı bilgileri
   * @returns API yanıtı
   */
  register = async (userData: RegisterData) => {
    try {
      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await API.post('/auth/register', userData);
      console.log('Kayıt başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  /**
   * Kullanıcı girişi yapar
   * @param loginData - Giriş için gerekli bilgiler
   * @returns API yanıtı
   */
  login = async (loginData: LoginData) => {
    try {
      console.log('Giriş isteği gönderiliyor:', loginData);
      const response = await API.post('/auth/login', loginData);
      console.log('Giriş başarılı:', response.data);
      
      if (response.data.token) {
        // Token ve kullanıcı verilerini localStorage'a kaydet
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  /**
   * Oturumu kapatır
   */
  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Mevcut kullanıcıyı döndürür
   * @returns Oturum açmış kullanıcı veya null
   */
  getCurrentUser = (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error);
      this.logout(); // Geçersiz veri durumunda oturumu kapat
      return null;
    }
  };

  /**
   * JWT token'i döndürür
   * @returns Token veya null
   */
  getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  /**
   * Kullanıcının oturum açıp açmadığını kontrol eder
   * @returns Oturum durumu
   */
  isLoggedIn = (): boolean => {
    return this.getToken() !== null;
  };
}

export default new AuthService(); 