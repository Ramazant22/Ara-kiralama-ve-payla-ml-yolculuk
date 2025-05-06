import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyisim alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  identityVerified: {
    type: Boolean,
    default: false
  },
  drivingLicenseVerified: {
    type: Boolean,
    default: false
  },
  addressVerified: {
    type: Boolean,
    default: false
  },
  trustLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Koleksiyon adını açıkça belirtiyoruz
const User = mongoose.models.User || mongoose.model('User', userSchema, 'Users');

export default User; 