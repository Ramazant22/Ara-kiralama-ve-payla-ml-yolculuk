import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['vehicle', 'ride', 'user'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  rating: {
    type: Number,
    required: [true, 'Değerlendirme puanı zorunludur'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Yorum zorunludur'],
    trim: true,
    minlength: [5, 'Yorum en az 5 karakter olmalıdır']
  },
  photos: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Belirli bir hedef için yapılan değerlendirmeleri bulmak için indeks
reviewSchema.index({ targetType: 1, targetId: 1 });

// Bir kullanıcının tüm değerlendirmelerini bulmak için indeks
reviewSchema.index({ user: 1 });

// Koleksiyon adını açıkça belirtiyoruz
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'Reviews');

export default Review; 