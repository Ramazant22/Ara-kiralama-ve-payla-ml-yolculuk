const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

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
    trim: true,
    set: function(phone) {
      // Telefon numarasını şifrele
      return phone ? encrypt(phone) : phone;
    },
    get: function(phone) {
      // Telefon numarasının şifresini çöz
      return phone ? decrypt(phone) : phone;
    }
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
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorVerified: {
    type: Boolean,
    default: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: Date,
  lastLogin: Date,
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
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['identity', 'drivingLicense', 'address', 'other'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    notes: String
  }],
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

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Şifre değiştirildiğinde timestamp güncelle
    if (this.isModified('password') && !this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Şifre sıfırlama token'ı oluşturma
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika
  
  return resetToken;
};

// Başarısız giriş denemelerini kontrol et
userSchema.methods.incrementLoginAttempts = async function() {
  // Hesap kilitli ve kilit süresi dolmamışsa
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return;
  }
  
  this.loginAttempts += 1;
  
  // 5 başarısız deneme sonrası hesabı kilitle
  if (this.loginAttempts >= 5) {
    this.accountLocked = true;
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 dakika
  }
  
  await this.save();
};

// Başarılı girişte deneme sayısını sıfırla
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = null;
  this.lastLogin = Date.now();
  await this.save();
};

// E-posta ve phoneNumber için indeks oluşturma
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 });

// Koleksiyon adını açıkça belirtiyoruz
const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;