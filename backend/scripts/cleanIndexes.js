const mongoose = require('mongoose');
require('dotenv').config();

async function cleanIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carsharing');
        console.log('MongoDB bağlantısı başarılı');

        const db = mongoose.connection.db;
        const collection = db.collection('vehicles');

        // Mevcut index'leri listele
        const indexes = await collection.indexes();
        console.log('Mevcut index\'ler:', indexes);

        // Vehicles collection'ını drop et (tüm eski index'ler ile birlikte)
        await collection.drop();
        console.log('Vehicles collection drop edildi');

        console.log('Index temizleme tamamlandı');
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

cleanIndexes(); 