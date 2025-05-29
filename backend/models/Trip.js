const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    // Kullanıcı bilgileri
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Kiralayan kullanıcı gereklidir']
    },
    
    // Araç bilgileri
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Araç gereklidir']
    },
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Araç sahibi gereklidir']
    },

    // Tarih ve saat bilgileri
    startDate: {
        type: Date,
        required: [true, 'Başlangıç tarihi gereklidir']
    },
    
    endDate: {
        type: Date,
        required: [true, 'Bitiş tarihi gereklidir'],
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
        }
    },

    // Süre hesaplaması
    duration: {
        hours: {
            type: Number,
            default: 0
        },
        days: {
            type: Number,
            default: 0
        }
    },

    // Lokasyon bilgileri
    pickupLocation: {
        address: {
            type: String,
            required: [true, 'Teslim alma adresi gereklidir']
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        notes: String
    },

    dropoffLocation: {
        address: {
            type: String,
            required: [true, 'Teslim etme adresi gereklidir']
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        notes: String
    },

    // Fiyat bilgileri
    pricing: {
        pricePerHour: {
            type: Number,
            required: true
        },
        pricePerDay: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: [true, 'Toplam tutar gereklidir'],
            min: [0, 'Toplam tutar negatif olamaz']
        },
        securityDeposit: {
            type: Number,
            default: 0
        },
        serviceFee: {
            type: Number,
            default: 0
        },
        taxes: {
            type: Number,
            default: 0
        }
    },

    // Yolculuk durumu
    status: {
        type: String,
        enum: [
            'pending',      // Onay bekliyor
            'confirmed',    // Onaylandı
            'active',       // Devam ediyor
            'completed',    // Tamamlandı
            'cancelled',    // İptal edildi
            'rejected'      // Reddedildi
        ],
        default: 'pending'
    },

    // Kilometre bilgileri
    mileage: {
        start: {
            type: Number,
            default: 0
        },
        end: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },

    // Yakıt bilgileri
    fuel: {
        startLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        endLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        refuelCost: {
            type: Number,
            default: 0
        }
    },

    // Ek ücretler
    extraCharges: [{
        type: {
            type: String,
            enum: ['damage', 'cleaning', 'fuel', 'late_return', 'other'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        description: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Değerlendirme
    rating: {
        renterRating: {
            score: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            date: Date
        },
        ownerRating: {
            score: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            date: Date
        }
    },

    // Notlar ve açıklamalar
    notes: {
        renterNotes: String,
        ownerNotes: String,
        adminNotes: String
    },

    // Ödeme bilgileri
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer'],
            default: 'credit_card'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date,
        refundedAt: Date
    },

    // İptal bilgileri
    cancellation: {
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancelledAt: Date,
        reason: String,
        refundAmount: {
            type: Number,
            default: 0
        }
    },

    // Belge ve fotoğraflar
    documents: {
        contract: {
            url: String,
            signedAt: Date
        },
        startPhotos: [{
            url: String,
            description: String,
            takenAt: {
                type: Date,
                default: Date.now
            }
        }],
        endPhotos: [{
            url: String,
            description: String,
            takenAt: {
                type: Date,
                default: Date.now
            }
        }]
    }
}, {
    timestamps: true
});

// Virtual field - toplam süre hesaplaması
tripSchema.virtual('totalDuration').get(function() {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        return {
            hours: diffHours,
            days: diffDays,
            remainingHours: diffHours % 24
        };
    }
    return null;
});

// Middleware - süre hesaplaması
tripSchema.pre('save', function(next) {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        this.duration.hours = diffHours;
        this.duration.days = Math.floor(diffHours / 24);
    }
    next();
});

// Index'ler
tripSchema.index({ renter: 1, status: 1 });
tripSchema.index({ vehicle: 1, status: 1 });
tripSchema.index({ owner: 1, status: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema); 