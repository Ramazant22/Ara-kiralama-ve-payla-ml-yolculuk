import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Başlangıç tarihi zorunludur']
  },
  endDate: {
    type: Date,
    required: [true, 'Bitiş tarihi zorunludur']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Toplam fiyat zorunludur']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    trim: true
  },
  pickupLocation: {
    type: String,
    trim: true
  },
  dropoffLocation: {
    type: String,
    trim: true
  },
  extraOptions: {
    childSeat: { type: Boolean, default: false },
    gps: { type: Boolean, default: false },
    additionalDriver: { type: Boolean, default: false },
    fullInsurance: { type: Boolean, default: false }
  },
  cancellationReason: {
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
});

// Başlangıç ve bitiş tarihi örtüşen rezervasyonları bulabilmek için indeks
reservationSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });

// Kullanıcının rezervasyonlarını kolayca bulmak için indeks
reservationSchema.index({ user: 1, status: 1 });

// Koleksiyon adını açıkça belirtiyoruz
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema, 'Reservations');

export default Reservation; 