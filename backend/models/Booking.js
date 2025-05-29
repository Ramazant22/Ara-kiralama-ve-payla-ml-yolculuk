const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Kiralayan gereklidir']
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Araç gereklidir']
    },
    startDate: {
        type: Date,
        required: [true, 'Başlangıç tarihi gereklidir']
    },
    endDate: {
        type: Date,
        required: [true, 'Bitiş tarihi gereklidir']
    },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Teslim alma koordinatları gereklidir']
        },
        address: {
            type: String,
            required: [true, 'Teslim alma adresi gereklidir']
        }
    },
    returnLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'İade koordinatları gereklidir']
        },
        address: {
            type: String,
            required: [true, 'İade adresi gereklidir']
        }
    },
    totalHours: {
        type: Number,
        required: [true, 'Toplam saat gereklidir'],
        min: [1, 'Minimum 1 saat olmalıdır']
    },
    totalDays: {
        type: Number,
        required: [true, 'Toplam gün gereklidir'],
        min: [0, 'Minimum 0 gün olmalıdır']
    },
    pricing: {
        hourlyRate: {
            type: Number,
            required: true
        },
        dailyRate: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        serviceFee: {
            type: Number,
            default: 0
        },
        insurance: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'awaiting_payment', 'payment_expired', 'ongoing', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'expired'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer'],
        default: 'credit_card'
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentExpiryDate: Date,
        refundAmount: {
            type: Number,
            default: 0
        },
        refundDate: Date
    },
    actualPickupTime: {
        type: Date
    },
    actualReturnTime: {
        type: Date
    },
    mileage: {
        pickup: {
            type: Number,
            default: 0
        },
        return: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    fuelLevel: {
        pickup: {
            type: String,
            enum: ['empty', 'quarter', 'half', 'three_quarter', 'full'],
            default: 'full'
        },
        return: {
            type: String,
            enum: ['empty', 'quarter', 'half', 'three_quarter', 'full'],
            default: 'full'
        }
    },
    condition: {
        pickup: {
            exterior: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor'],
                default: 'excellent'
            },
            interior: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor'],
                default: 'excellent'
            },
            notes: String,
            photos: [String]
        },
        return: {
            exterior: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor']
            },
            interior: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor']
            },
            notes: String,
            photos: [String],
            damages: [{
                description: String,
                severity: {
                    type: String,
                    enum: ['minor', 'moderate', 'major']
                },
                estimatedCost: Number,
                photo: String
            }]
        }
    },
    insurance: {
        included: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            enum: ['basic', 'comprehensive', 'premium'],
            default: 'basic'
        },
        deductible: {
            type: Number,
            default: 500
        }
    },
    extras: [{
        name: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    rating: {
        vehicleRating: {
            type: Number,
            min: 1,
            max: 5
        },
        ownerRating: {
            type: Number,
            min: 1,
            max: 5
        },
        renterRating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        ratedAt: Date
    },
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
    specialRequests: [{
        request: String,
        approved: {
            type: Boolean,
            default: false
        },
        response: String
    }],
    notes: {
        renter: String,
        owner: String,
        admin: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ vehicle: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

// Validation for date logic
bookingSchema.pre('save', function(next) {
    if (this.startDate >= this.endDate) {
        return next(new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır'));
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema); 