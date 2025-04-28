const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const rideShareRoutes = require('./routes/rideShareRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
// const verificationRoutes = require('./routes/verificationRoutes'); // Bu modül mevcut değil
// const reviewRoutes = require('./routes/reviewRoutes'); // Bu modül mevcut değil
const compression = require('compression');

// Çevre değişkenlerini yükle
dotenv.config();

// E-posta ayarlarının yüklendiğini doğrula
console.log('E-posta konfigürasyon kontrolü:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Veritabanı bağlantısı
connectDB();

const app = express();

// CORS ayarları - daha detaylı yapılandırma
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // Web uygulaması için izin verilen kaynaklar
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'deviceid'],
  credentials: true // Cookie ve Auth Header desteği
}));

// Performans optimizasyonları
app.use(compression());
app.disable('x-powered-by');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Rotaları
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/ride-shares', rideShareRoutes);
// app.use('/api/verifications', verificationRoutes); // Bu modül mevcut değil
// app.use('/api/reviews', reviewRoutes); // Bu modül mevcut değil
// Mobil API Rotaları
app.use('/api/mobile', mobileRoutes);

// Sağlık Kontrolü (Health Check) Endpoint'i
app.get('/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Sunucu çalışıyor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ana route
app.get('/', (req, res) => {
  res.send('Araç Paylaşım ve Kiralama Platformu API');
});

// 404 - Bulunamadı
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} rotası bulunamadı`
  });
});

// Genel hata yönetimi
app.use((err, req, res, next) => {
  console.error('Hata:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Sunucu hatası',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Port dinleme
const PORT = process.env.PORT || 3003;

// Sunucu başlatma fonksiyonu
const startServer = (port) => {
  // Port değeri maksimum 65535 olabilir, daha yüksek değerler geçersizdir
  if (port >= 65536) {
    console.error('Geçerli bir port bulunamadı. Lütfen manuel olarak bir port belirleyin.');
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor (${process.env.NODE_ENV} modu)`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`${port} portu kullanımda, alternatif port deneniyor...`);
      server.close();
      // Port artışını integer olarak yapılıyor ve 65535'i geçmemesini sağlıyoruz
      startServer(parseInt(port) + 1);  
    } else {
      console.error('Sunucu hatası:', error);
    }
  });

  // İstek zaman aşımı süresini artır
  server.timeout = 120000; // 120 saniye
};

// Başlangıç portunu dinlemeye başla
startServer(PORT);

// İşlenmeyen hataları yakala
process.on('unhandledRejection', (err) => {
  console.error('İŞLENMEYEN HATA:', err.message);
  console.error(err.stack);
  process.exit(1);
});
