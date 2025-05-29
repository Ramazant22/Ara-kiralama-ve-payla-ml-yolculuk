const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Konuşmaya katılan kullanıcılar
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Konuşma türü (vehicle rental veya ride sharing)
    type: {
        type: String,
        enum: ['vehicle_rental', 'ride_sharing', 'general'],
        required: true
    },

    // İlgili rezervasyon/yolculuk
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },

    relatedModel: {
        type: String,
        enum: ['Booking', 'RideBooking', 'Vehicle', 'Ride']
    },

    // Son mesaj bilgisi
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sentAt: Date,
        messageType: {
            type: String,
            enum: ['text', 'image', 'location', 'system'],
            default: 'text'
        }
    },

    // Konuşma başlığı
    title: {
        type: String,
        required: true
    },

    // Aktif/pasif durum
    isActive: {
        type: Boolean,
        default: true
    },

    // Okunmamış mesaj sayıları (her kullanıcı için)
    unreadCounts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        count: {
            type: Number,
            default: 0
        }
    }],

    // Konuşma ayarları
    settings: {
        allowNotifications: {
            type: Boolean,
            default: true
        },
        autoDelete: {
            enabled: {
                type: Boolean,
                default: false
            },
            daysAfter: {
                type: Number,
                default: 30
            }
        }
    }
}, {
    timestamps: true
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1, relatedTo: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });
conversationSchema.index({ participants: 1, 'lastMessage.sentAt': -1 });

// Virtual for getting other participant (in 2-person conversations)
conversationSchema.virtual('otherParticipant').get(function() {
    if (this.participants.length === 2) {
        return this.participants.find(p => p._id.toString() !== this.currentUserId?.toString());
    }
    return null;
});

// Helper method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
    return this.participants.some(p => p._id.toString() === userId.toString());
};

// Helper method to get unread count for specific user
conversationSchema.methods.getUnreadCount = function(userId) {
    const userUnread = this.unreadCounts.find(uc => uc.user.toString() === userId.toString());
    return userUnread ? userUnread.count : 0;
};

// Helper method to update unread count
conversationSchema.methods.updateUnreadCount = function(userId, count) {
    const existingUnread = this.unreadCounts.find(uc => uc.user.toString() === userId.toString());
    if (existingUnread) {
        existingUnread.count = count;
    } else {
        this.unreadCounts.push({ user: userId, count });
    }
};

module.exports = mongoose.model('Conversation', conversationSchema); 