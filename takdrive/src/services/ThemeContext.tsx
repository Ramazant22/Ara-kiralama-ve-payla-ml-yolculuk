import React, { createContext, useState, useContext, useEffect } from 'react';

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
  transparent: 'transparent', // Şeffaf
  
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

// Alternatif tema (ileride kullanılabilir)
const darkTheme = { ...lightTheme };

// Tipografi
const typography = {
  // Font aileleri
  fontFamily: {
    regular: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    medium: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    semibold: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    bold: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Font boyutları
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
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
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Boşluk ve boyutlar
const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem'     // 48px
};

// Yuvarlatılmış kenarlar
const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px'    // Tam yuvarlatma
};

// Tema türleri
type ThemeType = 'light' | 'dark';

// Tema içeriği
interface ThemeContextType {
  theme: any;
  themeType: ThemeType;
  setTheme: (newTheme: ThemeType) => void;
  toggleTheme: () => void;
}

// Tema bağlamı oluşturma
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tema kancası
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Tema sağlayıcı prop türleri
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Tema sağlayıcısı
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  
  // Kaydedilmiş temayı yükle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeType(savedTheme);
    }
  }, []);
  
  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Sayfanın <html> etiketine tema sınıfını ekle
    document.documentElement.classList.remove(themeType);
    document.documentElement.classList.add(newTheme);
  };
  
  // Tema ayarlama fonksiyonu
  const setTheme = (newTheme: ThemeType) => {
    setThemeType(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Sayfanın <html> etiketine tema sınıfını ekle
    document.documentElement.classList.remove(themeType);
    document.documentElement.classList.add(newTheme);
  };
  
  // Tam tema nesnesi
  const theme = themeType === 'dark' ? darkTheme : lightTheme;
  
  // Tema bilgilerini genişleterek sağla
  const themeObject = {
    ...theme,
    typography,
    spacing,
    borderRadius,
    themeType,
    toggleTheme,
    setTheme
  };
  
  return (
    <ThemeContext.Provider value={{ theme: themeObject, themeType, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 