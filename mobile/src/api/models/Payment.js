import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Ödeme tutarı zorunludur'],
    min: [0, 'Ödeme tutarı 0\'dan küçük olamaz']
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  paymentType: {
    type: String,
    enum: ['reservation', 'ride', 'deposit', 'refund', 'other'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    // Bu alanı dinamik olarak referans vermek için
    // paymentType'a göre farklı bir koleksiyona referans verebiliriz
    refPath: function() {
      switch(this.paymentType) {
        case 'reservation': return 'Reservation';
        case 'ride': return 'RideShare';
        default: return null;
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'wallet', 'other'],
    required: true
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  transactionId: {
    type: String,
    sparse: true
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  errorMessage: {
    type: String
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

// Kullanıcı ödemelerini bulmak için indeks
paymentSchema.index({ user: 1, status: 1 });

// İlişkili öğelere göre ödemeleri bulmak için indeks
paymentSchema.index({ paymentType: 1, relatedId: 1 });

// Koleksiyon adını açıkça belirtiyoruz
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema, 'Payments');

export default Payment; 