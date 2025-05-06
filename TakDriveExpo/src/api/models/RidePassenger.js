import mongoose from 'mongoose';

const ridePassengerSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideShare',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seats: {
    type: Number,
    required: [true, 'Koltuk sayısı zorunludur'],
    min: [1, 'En az 1 koltuk rezerve edilmelidir'],
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  pickupPoint: {
    type: String,
    trim: true
  },
  dropoffPoint: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Ücret zorunludur']
  },
  message: {
    type: String,
    trim: true
  },
  isReviewed: {
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

// Bir yolculuktaki tüm yolcuları bulmak için indeks
ridePassengerSchema.index({ ride: 1, status: 1 });

// Bir kullanıcının tüm yolculuklarını bulmak için indeks
ridePassengerSchema.index({ user: 1, status: 1 });

// Kullanıcı ve yolculuk kombinasyonunu benzersiz yapmak için
ridePassengerSchema.index({ ride: 1, user: 1 }, { unique: true });

// Koleksiyon adını açıkça belirtiyoruz
const RidePassenger = mongoose.models.RidePassenger || mongoose.model('RidePassenger', ridePassengerSchema, 'RidePassengers');

export default RidePassenger; 