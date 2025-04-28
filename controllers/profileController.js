const Profile = require('../models/Profile');
const User = require('../models/User');

// Profili getir veya oluştur
exports.getOrCreateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Önce kullanıcı profilini ara
    let profile = await Profile.findOne({ user: userId });
    
    // Profil yoksa yeni oluştur
    if (!profile) {
      profile = await Profile.create({
        user: userId,
        // Başlangıç değerleri
        identityVerified: false,
        drivingLicenseVerified: false,
        addressVerified: false,
        emailVerified: req.user.email ? true : false,
        phoneVerified: req.user.phoneNumber ? true : false,
        twoFactorEnabled: false,
        trustLevel: 10, // Yeni kullanıcılar için başlangıç değeri
        rating: 0,
        ratingCount: 0
      });
    }
    
    // Kullanıcı verilerini de getir
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Kullanıcı ve profil verilerini birleştir
    const userProfile = {
      ...user.toObject(),
      ...profile.toObject(),
      id: user._id
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    console.error('Profil bilgileri alınamadı:', error);
    res.status(500).json({
      status: 'error',
      message: 'Profil bilgileri alınamadı',
      error: error.message
    });
  }
};

// Profil güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Güncelleme için izin verilen alanlar
    const allowedFields = [
      'bio', 
      'twoFactorEnabled'
    ];
    
    // İzin verilen alanları filtrele
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Güncelleme tarihini güncelle
    filteredBody.updatedAt = Date.now();
    
    // Profili güncelle, yoksa oluştur
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      filteredBody,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Profil güncellenemedi',
      error: error.message
    });
  }
};
