const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Doğrulama kodları için geçici depolama
// NOT: Gerçek bir uygulamada bu veritabanında saklanmalıdır
const verificationCodes = {};

// Doğrulama kodu oluşturma ve gönderme
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-posta adresi gereklidir'
      });
    }
    
    // 6 haneli rastgele kod oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Kod geçerlilik süresi (10 dakika)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    // Kodu geçici olarak sakla
    verificationCodes[email] = {
      code: verificationCode,
      expiresAt,
      type: type || 'email'
    };
    
    console.log(`Doğrulama kodu oluşturuldu: ${verificationCode} - E-posta: ${email}`);
    
    // E-posta gönderimi yap
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode);
    
    if (emailResult.success) {
      console.log('Doğrulama kodu e-posta ile gönderildi:', emailResult.messageId);
      if (emailResult.previewUrl) {
        console.log('E-posta önizleme linki:', emailResult.previewUrl);
      }
    } else {
      console.error('E-posta gönderimi başarısız:', emailResult.error);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Doğrulama kodu gönderildi',
      data: {
        // Test/geliştirme amacıyla kodu da dönüyoruz
        // Gerçek uygulamada bu kısım olmaz
        verificationCode
      }
    });
  } catch (error) {
    console.error('Doğrulama kodu gönderme hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Doğrulama kodu gönderilemedi',
      error: error.message
    });
  }
};

// Doğrulama kodunu kontrol etme
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-posta ve doğrulama kodu gereklidir'
      });
    }
    
    // Kod kontrolü
    const storedVerification = verificationCodes[email];
    
    if (!storedVerification) {
      return res.status(400).json({
        status: 'fail',
        message: 'Geçersiz istek. Lütfen yeni bir doğrulama kodu isteyin.'
      });
    }
    
    // Süre kontrolü
    if (Date.now() > storedVerification.expiresAt) {
      delete verificationCodes[email]; // Süresi geçmiş kodu temizle
      return res.status(400).json({
        status: 'fail',
        message: 'Doğrulama kodunun süresi doldu. Lütfen yeni bir kod isteyin.'
      });
    }
    
    // Kod eşleşme kontrolü
    if (storedVerification.code !== code) {
      return res.status(400).json({
        status: 'fail',
        message: 'Geçersiz doğrulama kodu'
      });
    }
    
    // Doğrulama başarılı - kullanıcı için doğrulama durumunu güncelle
    // Bu örnek için sadece test amaçlı - veritabanında güncelleme yapmıyoruz
    
    // Kullanılan kodu temizle
    delete verificationCodes[email];
    
    res.status(200).json({
      status: 'success',
      message: 'Doğrulama başarılı',
      data: {
        verified: true,
        type: storedVerification.type
      }
    });
  } catch (error) {
    console.error('Doğrulama kodu kontrol hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Doğrulama kodu kontrol edilemedi',
      error: error.message
    });
  }
};
