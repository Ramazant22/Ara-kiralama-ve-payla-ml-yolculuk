const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    // Yolculuk oluşturan sürücü
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sürücü gereklidir']
    },

    // Başlangıç ve varış noktaları
    from: {
        city: {
            type: String,
            required: [true, 'Başlangıç şehri gereklidir']
        },
        district: String,
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        }
    },

    to: {
        city: {
            type: String,
            required: [true, 'Varış şehri gereklidir']
        },
        district: String,
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        }
    },

    // Tarih ve saat
    departureDate: {
        type: Date,
        required: [true, 'Kalkış tarihi gereklidir']
    },

    departureTime: {
        type: String,
        required: [true, 'Kalkış saati gereklidir'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
    },

    // Tahmini varış zamanı
    estimatedArrival: {
        type: Date,
        required: false
    },

    // Kapasite ve fiyat
    availableSeats: {
        type: Number,
        required: [true, 'Müsait koltuk sayısı gereklidir'],
        min: [1, 'En az 1 koltuk olmalıdır'],
        max: [8, 'En fazla 8 koltuk olabilir']
    },

    pricePerSeat: {
        type: Number,
        required: [true, 'Koltuk başına fiyat gereklidir'],
        min: [0, 'Fiyat negatif olamaz']
    },

    // Araç bilgileri
    vehicle: {
        make: {
            type: String,
            required: [true, 'Araç markası gereklidir']
        },
        model: {
            type: String,
            required: [true, 'Araç modeli gereklidir']
        },
        year: {
            type: Number,
            required: [true, 'Araç yılı gereklidir']
        },
        color: String,
        licensePlate: {
            type: String,
            required: [true, 'Plaka gereklidir']
        },
        images: [{
            url: String,
            description: String
        }]
    },

    // Yolculuk durumu
    status: {
        type: String,
        enum: ['active', 'full', 'completed', 'cancelled'],
        default: 'active'
    },

    // Katılımcılar
    passengers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        seatsRequested: {
            type: Number,
            default: 1,
            min: 1
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        requestDate: {
            type: Date,
            default: Date.now
        },
        responseDate: Date,
        pickupPoint: {
            address: String,
            coordinates: [Number]
        },
        dropoffPoint: {
            address: String,
            coordinates: [Number]
        }
    }],

    // Yolculuk özellikleri
    preferences: {
        smokingAllowed: {
            type: Boolean,
            default: false
        },
        petsAllowed: {
            type: Boolean,
            default: false
        },
        musicAllowed: {
            type: Boolean,
            default: true
        },
        conversationLevel: {
            type: String,
            enum: ['quiet', 'moderate', 'chatty'],
            default: 'moderate'
        }
    },

    // Ek bilgiler
    description: {
        type: String,
        maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
    },

    notes: {
        type: String,
        maxlength: [200, 'Notlar 200 karakterden uzun olamaz']
    },

    // Duraklama noktaları
    stops: [{
        city: String,
        district: String,
        address: String,
        estimatedArrival: Date,
        duration: Number // dakika cinsinden
    }],

    // Değerlendirmeler
    ratings: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],

    // Mesafe ve süre (tahmini)
    estimatedDistance: {
        type: Number, // km cinsinden
        required: false
    },

    estimatedDuration: {
        type: Number, // dakika cinsinden
        required: false
    }
}, {
    timestamps: true
});

// Virtual field - kalan koltuk sayısı
rideSchema.virtual('remainingSeats').get(function() {
    const acceptedPassengers = this.passengers.filter(p => p.status === 'accepted');
    const occupiedSeats = acceptedPassengers.reduce((total, passenger) => total + passenger.seatsRequested, 0);
    return this.availableSeats - occupiedSeats;
});

// Virtual field - yolculuk dolu mu?
rideSchema.virtual('isFull').get(function() {
    return this.remainingSeats <= 0;
});

// Middleware - yolculuk durumunu otomatik güncelle
rideSchema.pre('save', function(next) {
    if (this.remainingSeats <= 0 && this.status === 'active') {
        this.status = 'full';
    } else if (this.remainingSeats > 0 && this.status === 'full') {
        this.status = 'active';
    }
    next();
});

// Index'ler
rideSchema.index({ 'from.city': 1, 'to.city': 1, departureDate: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ departureDate: 1, status: 1 });
rideSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema); 