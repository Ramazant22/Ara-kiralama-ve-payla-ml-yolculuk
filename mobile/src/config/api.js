// API URL (geliştirme ortamında)
export const API_URL = 'http://10.0.2.2:3003/api'; // Android Emulator için
// iOS Simulator için: 'http://localhost:3003/api'
// Gerçek cihaz için: 'http://BİLGİSAYARINIZIN-IP-ADRESİ:3003/api' (örn. 192.168.1.5:3003/api)

// API Timeout süresi (milisaniye)
export const API_TIMEOUT = 30000; // 30 saniye timeout

// HTTP İstek Yapılandırmaları
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}; 