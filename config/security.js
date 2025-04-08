const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting yapılandırması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek sayısı
  message: {
    status: 'error',
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  }
});

// Güvenlik middleware'leri
const securityMiddleware = (app) => {
  // HTTP header'larını güvenli hale getir
  app.use(helmet());
  
  // Rate limiting uygula
  app.use('/api/', limiter);
  
  // CORS güvenliği
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  // SQL injection koruması için query string temizleme
  app.use((req, res, next) => {
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].replace(/[;'"`]/g, '');
        }
      });
    }
    next();
  });
};

module.exports = {
  securityMiddleware
}; 