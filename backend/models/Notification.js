const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Alıcı gereklidir']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    type: {
        type: String,
        enum: [
            'booking_request', 'booking_confirmed', 'booking_rejected', 'payment_reminder', 'payment_expired', 'vehicle_received', 'rental_completed',
            'ride_join_request', 'ride_booking_approved', 'ride_booking_rejected', 'ride_payment_expired', 'ride_completed'
        ],
        required: [true, 'Bildirim tipi gereklidir']
    },
    title: {
        type: String,
        required: [true, 'Başlık gereklidir']
    },
    message: {
        type: String,
        required: [true, 'Mesaj gereklidir']
    },
    data: {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActionRequired: {
        type: Boolean,
        default: false
    },
    actions: [{
        type: {
            type: String,
            enum: ['approve', 'reject', 'pay', 'confirm_received']
        },
        label: String,
        url: String
    }]
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 