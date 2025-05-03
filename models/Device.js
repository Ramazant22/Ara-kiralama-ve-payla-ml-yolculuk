const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cihazın bağlı olduğu kullanıcı ID zorunludur']
  },
  deviceId: {
    type: String,
    required: [true, 'Cihaz ID zorunludur'],
    trim: true,
    index: true
  },
  deviceName: {
    type: String,
    required: [true, 'Cihaz adı zorunludur'],
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: [true, 'Cihaz tipi zorunludur']
  },
  pushToken: {
    type: String,
    trim: true
  },
  appVersion: {
    type: String,
    trim: true
  },
  osVersion: {
    type: String,
    trim: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Aynı kullanıcı ve deviceId kombinasyonu için tekilliliği sağla
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema, 'Devices');

module.exports = Device; 