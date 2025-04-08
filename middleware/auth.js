const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { decrypt } = require('../utils/encryption');

// JWT token doğrulama
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bu token\'a ait kullanıcı artık mevcut değil'
      });
    }
    
    // Şifre değişikliği kontrolü
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          status: 'fail',
          message: 'Şifreniz değiştirildi. Lütfen tekrar giriş yapın'
        });
      }
    }
    
    // Kullanıcı aktif mi kontrolü
    if (!user.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }
    
    // İsteğe kullanıcı bilgisini ekle
    req.user = user;
    next();
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
        message: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Sunucu hatası'
    });
  }
};

// Rol bazlı yetkilendirme
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu işlem için yetkiniz yok'
      });
    }
    next();
  };
};

// İki faktörlü doğrulama kontrolü
const require2FA = async (req, res, next) => {
  try {
    const user = req.user;
    
    // 2FA aktif mi kontrol et
    if (user.twoFactorEnabled && !user.twoFactorVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'İki faktörlü doğrulama gerekiyor',
        requires2FA: true
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Sunucu hatası'
    });
  }
};

module.exports = {
  protect,
  restrictTo,
  require2FA
};