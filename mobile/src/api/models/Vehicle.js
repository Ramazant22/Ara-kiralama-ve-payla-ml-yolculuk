import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Araç markası zorunludur'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Araç modeli zorunludur'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Araç yılı zorunludur']
  },
  licensePlate: {
    type: String,
    required: [true, 'Plaka zorunludur'],
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'hatchback', 'suv', 'minivan', 'van', 'pickup', 'other'],
    required: [true, 'Araç tipi zorunludur']
  },
  seats: {
    type: Number,
    required: [true, 'Koltuk sayısı zorunludur'],
    min: [1, 'Koltuk sayısı en az 1 olmalıdır'],
    max: [50, 'Koltuk sayısı en fazla 50 olabilir']
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'other'],
    required: [true, 'Yakıt tipi zorunludur']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: [true, 'Vites tipi zorunludur']
  },
  photos: [{
    type: String
  }],
  description: {
    type: String,
    trim: true
  },
  dailyRate: {
    type: Number,
    required: [true, 'Günlük ücret zorunludur']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Saatlik ücret zorunludur']
  },
  location: {
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
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Konum bazlı sorgular için indeks
vehicleSchema.index({ location: '2dsphere' });

// Koleksiyon adını açıkça belirtiyoruz - büyük harfle 'Cars'
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema, 'Cars');

export default Vehicle; 