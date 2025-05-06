import mongoose from 'mongoose';

// API URL'leri için yapılandırmalar
// const API_BASE_URL = 'http://localhost:3003/api'; // Lokal geliştirme ortamı
const API_BASE_URL = 'http://10.0.2.2:3004/api'; // Android Emülatör için localhost bağlantısı
// const API_BASE_URL = 'http://192.168.184.21:3004/api'; // IP adresiniz ve portu
// const API_BASE_URL = 'https://takdrive-api.herokuapp.com/api'; // Prodüksiyon

// MongoDB Bağlantı yapılandırması
const connectDB = async () => {
  try {
    // Bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Sunucu seçim zaman aşımı
      socketTimeoutMS: 45000, // Soket zaman aşımı
      family: 4 // IPv4 kullan
    };

    // MongoDB bağlantı URI'si - .env dosyasından alınabilir
    const dbUri = 'mongodb://localhost:27017/takdrive';

    // Veritabanı bağlantısı 
    const conn = await mongoose.connect(dbUri, options);

    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`MongoDB bağlantı hatası: ${error.message}`);
    // Mobil uygulamada hemen çıkış yapmıyoruz, hata döndürüyoruz
    throw error;
  }
};

// API servis yapılandırması
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 saniye
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export { connectDB, apiConfig }; 