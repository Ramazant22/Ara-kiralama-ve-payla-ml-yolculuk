import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../api/services/authService';
import userService from '../api/services/userService';

// Context oluşturma
export const AuthContext = createContext();

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Uygulama başladığında auth durumunu kontrol et
    const loadUserData = async () => {
      try {
        // Önce AsyncStorage'dan token kontrolü yap
        const isAuth = await authService.checkAuthStatus();
        
        if (isAuth) {
          // Oturum açılmış durumda, kullanıcı bilgilerini al
          const userDataJSON = await AsyncStorage.getItem('userData');
          if (userDataJSON) {
            const userData = JSON.parse(userDataJSON);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token var ama kullanıcı verisi yok, API'den kullanıcı verisini çek
            try {
              const response = await userService.getUserProfile();
              if (response.user) {
                setUser(response.user);
                await AsyncStorage.setItem('userData', JSON.stringify(response.user));
                setIsAuthenticated(true);
              }
            } catch (error) {
              console.error('Kullanıcı bilgisi alınamadı:', error);
              await logout(); // Hata durumunda çıkış yap
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth durumu yüklenirken hata:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Login işlemi
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt işlemi
  const register = async (firstName, lastName, email, password, phoneNumber, skipVerification = false) => {
    setIsLoading(true);
    try {
      // Tam ad ve soyadını ayrı olarak göndermek için userData nesnesini oluştur
      const userData = {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        skipVerification
      };
      
      const response = await authService.register(userData);
      
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış işlemi
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı bilgilerini güncelle
  const updateUserData = async (userData) => {
    try {
      const response = await userService.updateUserProfile(userData);
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      throw error;
    }
  };

  // Profil bilgilerini yenile
  const refreshUserData = async () => {
    try {
      const response = await userService.getUserProfile();
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Profil yenileme hatası:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUserData,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;