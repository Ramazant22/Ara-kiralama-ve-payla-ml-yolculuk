const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Device = require('../models/Device');
const mobileConfig = require('../config/mobileConfig');

/**
 * Mobil cihazlar için kimlik doğrulama middleware'i
 */
exports.protectMobile = async (req, res, next) => {
  try {
    // Token kontrolü
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Token yoksa hata dön
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Token doğrulama
    const decoded = jwt.verify(token, mobileConfig.jwt.secret);

    // Kullanıcıyı bul
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Bu token sahibi kullanıcı artık mevcut değil'
      });
    }

    // Cihaz doğrulama (eğer deviceId headerı varsa)
    if (mobileConfig.deviceVerification.required && req.headers.deviceid) {
      const device = await Device.findOne({
        userId: currentUser._id,
        deviceId: req.headers.deviceid,
        isActive: true
      });

      if (!device) {
        return res.status(401).json({
          status: 'error',
          message: 'Bu cihaz tanınmıyor veya aktif değil',
          code: 'DEVICE_NOT_RECOGNIZED'
        });
      }

      // Cihazın son aktivite zamanını güncelle
      device.lastActive = Date.now();
      await device.save();

      // Cihaz bilgisini req'e ekle
      req.device = device;
    }

    // Request'e kullanıcı bilgisini ekle
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token süresi doldu, lütfen tekrar giriş yapın',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Kimlik doğrulama hatası',
      error: error.message
    });
  }
};

/**
 * Rol bazlı erişim kontrolü
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bu işlemi yapmak için yetkiniz yok'
      });
    }
    next();
  };
}; 