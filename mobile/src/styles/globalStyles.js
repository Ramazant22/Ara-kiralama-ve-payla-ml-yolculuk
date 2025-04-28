import { StyleSheet } from 'react-native';

// Uygulama genelinde kullanılacak ortak renkler
export const COLORS = {
  // Ana Renkler
  PRIMARY: '#FFFFFF',    // Beyaz
  SECONDARY: '#D3D3D3',  // Açık Gri (Kristal Beyaz tonu)
  
  // Arka Plan ve Yüzey Renkleri
  BACKGROUND: '#000000',  // Siyah arka plan
  CARD: '#1A1A1A',        // Koyu gri kart arka planı
  SURFACE: '#121212',     // Koyu yüzey rengi
  
  // Sınır ve Ayırıcı Renkleri
  BORDER: '#333333',      // Koyu gri sınır rengi
  DIVIDER: '#2C2C2C',     // Ayırıcı çizgi rengi
  
  // Metin Renkleri
  TEXT_PRIMARY: '#FFFFFF',   // Beyaz ana metin
  TEXT_SECONDARY: '#CCCCCC', // Açık gri ikincil metin
  TEXT_TERTIARY: '#999999',  // Orta gri üçüncül metin
  TEXT_INVERSE: '#000000',   // Siyah ters metin
  
  // Durum Renkleri
  SUCCESS: '#22C55E',   // Başarı rengi
  ERROR: '#EF4444',     // Hata rengi
  WARNING: '#F59E0B',   // Uyarı rengi
  INFO: '#E0E0E0',      // Bilgi rengi - açık gri
  
  // Gölge Rengi
  SHADOW: 'rgba(255, 255, 255, 0.1)'
};

// Uygulama genelinde kullanılacak ortak stiller
export const globalStyles = StyleSheet.create({
  // Ekran Konteyner Stilleri
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  // Sayfa İçerik Stilleri
  pageContent: {
    flex: 1,
    padding: 16,
  },
  
  // Başlık Stilleri
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  
  // Kart Stilleri
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Buton Stilleri
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: '600',
    fontSize: 16,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Form Stilleri
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  
  // Metin Stilleri
  text: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  
  textSmall: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  
  // Çeşitli
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default {
  COLORS,
  globalStyles
};
