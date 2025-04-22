const mongoose = require('mongoose');

const userReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Değerlendirmeyi yapan kullanıcı bilgisi zorunludur']
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Değerlendirilen kullanıcı bilgisi zorunludur']
  },
  relatedTo: {
    type: String,
    enum: ['rental', 'rideShare', 'general'],
    default: 'general'
  },
  relatedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    // Bu alan, değerlendirmenin kiralamaya veya yolculuğa bağlı olduğunda o kayıdın ID'sini tutar
    refPath: 'relatedItemType'
  },
  relatedItemType: {
    type: String,
    enum: ['Rental', 'RideShare']
  },
  rating: {
    type: Number,
    required: [true, 'Puan alanı zorunludur'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Yorum 500 karakterden uzun olamaz']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isProfessional: {
    type: Boolean,
    default: false
  },
  isPunctual: {
    type: Boolean,
    default: false
  },
  isFriendly: {
    type: Boolean,
    default: false
  },
  isReliable: {
    type: Boolean,
    default: false
  },
  isSafe: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  adminReview: {
    type: Boolean,
    default: false
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Bir kullanıcının diğer kullanıcıya sadece bir yorum yapabilmesini sağla
// Eğer ilişkili bir işlem varsa (kiralama veya yolculuk), bunlar için ayrı yorumlar yapılabilir
userReviewSchema.index(
  { reviewer: 1, reviewedUser: 1, relatedTo: 1, relatedItemId: 1 },
  { unique: true, partialFilterExpression: { relatedItemId: { $exists: true } } }
);

userReviewSchema.index(
  { reviewer: 1, reviewedUser: 1, relatedTo: 1 },
  { unique: true, partialFilterExpression: { relatedTo: 'general' } }
);

// Değerlendirme eklendiğinde kullanıcının ortalama puanını güncelle
userReviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  
  // Kullanıcının tüm değerlendirmelerini bul
  const reviews = await mongoose.model('UserReview').find({
    reviewedUser: this.reviewedUser,
    status: 'approved'
  });
  
  if (reviews.length > 0) {
    // Ortalama puanı hesapla
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Kullanıcı bilgilerini güncelle
    await User.findByIdAndUpdate(this.reviewedUser, {
      rating: parseFloat(averageRating.toFixed(1)),
      ratingCount: reviews.length
    });
  }
});

// Değerlendirme silindiğinde kullanıcının ortalama puanını güncelle
userReviewSchema.post('remove', async function() {
  const User = mongoose.model('User');
  
  // Kullanıcının tüm değerlendirmelerini bul
  const reviews = await mongoose.model('UserReview').find({
    reviewedUser: this.reviewedUser,
    status: 'approved'
  });
  
  if (reviews.length > 0) {
    // Ortalama puanı hesapla
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Kullanıcı bilgilerini güncelle
    await User.findByIdAndUpdate(this.reviewedUser, {
      rating: parseFloat(averageRating.toFixed(1)),
      ratingCount: reviews.length
    });
  } else {
    // Hiç değerlendirme kalmadıysa sıfırla
    await User.findByIdAndUpdate(this.reviewedUser, {
      rating: 0,
      ratingCount: 0
    });
  }
});

const UserReview = mongoose.model('UserReview', userReviewSchema, 'UserReviews');

module.exports = UserReview;