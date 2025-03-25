const dotenv = require('dotenv');
dotenv.config();

// Mobil uygulama için konfigürasyon ayarları
const mobileConfig = {
  // Token ayarları
  jwt: {
    secret: process.env.JWT_SECRET || 'mobil-takdrive-gizli-anahtar',
    expiresIn: '30d', // Mobil için daha uzun token süresi
    refreshTokenExpiresIn: '60d'
  },
  
  // API limitleri
  apiLimits: {
    standardRateLimit: 100, // 15 dakika içinde izin verilen istek sayısı
    authRateLimit: 20, // 15 dakika içinde izin verilen kimlik doğrulama istekleri
    uploadSizeLimit: '15mb', // Mobil için daha yüksek yükleme limiti
  },
  
  // Push Bildirim Ayarları
  pushNotifications: {
    enabled: true,
    provider: process.env.PUSH_PROVIDER || 'firebase',
    firebaseCredentials: process.env.FIREBASE_CREDENTIALS || './firebase-credentials.json'
  },
  
  // Cihaz doğrulama ayarları
  deviceVerification: {
    required: true,
    maxDevices: 5 // Bir hesap için maksimum cihaz sayısı
  },
  
  // Dosya yükleme dizini
  uploadDir: process.env.MOBILE_UPLOAD_DIR || 'uploads/mobile'
};

module.exports = mobileConfig; 