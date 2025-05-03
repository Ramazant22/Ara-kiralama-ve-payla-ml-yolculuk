const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash'],
    required: true
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Konum bazlı sorgular için indeksler
rentalSchema.index({ pickupLocation: '2dsphere' });
rentalSchema.index({ dropoffLocation: '2dsphere' });

// Kiralama modeli için ek indeksler
rentalSchema.index({ startDate: 1 });
rentalSchema.index({ endDate: 1 });
rentalSchema.index({ vehicle: 1 });
rentalSchema.index({ renter: 1 });
rentalSchema.index({ owner: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ paymentStatus: 1 });

// Toplam fiyatı hesaplamak için virtual property
rentalSchema.virtual('totalAmount').get(function() {
  return this.amount + this.serviceFee + this.insuranceFee;
});

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'Bookings'
const Rental = mongoose.model('Rental', rentalSchema, 'Bookings');

module.exports = Rental; 