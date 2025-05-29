# TakDrive Uygulaması

Kullanıcıların kendi araçlarını kiralayabileceği ve paylaşımlı yolculuk özelliğinin bulunduğu web ve mobil uygulama.

## Teknolojiler

### Backend
- Node.js
- Express.js
- MongoDB (carsharing veritabanı)
- JWT Authentication
- Multer (dosya yükleme)
- Bcrypt (şifre şifreleme)

### Web App
- React.js
- React Router
- Axios (API iletişimi)
- Material-UI / Tailwind CSS
- React Query
- React Hook Form

### Mobile App
- React Native
- React Navigation
- Axios (API iletişimi)
- React Native Maps
- AsyncStorage

## Proje Yapısı

```
carsharing-app/
├── backend/                 # Node.js + Express.js API
│   ├── config.js           # Konfigürasyon
│   ├── server.js           # Ana server dosyası
│   ├── models/             # MongoDB modelleri
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Ride.js
│   │   └── Booking.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── vehicles.js
│   │   ├── rides.js
│   │   └── bookings.js
│   └── uploads/            # Yüklenen dosyalar
├── web/                    # React web uygulaması
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS/SCSS files
│   └── package.json
├── mobile/                 # React Native uygulaması
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   ├── navigation/     # Navigation setup
│   │   └── utils/          # Utility functions
│   └── App.js
└── README.md
```

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MongoDB
- React Native CLI (mobil uygulama için)

### Backend Kurulumu
```bash
cd backend
npm install
npm start
```

### Web App Kurulumu
```bash
cd web
npm install
npm start
```

### Mobile App Kurulumu
```bash
cd mobile
npm install
npx react-native run-android  # Android için
npx react-native run-ios      # iOS için
```

## Özellikler

### Kullanıcı Yönetimi
- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Profil yönetimi
- ✅ Ehliyet doğrulama
- ✅ Kullanıcı değerlendirme sistemi

### Araç Yönetimi
- ✅ Araç ekleme/düzenleme/silme
- ✅ Araç fotoğraf yükleme
- ✅ Araç konum belirleme
- ✅ Araç kategori ve özellik yönetimi

### Kiralama Sistemi
- ✅ Araç kiralama sistemi
- ✅ Rezervasyon yönetimi
- ✅ Fiyat hesaplama (saatlik/günlük)
- ✅ Ödeme durumu takibi
- ✅ Araç teslim/iade işlemleri

### Paylaşımlı Yolculuk
- ✅ Yolculuk oluşturma
- ✅ Yolculuk arama ve filtreleme
- ✅ Yolculuğa katılma/ayrılma
- ✅ Güzergah belirleme
- ✅ Yolcu yönetimi

### Harita ve Konum
- ✅ Harita entegrasyonu
- ✅ Yakındaki araçları bulma
- ✅ Güzergah planlama
- ✅ Gerçek zamanlı konum takibi

### Admin Paneli
- ✅ Kullanıcı yönetimi
- ✅ Araç onay sistemi
- ✅ Rezervasyon yönetimi
- ✅ Sistem istatistikleri

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri
- `POST /api/auth/logout` - Çıkış

### Users
- `GET /api/users` - Kullanıcıları listele (admin)
- `GET /api/users/:id` - Kullanıcı detayı
- `PUT /api/users/profile` - Profil güncelle
- `PUT /api/users/change-password` - Şifre değiştir

### Vehicles
- `GET /api/vehicles` - Araçları listele
- `POST /api/vehicles` - Araç ekle
- `GET /api/vehicles/:id` - Araç detayı
- `PUT /api/vehicles/:id` - Araç güncelle
- `DELETE /api/vehicles/:id` - Araç sil

### Rides (Paylaşımlı Yolculuk)
- `GET /api/rides` - Yolculukları listele
- `POST /api/rides` - Yolculuk oluştur
- `GET /api/rides/:id` - Yolculuk detayı
- `POST /api/rides/:id/join` - Yolculuğa katıl
- `DELETE /api/rides/:id/leave` - Yolculuktan ayrıl

### Bookings (Rezervasyonlar)
- `GET /api/bookings` - Rezervasyonları listele
- `POST /api/bookings` - Rezervasyon oluştur
- `GET /api/bookings/:id` - Rezervasyon detayı
- `PATCH /api/bookings/:id/status` - Rezervasyon durumu güncelle

## Veritabanı Yapısı

### Users Collection
- Kullanıcı bilgileri, kimlik doğrulama
- Profil bilgileri, adres
- Ehliyet bilgileri
- Değerlendirme puanları

### Vehicles Collection
- Araç teknik bilgileri
- Fiyatlandırma
- Konum bilgileri
- Fotoğraflar ve belgeler

### Rides Collection
- Yolculuk rotası
- Kalkış/varış noktaları
- Yolcu bilgileri
- Fiyat ve koltuk bilgileri

### Bookings Collection
- Kiralama rezervasyonları
- Tarih ve süre bilgileri
- Ödeme detayları
- Araç teslim/iade bilgileri

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifre hash'leme (bcrypt)
- Input validation
- File upload güvenliği
- CORS yapılandırması

## Geliştirici

Bu proje araç paylaşımı ve kiralama sistemi için geliştirilmiştir. Hem web hem de mobil platformlarda kullanılabilir. 