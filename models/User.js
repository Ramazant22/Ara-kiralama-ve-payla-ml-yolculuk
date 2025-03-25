const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu - instance method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Statik şifre karşılaştırma metodu - lean() kullanımı için
userSchema.statics.comparePassword = async function(candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// E-posta ve phoneNumber için indeks oluşturma
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 });

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'Users'
const User = mongoose.model('User', userSchema, 'Users');

module.exports = User; 