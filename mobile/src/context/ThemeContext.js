import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Tema renkleri
const lightTheme = {
  primary: '#FFFFFF',      // Beyaz - Ana marka rengi
  secondary: '#D3D3D3',    // Açık Gri (Kristal Beyaz tonu)
  accent: '#E0E0E0',       // Vurgu rengi (açık gri)
  success: '#22C55E',      // Başarı (yeşil)
  danger: '#EF4444',       // Tehlike (kırmızı)
  warning: '#F59E0B',      // Uyarı (turuncu)
  info: '#E0E0E0',         // Bilgi (açık gri)
  
  // Temel renkler
  black: '#000000',        // Siyah 
  white: '#FFFFFF',        // Beyaz
  transparent: 'transparent', // Şeffaf (favicon/ikonlar için)
  
  // Gri tonları
  background: '#000000',   // Arka plan - Siyah
  card: '#1A1A1A',         // Kart arka planı - Koyu gri
  surface: '#121212',      // Yüzey rengi - Koyu yüzey
  border: '#333333',       // Kenarlık rengi - Koyu gri
  divider: '#2C2C2C',      // Ayraç çizgisi - Koyu gri
  
  // Metin renkleri
  text: {
    primary: '#FFFFFF',    // Ana metin rengi - Beyaz
    secondary: '#CCCCCC',  // İkincil metin rengi - Açık gri
    disabled: '#999999',   // Devre dışı metin - Orta gri
    inverse: '#000000',    // Ters metin (açık arka plan için) - Siyah
  },
  
  // Durum renkleri
  states: {
    active: 'rgba(255, 255, 255, 0.15)',   // Aktif durumu (beyaz)
    hover: 'rgba(255, 255, 255, 0.1)',     // Hover durumu
    pressed: 'rgba(255, 255, 255, 0.2)',   // Basılı durumu
  },
  
  // Gölgeler
  shadow: {
    color: '#FFF',
    opacity: 0.1,
  },
  
  // İndikatörler
  indicator: {
    online: '#22C55E',     // Çevrimiçi (yeşil)
    offline: '#999999',    // Çevrimdışı (gri)
    busy: '#EF4444',       // Meşgul (kırmızı)
  }
};

// Koyu tema - Şu an için kullanılmıyor ama gelecekte eklenebilir
const darkTheme = {
  primary: '#FFFFFF',      // Beyaz - Ana marka rengi
  secondary: '#D3D3D3',    // Açık Gri (Kristal Beyaz tonu)
  accent: '#E0E0E0',       // Vurgu rengi (açık gri)
  success: '#22C55E',      // Başarı (yeşil)
  danger: '#EF4444',       // Tehlike (kırmızı)
  warning: '#F59E0B',      // Uyarı (turuncu)
  info: '#E0E0E0',         // Bilgi (açık gri)

  // Temel renkler
  black: '#000000',        // Siyah
  white: '#FFFFFF',        // Beyaz
  transparent: 'transparent', // Şeffaf (favicon/ikonlar için)

  // Gri tonları
  background: '#000000',   // Arka plan - Siyah
  card: '#1A1A1A',         // Kart arka planı - Koyu gri
  surface: '#121212',      // Yüzey rengi - Koyu yüzey
  border: '#333333',       // Kenarlık rengi - Koyu gri
  divider: '#2C2C2C',      // Ayraç çizgisi - Koyu gri
  
  // Metin renkleri
  text: {
    primary: '#FFFFFF',    // Ana metin rengi - Beyaz
    secondary: '#CCCCCC',  // İkincil metin rengi - Açık gri
    disabled: '#999999',   // Devre dışı metin - Orta gri
    inverse: '#000000',    // Ters metin (açık arka plan için) - Siyah
  },
  
  // Durum renkleri
  states: {
    active: 'rgba(255, 255, 255, 0.15)',   // Aktif durumu (beyaz)
    hover: 'rgba(255, 255, 255, 0.1)',     // Hover durumu
    pressed: 'rgba(255, 255, 255, 0.2)',   // Basılı durumu
  },
  
  // Gölgeler
  shadow: {
    color: '#FFF',
    opacity: 0.1,
  },
  
  // İndikatörler
  indicator: {
    online: '#22C55E',     // Çevrimiçi (yeşil)
    offline: '#999999',    // Çevrimdışı (gri)
    busy: '#EF4444',       // Meşgul (kırmızı)
  }
};

// Tipografi
const typography = {
  // Font aileleri
  fontFamily: {
    regular: 'System',  // iOS için San Francisco, Android için Roboto
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font boyutları
  fontSize: {
    xs: 12,       // Çok küçük metin
    sm: 14,       // Küçük metin
    base: 16,     // Temel metin
    lg: 18,       // Büyük metin
    xl: 20,       // Çok büyük metin
    '2xl': 24,    // Başlık 2
    '3xl': 30,    // Başlık 1
  },
  
  // Font ağırlıkları
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Satır yükseklikleri
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Boşluk ve boyutlar
const spacing = {
  xs: 4,    // Çok küçük aralık
  sm: 8,    // Küçük aralık
  md: 16,   // Orta aralık
  lg: 24,   // Büyük aralık
  xl: 32,   // Çok büyük aralık
  '2xl': 48 // Ultra büyük aralık
};

// Yuvarlatılmış kenarlar
const borderRadius = {
  none: 0,
  sm: 4,      // Küçük yuvarlatma
  md: 8,      // Orta yuvarlatma
  lg: 12,     // Büyük yuvarlatma
  xl: 16,     // Çok büyük yuvarlatma
  '2xl': 24,  // Ultra büyük yuvarlatma
  full: 9999  // Tam yuvarlatma (butonlar için)
};

// Tema bağlamı oluşturma
export const ThemeContext = createContext();

// Tema kancası
export const useTheme = () => useContext(ThemeContext);

// Tema sağlayıcısı
export const ThemeProvider = ({ children }) => {
  // Sistem teması (şu an için sadece light kullanılıyor)
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  
  // Tam tema nesnesi
  const themeObject = {
    ...(theme === 'dark' ? darkTheme : lightTheme),
    typography,
    spacing,
    borderRadius,
    // Tema değiştirme fonksiyonu
    toggleTheme: () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      SecureStore.setItemAsync('theme', newTheme);
    },
    // Tema ayarlama fonksiyonu
    setTheme: (newTheme) => {
      setTheme(newTheme);
      SecureStore.setItemAsync('theme', newTheme);
    }
  };
  
  // Kaydedilmiş temayı yükle
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    
    loadTheme();
  }, []);
  
  return (
    <ThemeContext.Provider value={themeObject}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
