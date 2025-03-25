const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Sunucu seçim zaman aşımı
      socketTimeoutMS: 45000, // Soket zaman aşımı
      maxPoolSize: 10, // Maksimum bağlantı sayısı
      minPoolSize: 2,  // Minimum bağlantı sayısı
      family: 4 // IPv4 kullan
    };

    // Doğrudan veritabanı adresini belirterek bağlantı kuruyoruz
    const dbUri = 'mongodb://localhost:27017/takdrive';
    const conn = await mongoose.connect(dbUri, options);

    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
    console.log(`Veritabanı: ${conn.connection.name}`);
    
    // Bağlantı hatalarını dinle
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB bağlantı hatası: ${err.message}`);
    });
    
    // Bağlantı kesildiğinde
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB bağlantısı kesildi');
    });
    
    // Uygulama kapandığında bağlantıyı kapat
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB bağlantısı kapatıldı');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB bağlantı hatası: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 