const nodemailer = require('nodemailer');

// Test modu varsayılan olarak kapalı
let testMode = false;

// E-posta servis bilgileri
const EMAIL_USER = process.env.EMAIL_USER || 'tunctunc101@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'gyaknufvigvpfmyh';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'tunctunc101@gmail.com';

// SMTP transport oluşturma
let transporter;

// E-posta servisi sağlayıcısı oluştur
const createTransporter = async () => {
  // E-posta sunucusuna bağlanmadan önce test modunu kontrol et
  if (process.env.NODE_ENV === 'development' || process.env.EMAIL_TEST_MODE === 'true') {
    console.log('Test modu etkinleştirildi (geliştirme ortamı veya test modu)');
    testMode = true;
    return false;
  }
  
  console.log('Gerçek e-posta sunucusu kullanılıyor');
  console.log('Kullanılan e-posta:', EMAIL_USER);
  console.log('E-posta sunucusu:', EMAIL_HOST);
  
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // SSL sertifika hatalarını geçici olarak atla
        ciphers: 'SSLv3' // Eski SSL/TLS sürümlerini destekle
      },
      connectionTimeout: 5000, // 5 saniye bağlantı zaman aşımı
      greetingTimeout: 5000, // 5 saniye karşılama zaman aşımı
      socketTimeout: 10000 // 10 saniye soket zaman aşımı
    });
    
    // Bağlantıyı test et
    await transporter.verify();
    console.log('E-posta sunucusu bağlantısı başarılı!');
    return true;
  } catch (error) {
    console.error('E-posta sunucusu bağlantı hatası:', error.message);
    
    // Hata durumunda geriye dön ve test modu kullan
    console.log('Test modu etkinleştiriliyor...');
    testMode = true;
    return false;
  }
};

// E-posta gönder
const sendEmail = async (options) => {
  try {
    // Transporter oluşturulmamışsa oluştur
    if (!transporter && !testMode) {
      const success = await createTransporter();
      if (!success) {
        // Test modu - gerçek gönderim olmayacak
        console.log('------ TEST MODU: E-POSTA GÖNDERİM SIMÜLASYONU -------');
        console.log('Alıcı:', options.email);
        console.log('Konu:', options.subject);
        console.log('Metin:', options.text || 'HTML içerik var');
        console.log('-------------------------------------------------------');
        
        return {
          success: true,
          messageId: 'test-' + Date.now(),
          simulated: true
        };
      }
    }
    
    // Test modunda ise sadece simüle et
    if (testMode) {
      console.log('------ TEST MODU: E-POSTA GÖNDERİM SIMÜLASYONU -------');
      console.log('Alıcı:', options.email);
      console.log('Konu:', options.subject);
      console.log('Metin:', options.text || 'HTML içerik var');
      console.log('-------------------------------------------------------');
      
      return {
        success: true,
        messageId: 'test-' + Date.now(),
        simulated: true
      };
    }
    
    // E-posta gönderici ve alıcı bilgileri
    const mailOptions = {
      from: EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    // E-postayı gönder
    const info = await transporter.sendMail(mailOptions);
    
    console.log('E-posta gönderildi: %s', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    
    // Hata durumunda ayrıntıları göster
    console.log('------ BAŞARISIZ E-POSTA GÖNDERİMİ -------');
    console.log('Alıcı:', options.email);
    console.log('Konu:', options.subject);
    console.log('Hata:', error.message);
    console.log('-------------------------------------------');
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Doğrulama kodu e-postası gönder
const sendVerificationEmail = async (email, code) => {
  const subject = 'TakDrive - E-posta Doğrulama Kodu';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4982F3;">TakDrive</h2>
        <p style="font-size: 18px; font-weight: bold;">E-posta Doğrulama Kodu</p>
      </div>
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px;">Doğrulama kodunuz:</p>
        <h2 style="margin: 10px 0; letter-spacing: 5px; text-align: center; font-size: 32px; color: #333;">${code}</h2>
      </div>
      
      <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
        Bu doğrulama kodu 10 dakika süreyle geçerlidir. Eğer bu doğrulama işlemini siz başlatmadıysanız, lütfen bu e-postayı dikkate almayınız.
      </p>
      
      <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9e9e9;">
        <p>&copy; ${new Date().getFullYear()} TakDrive. Tüm hakları saklıdır.</p>
      </div>
    </div>
  `;
  
  const textContent = `
    TakDrive - E-posta Doğrulama Kodu
    
    Doğrulama kodunuz: ${code}
    
    Bu doğrulama kodu 10 dakika süreyle geçerlidir. Eğer bu doğrulama işlemini siz başlatmadıysanız, lütfen bu e-postayı dikkate almayınız.
    
    &copy; ${new Date().getFullYear()} TakDrive. Tüm hakları saklıdır.
  `;
  
  return await sendEmail({
    email,
    subject,
    text: textContent,
    html: htmlContent
  });
};

// Modülü başlatma - ama hemen değil, ilk kullanımda başlat
// createTransporter();

// Test modunu kontrol etmek için
const isTestMode = () => testMode;

module.exports = {
  sendEmail,
  sendVerificationEmail,
  isTestMode,
  createTransporter
};
