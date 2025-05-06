import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context oluşturma
const ThemeContext = createContext();

// Tema değerleri
const lightTheme = {
  isDarkMode: false,
  primary: '#FF4500', // Turuncu
  background: '#F8F9FA', // Açık gri
  cardBackground: '#FFFFFF', // Beyaz
  text: '#212529', // Koyu gri - siyah
  textSecondaryColor: '#6C757D', // Gri
  success: '#28A745', // Yeşil
  danger: '#DC3545', // Kırmızı
  info: '#17A2B8', // Mavi
  warning: '#FFC107', // Sarı
  borderColor: '#DEE2E6', // Açık gri
};

const darkTheme = {
  isDarkMode: true,
  primary: '#FF4500', // Turuncu
  background: '#121212', // Koyu arka plan
  cardBackground: '#1E1E1E', // Kart arka planı
  text: '#FFFFFF', // Beyaz
  textSecondaryColor: '#AAAAAA', // Gri
  success: '#28A745', // Yeşil
  danger: '#DC3545', // Kırmızı
  info: '#17A2B8', // Mavi
  warning: '#FFC107', // Sarı
  borderColor: '#2C2C2C', // Koyu gri
};

// ThemeProvider bileşeni
export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme(); // 'light' veya 'dark'
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Temayı AsyncStorage'a kaydetme
  const setMode = async (mode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
      setIsDarkMode(mode === 'dark');
      setTheme(mode === 'dark' ? darkTheme : lightTheme);
    } catch (error) {
      console.log('Theme save error:', error);
    }
  };

  // Temayı değiştirme fonksiyonu
  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setMode(newMode);
  };

  // İlk yükleme sırasında kaydedilmiş temayı yükleme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
          setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
        } else {
          // Kaydedilmiş tema yoksa, cihazın temasını kullan
          setIsDarkMode(deviceTheme === 'dark');
          setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.log('Theme load error:', error);
        // Hata durumunda varsayılan temayı kullan
        setIsDarkMode(deviceTheme === 'dark');
        setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        isLoading,
      }}
    >
      {!isLoading && children}
    </ThemeContext.Provider>
  );
};

// useTheme hook'u
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 