const mongoose = require('mongoose');

const rideBookingSchema = new mongoose.Schema({
    // Yolculuk 
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: [true, 'Yolculuk gereklidir']
    },

    // Katılımcı (yolcu)
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Yolcu gereklidir']
    },

    // İstenen koltuk sayısı
    seatsRequested: {
        type: Number,
        required: [true, 'Koltuk sayısı gereklidir'],
        min: [1, 'En az 1 koltuk gereklidir'],
        max: [4, 'En fazla 4 koltuk talep edilebilir']
    },

    // Rezervasyon durumu
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'awaiting_payment', 'payment_expired', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },

    // Ödeme durumu
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'expired'],
        default: 'pending'
    },

    // Ödeme detayları
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentExpiryDate: Date,
        amount: {
            type: Number,
            required: true
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        refundDate: Date
    },

    // Binme/İnme noktaları
    pickupPoint: {
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        notes: String
    },

    dropoffPoint: {
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        notes: String
    },

    // Yanıt tarihi (sürücü onayladığında/reddettiğinde)
    responseDate: Date,

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

    // Ek notlar
    notes: {
        passenger: String,
        driver: String
    },

    // Değerlendirme
    rating: {
        passengerToDriver: {
            score: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            ratedAt: Date
        },
        driverToPassenger: {
            score: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            ratedAt: Date
        }
    }
}, {
    timestamps: true
});

// Indexes
rideBookingSchema.index({ ride: 1, passenger: 1 });
rideBookingSchema.index({ passenger: 1, status: 1 });
rideBookingSchema.index({ status: 1, createdAt: -1 });

// Middleware - yolculuk kalan koltuk sayısını otomatik güncelle
rideBookingSchema.post('save', async function() {
    const Ride = require('./Ride');
    const ride = await Ride.findById(this.ride);
    
    if (ride) {
        // Aktif rezervasyonları say (pending, awaiting_payment, confirmed)
        const activeBookings = await mongoose.model('RideBooking').find({
            ride: this.ride,
            status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
        });

        const occupiedSeats = activeBookings.reduce((total, booking) => 
            total + booking.seatsRequested, 0
        );

        const remainingSeats = ride.availableSeats - occupiedSeats;

        // Yolculuk durumunu güncelle
        if (remainingSeats <= 0 && ride.status === 'active') {
            // Koltuklar dolu - yolculuğu pasif yap
            ride.status = 'full';
        } else if (remainingSeats > 0 && ride.status === 'full') {
            // Koltuklar boşaldı - yolculuğu aktif yap
            ride.status = 'active';
        }

        await ride.save();
    }
});

// Middleware - ödeme süresi dolduğunda otomatik güncelleme
rideBookingSchema.post('findOneAndUpdate', async function() {
    const booking = this.getUpdate();
    
    // Eğer ödeme süresi dolmuşsa yolculuk durumunu güncelle
    if (booking && (booking.status === 'payment_expired' || booking.status === 'rejected' || booking.status === 'cancelled')) {
        const Ride = require('./Ride');
        const rideBooking = await mongoose.model('RideBooking').findById(this.getQuery()._id);
        
        if (rideBooking) {
            const ride = await Ride.findById(rideBooking.ride);
            
            if (ride) {
                // Aktif rezervasyonları tekrar say
                const activeBookings = await mongoose.model('RideBooking').find({
                    ride: ride._id,
                    status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
                });

                const occupiedSeats = activeBookings.reduce((total, b) => 
                    total + b.seatsRequested, 0
                );

                const remainingSeats = ride.availableSeats - occupiedSeats;

                // Yolculuğu tekrar aktif yap eğer yer varsa
                if (remainingSeats > 0 && ride.status === 'full') {
                    ride.status = 'active';
                    await ride.save();
                }
            }
        }
    }
});

module.exports = mongoose.model('RideBooking', rideBookingSchema); 