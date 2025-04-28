const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const multer = require('multer');
const crypto = require('crypto');

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'takdrive/uploads/verification';
    // Dizin yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Dosya adını benzersiz yap
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${req.user.id}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Sadece belirli dosya tiplerini kabul et
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Sadece resim ve PDF dosyaları yükleyebilirsiniz.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: fileFilter
});

// Doğrulama belgesi yükleme
exports.uploadVerificationDocument = upload.single('document');

// Doğrulama belgesi gönderme
exports.submitVerificationDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Lütfen bir doğrulama belgesi yükleyiniz.', 400));
  }

  // Belge türünün geçerliliğini kontrol et
  const validDocumentTypes = ['identity', 'drivingLicense', 'address', 'other'];
  if (!req.body.documentType || !validDocumentTypes.includes(req.body.documentType)) {
    return next(new AppError('Geçerli bir belge türü seçiniz.', 400));
  }

  // Kullanıcının verifikasyon belgelerini güncelleyin
  const documentUrl = `uploads/verification/${req.file.filename}`;
  
  const user = await User.findById(req.user.id);
  
  user.verificationDocuments.push({
    type: req.body.documentType,
    documentUrl: documentUrl,
    uploadedAt: Date.now(),
    notes: req.body.notes || ''
  });
  
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Doğrulama belgesi başarıyla gönderildi.',
    data: {
      documentType: req.body.documentType,
      documentUrl: documentUrl
    }
  });
});

// Admin: Belgeleri listele
exports.listPendingVerifications = asyncHandler(async (req, res, next) => {
  // Sadece admin kullanıcılar erişebilir
  if (req.user.role !== 'admin') {
    return next(new AppError('Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.', 403));
  }

  // Doğrulama bekleyen tüm belgeler
  const users = await User.find({
    'verificationDocuments.verified': false
  }).select('firstName lastName email verificationDocuments');

  const pendingDocuments = [];
  
  users.forEach(user => {
    user.verificationDocuments.forEach(doc => {
      if (!doc.verified) {
        pendingDocuments.push({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          documentId: doc._id,
          documentType: doc.type,
          documentUrl: doc.documentUrl,
          uploadedAt: doc.uploadedAt
        });
      }
    });
  });

  res.status(200).json({
    status: 'success',
    results: pendingDocuments.length,
    data: {
      pendingDocuments
    }
  });
});

// Admin: Belge onaylama/reddetme
exports.verifyDocument = asyncHandler(async (req, res, next) => {
  // Sadece admin kullanıcılar erişebilir
  if (req.user.role !== 'admin') {
    return next(new AppError('Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.', 403));
  }

  const { userId, documentId, verified, notes } = req.body;

  if (!userId || !documentId) {
    return next(new AppError('Kullanıcı ID ve belge ID zorunludur.', 400));
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı.', 404));
  }

  // Belgeyi bul ve güncelle
  const document = user.verificationDocuments.id(documentId);
  
  if (!document) {
    return next(new AppError('Belge bulunamadı.', 404));
  }

  document.verified = verified;
  document.verifiedAt = verified ? Date.now() : undefined;
  document.notes = notes || document.notes;

  // Belge türüne göre kullanıcı doğrulama durumunu güncelle
  if (verified) {
    switch (document.type) {
      case 'identity':
        user.identityVerified = true;
        break;
      case 'drivingLicense':
        user.drivingLicenseVerified = true;
        break;
      case 'address':
        user.addressVerified = true;
        break;
    }

    // Güven seviyesi hesaplaması
    let trustLevel = 1; // Başlangıç seviyesi
    
    if (user.isEmailVerified) trustLevel++;
    if (user.isPhoneVerified) trustLevel++;
    if (user.identityVerified) trustLevel++;
    if (user.drivingLicenseVerified || user.addressVerified) trustLevel++;
    
    // Güven seviyesini en fazla 5 yapabiliriz
    user.trustLevel = Math.min(5, trustLevel);
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: verified ? 'Belge onaylandı.' : 'Belge reddedildi.',
    data: {
      document
    }
  });
});

// Kullanıcı: Doğrulama durumunu görüntüleme
exports.getUserVerificationStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    'identityVerified drivingLicenseVerified addressVerified verificationDocuments trustLevel isEmailVerified isPhoneVerified'
  );

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      verification: {
        identityVerified: user.identityVerified,
        drivingLicenseVerified: user.drivingLicenseVerified,
        addressVerified: user.addressVerified,
        emailVerified: user.isEmailVerified,
        phoneVerified: user.isPhoneVerified,
        trustLevel: user.trustLevel,
        documents: user.verificationDocuments
      }
    }
  });
});

// Admin: Bir kullanıcının doğrulama durumunu görüntüleme
exports.getUserVerificationStatusByAdmin = asyncHandler(async (req, res, next) => {
  // Sadece admin kullanıcılar erişebilir
  if (req.user.role !== 'admin') {
    return next(new AppError('Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.', 403));
  }

  const user = await User.findById(req.params.userId).select(
    'firstName lastName email identityVerified drivingLicenseVerified addressVerified verificationDocuments trustLevel isEmailVerified isPhoneVerified'
  );

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        verification: {
          identityVerified: user.identityVerified,
          drivingLicenseVerified: user.drivingLicenseVerified,
          addressVerified: user.addressVerified,
          emailVerified: user.isEmailVerified,
          phoneVerified: user.isPhoneVerified,
          trustLevel: user.trustLevel,
          documents: user.verificationDocuments
        }
      }
    }
  });
});