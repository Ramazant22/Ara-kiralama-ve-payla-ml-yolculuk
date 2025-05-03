const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Yedekleme dizini
const BACKUP_DIR = path.resolve(__dirname, '../backups');

// Dizin yoksa oluştur
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Tarih formatı
const getDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
};

// Veritabanı yedekleme
const backupDB = () => {
  const dateString = getDateString();
  const backupFile = path.join(BACKUP_DIR, `backup-${dateString}.gz`);
  
  // MongoDB URI'den veritabanı adını çıkar
  const dbName = process.env.MONGODB_URI.split('/').pop();
  
  // mongodump komutu
  const cmd = `mongodump --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupFile}`;
  
  console.log('Veritabanı yedekleniyor...');
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Yedekleme hatası: ${error.message}`);
      return;
    }
    
    console.log(`Veritabanı başarıyla yedeklendi: ${backupFile}`);
  });
};

// Veritabanı geri yükleme
const restoreDB = (backupFile) => {
  if (!backupFile) {
    console.error('Geri yüklenecek dosya belirtilmedi');
    return;
  }
  
  const fullPath = path.resolve(BACKUP_DIR, backupFile);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`Dosya bulunamadı: ${fullPath}`);
    return;
  }
  
  // mongorestore komutu
  const cmd = `mongorestore --uri="${process.env.MONGODB_URI}" --gzip --archive=${fullPath}`;
  
  console.log('Veritabanı geri yükleniyor...');
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Geri yükleme hatası: ${error.message}`);
      return;
    }
    
    console.log(`Veritabanı başarıyla geri yüklendi: ${fullPath}`);
  });
};

// Komut satırı argümanlarını işle
const args = process.argv.slice(2);
const command = args[0];
const file = args[1];

if (command === 'backup') {
  backupDB();
} else if (command === 'restore' && file) {
  restoreDB(file);
} else {
  console.log('Kullanım: node dbBackup.js backup');
  console.log('Kullanım: node dbBackup.js restore <dosya_adı>');
} 