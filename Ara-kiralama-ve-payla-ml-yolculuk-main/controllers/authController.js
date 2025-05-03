const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    console.log('Kayıt isteği alındı:', JSON.stringify(req.body));
    
    // Veri doğrulama ve esneklik sağlama
    let { firstName, lastName, fullname, email, password, phoneNumber } = req.body;
    
    // Eğer firstName ve lastName yoksa ama fullname varsa, onları çıkar
    if (!firstName && !lastName && fullname) {
      const nameParts = fullname.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Eğer bir veri eksikse hata döndür
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-posta ve şifre alanları zorunludur'
      });
    }
    
    if (!firstName || !lastName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Ad ve Soyad alanları zorunludur'
      });
    }

    // E-posta kontrolü (index kullanıyor olmalı)
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluşturma
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber: phoneNumber || ''
    });

    // Doğrulama kodları oluşturma (gerçek uygulamada SMS ve e-posta gönderimi yapılacak)
    const emailVerificationToken = crypto.randomBytes(3).toString('hex');
    const phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // E-posta doğrulama kodu gönderimi
    console.log(`E-posta doğrulama kodu: ${emailVerificationToken}`);
    
    try {
      const emailResult = await emailService.sendVerificationEmail(email, emailVerificationToken);
      console.log('E-posta gönderim sonucu:', emailResult);
      
      if (!emailResult.success) {
        console.error('E-posta gönderimi başarısız:', emailResult.error);
      }
    } catch (emailError) {
      console.error('E-posta gönderme hatası:', emailError);
    }
    
    // SMS göndermek için gerekli servis entegrasyonu henüz yok
    console.log(`Telefon doğrulama kodu: ${phoneVerificationCode}`);

    // JWT token oluşturma
    const token = generateToken(newUser._id);

    // Şifreyi response'dan çıkar
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    console.log('Giriş isteği alındı:', req.body);
    const { email, password } = req.body;

    // E-posta ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Lütfen e-posta ve şifre girin'
      });
    }

    // Kullanıcı kontrolü - sadece gerekli alanları seç
    console.log('Kullanıcı aranıyor:', email);
    const user = await User.findOne({ email })
      .select('+password firstName lastName email phoneNumber createdAt')
      .lean();
      
    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return res.status(401).json({
        status: 'fail',
        message: 'E-posta veya şifre hatalı'
      });
    }
    
    console.log('Kullanıcı bulundu:', user.email);
    console.log('Şifre kontrolü yapılıyor...');
    
    // Şifre karşılaştırma işlemi bcrypt ile doğrudan yapılıyor
    const bcrypt = require('bcryptjs');
    let isPasswordCorrect = false;
    
    try {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt hatası:', bcryptError.message);
    }
    
    console.log('Şifre doğru mu:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'E-posta veya şifre hatalı'
      });
    }

    // JWT token oluşturma
    const token = generateToken(user._id);
    console.log('Token oluşturuldu');

    // Şifreyi response'dan çıkar
    delete user.password;
    
    // Frontend beklentisine uygun format
    const formattedUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      createdAt: user.createdAt || new Date().toISOString()
    };
    
    console.log('Giriş başarılı, kullanıcı yanıtı oluşturuluyor:', formattedUser);

    res.status(200).json({
      status: 'success',
      token,
      user: formattedUser
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    });
  }
};

// Token yenileme (refresh token)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token gereklidir'
      });
    }
    
    // JWT_SECRET kullanılarak token doğrulanır
    // Gerçek uygulamada farklı bir REFRESH_TOKEN_SECRET kullanılabilir
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bu token için kullanıcı bulunamadı'
      });
    }
    
    // Yeni access token oluştur
    const newToken = generateToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token: newToken
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token süresi doldu'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// E-posta doğrulama
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    // Gerçek uygulamada token kontrolü yapılacak
    // Şimdilik her token'ı kabul edelim
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'E-posta başarıyla doğrulandı'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Telefon doğrulama
exports.verifyPhone = async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    // Gerçek uygulamada kod kontrolü yapılacak
    // Şimdilik her kodu kabul edelim
    
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }

    user.isPhoneVerified = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Telefon numarası başarıyla doğrulandı'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Şifre sıfırlama isteği
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bu e-posta adresine sahip kullanıcı bulunamadı'
      });
    }

    // Şifre sıfırlama token'ı oluşturma
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Gerçek uygulamada token hashlenerek veritabanına kaydedilecek
    // ve e-posta ile kullanıcıya gönderilecek
    console.log(`Şifre sıfırlama token'ı: ${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'Şifre sıfırlama token\'ı e-posta adresinize gönderildi'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Gerçek uygulamada token kontrolü yapılacak
    // Şimdilik her token'ı kabul edelim
    
    // Örnek bir kullanıcı ID'si
    const userId = '60d0fe4f5311236168a109ca';
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Geçersiz token veya süresi dolmuş'
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Şifreniz başarıyla sıfırlandı'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Şifre güncelleme
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı şifresiyle birlikte getir
    const user = await User.findById(req.user._id).select('+password');
    
    // Mevcut şifre kontrolü
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Mevcut şifre hatalı'
      });
    }
    
    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();
    
    // Yeni token oluştur
    const token = generateToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 