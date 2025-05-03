const mongoose = require('mongoose');

const rideShareSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  startLocation: {
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
  endLocation: {
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
  departureTime: {
    type: Date,
    required: true
  },
  estimatedArrivalTime: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerSeat: {
    type: Number,
    required: true
  },
  route: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  description: {
    type: String,
    trim: true
  },
  allowSmoking: {
    type: Boolean,
    default: false
  },
  allowPets: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalSeats: {
    type: Number,
    required: true
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  ]
});

// Konum ve rota bazlı sorgular için indeksler
rideShareSchema.index({ startLocation: '2dsphere' });
rideShareSchema.index({ endLocation: '2dsphere' });
rideShareSchema.index({ route: '2dsphere' });

// Yolculuk modeli için ek indeksler
rideShareSchema.index({ departureTime: 1 });
rideShareSchema.index({ driver: 1 });
rideShareSchema.index({ availableSeats: 1 });
rideShareSchema.index({ pricePerSeat: 1 });
rideShareSchema.index({ status: 1 });

// Boş koltuk sayısını hesapla
rideShareSchema.methods.getAvailableSeats = function() {
  return this.totalSeats - this.bookings.length;
};

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'SharedTrips'
const RideShare = mongoose.model('RideShare', rideShareSchema, 'SharedTrips');

module.exports = RideShare; 