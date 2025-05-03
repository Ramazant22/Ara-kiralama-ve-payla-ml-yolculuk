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

    // MongoDB Atlas bağlantı URI'si
    let dbUri = process.env.MONGODB_URI;

    // Eğer MONGODB_URI çevresel değişkeni yoksa varsayılan bağlantıyı kullan
    if (!dbUri) {
      // Örnek MongoDB Atlas bağlantısı
      dbUri = 'mongodb+srv://takdrive:takdrive123@cluster0.mongodb.net/takdrive?retryWrites=true&w=majority';
      console.log('Yerel veritabanı bağlantısı kullanılıyor');
    }

    // Veritabanı bağlantısı 
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