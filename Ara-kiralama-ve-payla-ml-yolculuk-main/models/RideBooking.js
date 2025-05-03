const mongoose = require('mongoose');

const rideBookingSchema = new mongoose.Schema({
  rideShare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideShare',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Konum bazlı sorgular için indeksler
rideBookingSchema.index({ pickupLocation: '2dsphere' });
rideBookingSchema.index({ dropoffLocation: '2dsphere' });

// Koleksiyon adını açıkça belirtiyoruz - küçük harfle 'ridebookings'
const RideBooking = mongoose.model('RideBooking', rideBookingSchema, 'ridebookings');

module.exports = RideBooking; 