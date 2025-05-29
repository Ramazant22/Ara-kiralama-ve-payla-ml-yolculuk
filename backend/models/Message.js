const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Hangi konuşmaya ait
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },

    // Mesajı gönderen
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Mesaj türü
    messageType: {
        type: String,
        enum: ['text', 'image', 'location', 'system', 'file'],
        default: 'text'
    },

    // Mesaj içeriği
    content: {
        type: String,
        required: function() {
            return this.messageType === 'text' || this.messageType === 'system';
        }
    },

    // Dosya/medya bilgileri
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'file', 'location']
        },
        url: String,
        filename: String,
        size: Number,
        mimeType: String,
        // Konum bilgisi için
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        address: String
    }],

    // Mesaj durumu
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },

    // Okunma bilgileri
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Yanıtlanan mesaj (reply)
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },

    // Mesaj düzenleme bilgisi
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        }
    }],

    isEdited: {
        type: Boolean,
        default: false
    },

    // Silinmiş mi?
    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: Date,

    // Sistem mesajları için özel veriler
    systemData: {
        action: String, // 'booking_approved', 'payment_received', etc.
        data: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Pre-save middleware - konuşmanın son mesajını güncelle
messageSchema.post('save', async function() {
    try {
        const Conversation = require('./Conversation');
        
        const conversation = await Conversation.findById(this.conversation);
        if (conversation) {
            // Son mesaj bilgisini güncelle
            conversation.lastMessage = {
                content: this.content,
                sender: this.sender,
                sentAt: this.createdAt,
                messageType: this.messageType
            };

            // Diğer katılımcıların okunmamış mesaj sayısını artır
            conversation.participants.forEach(participantId => {
                if (participantId.toString() !== this.sender.toString()) {
                    const existingUnread = conversation.unreadCounts.find(
                        uc => uc.user.toString() === participantId.toString()
                    );
                    
                    if (existingUnread) {
                        existingUnread.count += 1;
                    } else {
                        conversation.unreadCounts.push({
                            user: participantId,
                            count: 1
                        });
                    }
                }
            });

            await conversation.save();
        }
    } catch (error) {
        console.error('Message post-save middleware error:', error);
    }
});

// Helper method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
    const existingRead = this.readBy.find(rb => rb.user.toString() === userId.toString());
    if (!existingRead) {
        this.readBy.push({ user: userId });
        this.status = 'read';
    }
};

// Helper method to check if message is read by user
messageSchema.methods.isReadBy = function(userId) {
    return this.readBy.some(rb => rb.user.toString() === userId.toString());
};

module.exports = mongoose.model('Message', messageSchema); 