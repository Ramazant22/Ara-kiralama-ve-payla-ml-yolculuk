import mongoose from 'mongoose';

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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'other'],
    default: 'credit_card'
  },
  additionalDrivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notes: {
    type: String,
    trim: true
  },
  cancelReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// İndeksler
rentalSchema.index({ renter: 1 });
rentalSchema.index({ owner: 1 });
rentalSchema.index({ vehicle: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });
rentalSchema.index({ status: 1 });

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'Rentals'
const Rental = mongoose.models.Rental || mongoose.model('Rental', rentalSchema, 'Rentals');

export default Rental; 