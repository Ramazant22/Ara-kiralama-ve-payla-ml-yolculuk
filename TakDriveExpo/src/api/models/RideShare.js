import mongoose from 'mongoose';

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

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'SharedTrips'
const RideShare = mongoose.models.RideShare || mongoose.model('RideShare', rideShareSchema, 'SharedTrips');

export default RideShare; 