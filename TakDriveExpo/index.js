import { registerRootComponent } from 'expo';
import App from './App';
import { connectDB } from './src/api/config/database';

// Veritabanı bağlantısını başlat
connectDB()
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı!');
  })
  .catch(err => {
    console.error('Veritabanı bağlantı hatası:', err);
    // Hata durumunda uygulamayı çökertmiyoruz, sadece loglamakla yetiniyoruz
    // Mobil uygulamada veritabanı olmasa bile API servisi ile çalışabilir
  });

// Uygulamayı kaydet
registerRootComponent(App); 