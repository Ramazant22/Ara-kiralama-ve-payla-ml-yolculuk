const UserReview = require('../models/UserReview');
const User = require('../models/User');
const Rental = require('../models/Rental');
const RideShare = require('../models/RideShare');
const RideBooking = require('../models/RideBooking');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Kullanıcıya değerlendirme eklemek için
exports.createReview = asyncHandler(async (req, res, next) => {
  const { reviewedUserId, rating, comment, relatedTo, relatedItemId, flags } = req.body;

  // Kullanıcı kendisini değerlendiremez
  if (req.user.id === reviewedUserId) {
    return next(new AppError('Kendinizi değerlendiremezsiniz.', 400));
  }

  // Değerlendirilen kullanıcının varlığını kontrol et
  const reviewedUser = await User.findById(reviewedUserId);
  if (!reviewedUser) {
    return next(new AppError('Değerlendirilen kullanıcı bulunamadı.', 404));
  }

  // İlişkili öğenin kontrolü (kiralama veya yolculuk)
  let relatedItemType;
  if (relatedItemId) {
    if (relatedTo === 'rental') {
      // Kiralama kaydını kontrol et
      const rental = await Rental.findById(relatedItemId);
      if (!rental) {
        return next(new AppError('İlgili kiralama kaydı bulunamadı.', 404));
      }
      
      // Bu kiralama ile ilgili değerlendirme yapmaya yetkili olup olmadığını kontrol et
      if (rental.user.toString() !== req.user.id && rental.owner.toString() !== req.user.id) {
        return next(new AppError('Bu kiralama için değerlendirme yapma yetkiniz yok.', 403));
      }
      
      relatedItemType = 'Rental';
    } else if (relatedTo === 'rideShare') {
      // Yolculuk kaydını kontrol et
      const rideShare = await RideShare.findById(relatedItemId);
      if (!rideShare) {
        return next(new AppError('İlgili yolculuk kaydı bulunamadı.', 404));
      }
      
      // Yolculuk sahibi ise
      if (rideShare.driver.toString() === req.user.id) {
        // Yolculuğa katılan kullanıcılardan biri mi diye kontrol et
        const booking = await RideBooking.findOne({
          rideShare: relatedItemId,
          passenger: reviewedUserId
        });
        
        if (!booking) {
          return next(new AppError('Bu yolculukta bu kullanıcıyı değerlendiremezsiniz.', 403));
        }
      } 
      // Eğer yolculuğa katılan bir yolcu ise
      else {
        const booking = await RideBooking.findOne({
          rideShare: relatedItemId,
          passenger: req.user.id
        });
        
        if (!booking) {
          return next(new AppError('Bu yolculuk için değerlendirme yapma yetkiniz yok.', 403));
        }
        
        // Sürücüyü değerlendirdiğinden emin ol
        if (rideShare.driver.toString() !== reviewedUserId) {
          return next(new AppError('Bu yolculuk kapsamında sadece sürücüyü değerlendirebilirsiniz.', 403));
        }
      }
      
      relatedItemType = 'RideShare';
    }
  }

  // Daha önce aynı kullanıcıya aynı bağlamda değerlendirme yapılıp yapılmadığını kontrol et
  const existingReview = await UserReview.findOne({
    reviewer: req.user.id,
    reviewedUser: reviewedUserId,
    relatedTo,
    ...(relatedItemId && { relatedItemId })
  });

  if (existingReview) {
    return next(new AppError('Bu kullanıcıya zaten bir değerlendirme yaptınız.', 400));
  }

  // Değerlendirme puanını kontrol et
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('1 ile 5 arasında bir değerlendirme puanı veriniz.', 400));
  }

  // Değerlendirme bayraklarını ayarla
  const reviewFlags = {
    isProfessional: flags?.isProfessional || false,
    isPunctual: flags?.isPunctual || false,
    isFriendly: flags?.isFriendly || false,
    isReliable: flags?.isReliable || false,
    isSafe: flags?.isSafe || false
  };

  // Yeni değerlendirme oluştur
  const newReview = await UserReview.create({
    reviewer: req.user.id,
    reviewedUser: reviewedUserId,
    relatedTo: relatedTo || 'general',
    ...(relatedItemId && { relatedItemId, relatedItemType }),
    rating,
    comment: comment || '',
    ...reviewFlags,
    // Otomatik onay ayarı (isteğe bağlı olarak değiştirilebilir)
    status: 'approved'
  });

  res.status(201).json({
    status: 'success',
    message: 'Değerlendirmeniz başarıyla kaydedildi.',
    data: {
      review: newReview
    }
  });
});

// Kullanıcının yaptığı değerlendirmeleri listele
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await UserReview.find({ reviewer: req.user.id })
    .populate('reviewedUser', 'firstName lastName profilePicture')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Kullanıcıya yapılan değerlendirmeleri listele
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Sadece onaylanmış ve herkese açık değerlendirmeleri getir
  const reviews = await UserReview.find({
    reviewedUser: userId,
    status: 'approved',
    isPublic: true
  })
    .populate('reviewer', 'firstName lastName profilePicture')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Değerlendirme güncelleme
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, comment, flags } = req.body;

  // Değerlendirmeyi bul
  const review = await UserReview.findById(reviewId);
  
  if (!review) {
    return next(new AppError('Değerlendirme bulunamadı.', 404));
  }
  
  // Sadece değerlendirmeyi yapan kişi güncelleyebilir
  if (review.reviewer.toString() !== req.user.id) {
    return next(new AppError('Bu değerlendirmeyi güncelleme yetkiniz yok.', 403));
  }
  
  // En fazla 48 saat içinde güncellenebilir (güvenlik için)
  const reviewDate = new Date(review.createdAt);
  const now = new Date();
  const hoursDifference = (now - reviewDate) / (1000 * 60 * 60);
  
  if (hoursDifference > 48) {
    return next(new AppError('Değerlendirmeler yalnızca ilk 48 saat içinde düzenlenebilir.', 400));
  }

  // Değerlendirmeyi güncelle
  if (rating) {
    if (rating < 1 || rating > 5) {
      return next(new AppError('1 ile 5 arasında bir değerlendirme puanı veriniz.', 400));
    }
    review.rating = rating;
  }
  
  if (comment !== undefined) {
    review.comment = comment;
  }
  
  if (flags) {
    if (flags.isProfessional !== undefined) review.isProfessional = flags.isProfessional;
    if (flags.isPunctual !== undefined) review.isPunctual = flags.isPunctual;
    if (flags.isFriendly !== undefined) review.isFriendly = flags.isFriendly;
    if (flags.isReliable !== undefined) review.isReliable = flags.isReliable;
    if (flags.isSafe !== undefined) review.isSafe = flags.isSafe;
  }
  
  review.updatedAt = Date.now();
  // Değerlendirme tekrar onay gerektiriyorsa status değişebilir
  // review.status = 'pending';
  
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Değerlendirmeniz başarıyla güncellendi.',
    data: {
      review
    }
  });
});

// Değerlendirme silme
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  // Değerlendirmeyi bul
  const review = await UserReview.findById(reviewId);
  
  if (!review) {
    return next(new AppError('Değerlendirme bulunamadı.', 404));
  }
  
  // Sadece değerlendirmeyi yapan kişi veya admin silebilir
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Bu değerlendirmeyi silme yetkiniz yok.', 403));
  }

  await review.remove();

  res.status(200).json({
    status: 'success',
    message: 'Değerlendirme başarıyla silindi.'
  });
});

// Admin: Tüm değerlendirmeleri listele (filtreli)
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  // Sadece admin kullanıcılar erişebilir
  if (req.user.role !== 'admin') {
    return next(new AppError('Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.', 403));
  }

  const { status, reviewedUser, reviewer, relatedTo } = req.query;
  
  // Filtreleme seçeneklerini oluştur
  const filter = {};
  
  if (status) filter.status = status;
  if (reviewedUser) filter.reviewedUser = reviewedUser;
  if (reviewer) filter.reviewer = reviewer;
  if (relatedTo) filter.relatedTo = relatedTo;

  const reviews = await UserReview.find(filter)
    .populate('reviewer', 'firstName lastName email')
    .populate('reviewedUser', 'firstName lastName email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Admin: Değerlendirme durumunu güncelle (onay, red vb.)
exports.updateReviewStatus = asyncHandler(async (req, res, next) => {
  // Sadece admin kullanıcılar erişebilir
  if (req.user.role !== 'admin') {
    return next(new AppError('Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.', 403));
  }

  const { reviewId } = req.params;
  const { status, adminNotes } = req.body;

  // Değerlendirme durumunun geçerliliğini kontrol et
  const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Geçersiz değerlendirme durumu.', 400));
  }

  // Değerlendirmeyi bul ve güncelle
  const review = await UserReview.findById(reviewId);
  
  if (!review) {
    return next(new AppError('Değerlendirme bulunamadı.', 404));
  }

  review.status = status;
  review.adminReview = true;
  if (adminNotes) review.adminNotes = adminNotes;
  
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Değerlendirme durumu güncellendi.',
    data: {
      review
    }
  });
});

// Değerlendirme istatistiklerini getir
exports.getUserReviewStats = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Kullanıcıyı kontrol et
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı.', 404));
  }
  
  // Onaylanmış değerlendirmeleri al
  const reviews = await UserReview.find({
    reviewedUser: userId,
    status: 'approved'
  });
  
  // İstatistikleri hesapla
  const stats = {
    totalReviews: reviews.length,
    averageRating: user.rating,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    },
    qualityFlags: {
      isProfessional: reviews.filter(r => r.isProfessional).length,
      isPunctual: reviews.filter(r => r.isPunctual).length,
      isFriendly: reviews.filter(r => r.isFriendly).length,
      isReliable: reviews.filter(r => r.isReliable).length,
      isSafe: reviews.filter(r => r.isSafe).length
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});