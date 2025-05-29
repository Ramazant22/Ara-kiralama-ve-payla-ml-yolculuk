const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Ad gereklidir'],
        trim: true,
        maxlength: [50, 'Ad 50 karakterden uzun olamaz']
    },
    lastName: {
        type: String,
        required: [true, 'Soyad gereklidir'],
        trim: true,
        maxlength: [50, 'Soyad 50 karakterden uzun olamaz']
    },
    email: {
        type: String,
        required: [true, 'Email gereklidir'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Geçerli bir email adresi giriniz'
        ]
    },
    password: {
        type: String,
        required: [true, 'Şifre gereklidir'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır']
    },
    phone: {
        type: String,
        required: [true, 'Telefon numarası gereklidir'],
        match: [/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz']
    },
    avatar: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Doğum tarihi gereklidir']
    },
    drivingLicense: {
        number: String,
        expiryDate: Date,
        verified: {
            type: Boolean,
            default: false
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'Türkiye'
        }
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
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Şifre hash'leme middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// JSON'da şifre alanını gizle
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema); 