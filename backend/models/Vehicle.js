const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Araç sahibi gereklidir']
    },
    make: {
        type: String,
        required: [true, 'Araç markası gereklidir'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Araç modeli gereklidir'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Araç yılı gereklidir'],
        min: [1990, 'Araç 1990 yılından eski olamaz'],
        max: [new Date().getFullYear() + 1, 'Araç gelecek yıla ait olamaz']
    },
    licensePlate: {
        type: String,
        required: [true, 'Plaka gereklidir'],
        unique: true,
        uppercase: true,
        match: [/^[0-9]{2}\s*[A-Z]{1,4}\s*[0-9]{1,4}$/, 'Geçerli bir plaka giriniz']
    },
    color: {
        type: String,
        required: [true, 'Araç rengi gereklidir'],
        trim: true
    },
    fuelType: {
        type: String,
        enum: ['benzin', 'dizel', 'elektrik', 'hibrit', 'lpg'],
        required: [true, 'Yakıt türü gereklidir']
    },
    transmission: {
        type: String,
        enum: ['manuel', 'otomatik'],
        required: [true, 'Şanzıman türü gereklidir']
    },
    seats: {
        type: Number,
        required: [true, 'Koltuk sayısı gereklidir'],
        min: [2, 'Minimum 2 koltuk olmalıdır'],
        max: [9, 'Maksimum 9 koltuk olabilir']
    },
    category: {
        type: String,
        enum: ['ekonomi', 'kompakt', 'orta', 'büyük', 'lüks', 'suv', 'minivan'],
        required: [true, 'Araç kategorisi gereklidir']
    },
    features: [{
        type: String,
        enum: [
            'klima', 'gps', 'bluetooth', 'usb', 'wifi',
            'geri_vites_kamerasi', 'park_sensoru', 'sunroof',
            'deri_koltuk', 'elektrikli_cam', 'merkezi_kilit'
        ]
    }],
    pricePerHour: {
        type: Number,
        required: [true, 'Saatlik ücret gereklidir'],
        min: [10, 'Minimum saatlik ücret 10 TL olmalıdır']
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Günlük ücret gereklidir'],
        min: [100, 'Minimum günlük ücret 100 TL olmalıdır']
    },
    location: {
        city: {
            type: String,
            required: [true, 'İl gereklidir']
        },
        district: {
            type: String,
            required: [true, 'İlçe gereklidir']
        },
        neighborhood: {
            type: String
        },
        address: {
            type: String,
            required: [true, 'Adres gereklidir']
        }
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    documents: {
        registration: {
            url: String,
            verified: {
                type: Boolean,
                default: false
            }
        },
        insurance: {
            url: String,
            expiryDate: Date,
            verified: {
                type: Boolean,
                default: false
            }
        }
    },
    status: {
        type: String,
        enum: ['available', 'pending', 'rented', 'maintenance', 'inactive'],
        default: 'available'
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient searching
vehicleSchema.index({ 'location.city': 1, 'location.district': 1, status: 1, isActive: 1 });
vehicleSchema.index({ owner: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema); 