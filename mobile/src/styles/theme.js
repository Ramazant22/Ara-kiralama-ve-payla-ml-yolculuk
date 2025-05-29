// Web uygulamasıyla uyumlu renk paleti
export const colors = {
  // Ana renkler
  primary: '#ff6b35',      // Ana turuncu
  primaryDark: '#e55a2b',  // Hover/pressed durumu
  primaryLight: '#ff8a5b', // Açık turuncu

  // Arkaplan renkleri
  background: '#1a1a1a',   // Ana arkaplan (koyu)
  surface: '#2a2a2a',      // Kart/yüzey rengi
  surfaceLight: '#3a3a3a', // Açık yüzey

  // Metin renkleri
  onPrimary: '#ffffff',    // Primary üzerindeki metin
  onBackground: '#ffffff', // Arkaplan üzerindeki metin
  onSurface: '#ffffff',    // Yüzey üzerindeki metin
  
  // Durum renkleri
  success: '#4caf50',      // Başarı
  warning: '#ff9800',      // Uyarı
  error: '#f44336',        // Hata
  info: '#2196F3',         // Bilgi

  // Nötr renkler
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Özel renkler
  star: '#ffd700',         // Yıldız puanları
  online: '#4caf50',       // Online durumu
  offline: '#9e9e9e',      // Offline durumu
  
  // Şeffaf renkler
  overlay: 'rgba(0, 0, 0, 0.5)',
  primaryOverlay: 'rgba(255, 107, 53, 0.1)',
};

// Stil sabitleri
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

export const elevation = {
  none: 0,
  low: 2,
  medium: 4,
  high: 8,
  highest: 16,
  level0: 0,
  level1: 1,
  level2: 2,
  level3: 3,
  level4: 4,
  level5: 5,
};

// Font boyutları
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  huge: 24,
  title: 28,
};

// Material Design tema
export const paperTheme = {
  dark: true,
  roundness: 8,
  colors: {
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.primary,
    secondaryContainer: colors.primaryLight,
    tertiary: colors.primary,
    tertiaryContainer: colors.primaryLight,
    surface: colors.surface,
    surfaceVariant: colors.surfaceLight,
    surfaceDisabled: colors.text.disabled,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.error,
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.onPrimary,
    onSecondary: colors.onPrimary,
    onSecondaryContainer: colors.onPrimary,
    onTertiary: colors.onPrimary,
    onTertiaryContainer: colors.onPrimary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.text.secondary,
    onSurfaceDisabled: colors.text.disabled,
    onError: colors.onPrimary,
    onErrorContainer: colors.onPrimary,
    onBackground: colors.onBackground,
    outline: colors.text.disabled,
    outlineVariant: colors.surfaceLight,
    inverseSurface: colors.text.primary,
    inverseOnSurface: colors.background,
    inversePrimary: colors.background,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surfaceLight,
      level3: colors.surfaceLight,
      level4: colors.surfaceLight,
      level5: colors.surfaceLight,
    },
    // Eski versiyon uyumluluğu
    text: colors.text.primary,
    disabled: colors.text.disabled,
    placeholder: colors.text.secondary,
    backdrop: colors.overlay,
    notification: colors.primary,
  },
  version: 3,
};

export default {
  colors,
  paperTheme,
  spacing,
  borderRadius,
  elevation,
  fontSize,
}; 