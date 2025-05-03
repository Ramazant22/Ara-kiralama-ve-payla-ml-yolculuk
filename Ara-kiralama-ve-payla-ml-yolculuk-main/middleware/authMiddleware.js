const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Token kontrolü
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bu işlemi gerçekleştirmek için giriş yapmalısınız'
      });
    }

    // Token doğrulama
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Geçersiz token, lütfen tekrar giriş yapın'
      });
    }

    // Kullanıcı kontrolü
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bu token sahibi kullanıcı artık mevcut değil'
      });
    }

    // Kullanıcıyı request nesnesine ekle
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Kimlik doğrulama hatası'
    });
  }
};

// Admin kontrolü
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu işlemi gerçekleştirmek için yetkiniz yok'
      });
    }
    next();
  };
}; 