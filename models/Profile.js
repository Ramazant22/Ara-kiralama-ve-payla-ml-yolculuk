const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  trustLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Bir kullanıcı kaydı olduğunda otomatik profil oluştur
profileSchema.statics.createProfile = async function(userId) {
  return await this.create({ user: userId });
};

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
