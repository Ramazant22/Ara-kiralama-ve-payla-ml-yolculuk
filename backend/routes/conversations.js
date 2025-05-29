const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Kullanıcının konuşmalarını listele
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;

        let query = { 
            participants: req.user._id,
            isActive: true 
        };

        if (type && ['vehicle_rental', 'ride_sharing', 'general'].includes(type)) {
            query.type = type;
        }

        const conversations = await Conversation.find(query)
            .populate('participants', 'firstName lastName avatar isOnline lastActive')
            .populate('relatedTo')
            .sort({ 'lastMessage.sentAt': -1 })
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .lean();

        // Her konuşma için okunmamış mesaj sayısını ekle
        const conversationsWithUnread = conversations.map(conv => {
            const unreadCount = conv.unreadCounts?.find(
                uc => uc.user.toString() === req.user._id.toString()
            )?.count || 0;

            return {
                ...conv,
                unreadCount,
                otherParticipant: conv.participants.find(
                    p => p._id.toString() !== req.user._id.toString()
                )
            };
        });

        const total = await Conversation.countDocuments(query);

        res.json({
            conversations: conversationsWithUnread,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni konuşma başlat veya mevcut konuşmayı getir
router.post('/start', authenticateToken, [
    body('participantId').isMongoId().withMessage('Geçerli kullanıcı ID gereklidir'),
    body('type').isIn(['vehicle_rental', 'ride_sharing', 'general']).withMessage('Geçerli konuşma türü gereklidir'),
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Başlık 1-100 karakter arası olmalıdır'),
    body('relatedTo').optional().isMongoId().withMessage('Geçerli ID gereklidir'),
    body('relatedModel').optional().isIn(['Booking', 'RideBooking', 'Vehicle', 'Ride'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { participantId, type, title, relatedTo, relatedModel } = req.body;

        // Kendisiyle konuşma başlatamasın
        if (participantId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Kendinizle mesajlaşamazsınız' });
        }

        // Mevcut konuşma var mı kontrol et
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, participantId] },
            type,
            ...(relatedTo && { relatedTo }),
            isActive: true
        }).populate('participants', 'firstName lastName avatar isOnline lastActive');

        if (!conversation) {
            // Yeni konuşma oluştur
            const newConversation = new Conversation({
                participants: [req.user._id, participantId],
                type,
                title: title || `${type === 'vehicle_rental' ? 'Araç Kiralama' : type === 'ride_sharing' ? 'Yolculuk Paylaşımı' : 'Genel'} Konuşması`,
                relatedTo,
                relatedModel,
                unreadCounts: [
                    { user: req.user._id, count: 0 },
                    { user: participantId, count: 0 }
                ]
            });

            await newConversation.save();

            conversation = await Conversation.findById(newConversation._id)
                .populate('participants', 'firstName lastName avatar isOnline lastActive');
        }

        // Okunmamış mesaj sayısını ekle
        const unreadCount = conversation.unreadCounts?.find(
            uc => uc.user.toString() === req.user._id.toString()
        )?.count || 0;

        res.json({
            conversation: {
                ...conversation.toObject(),
                unreadCount,
                otherParticipant: conversation.participants.find(
                    p => p._id.toString() !== req.user._id.toString()
                )
            }
        });

    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Konuşma detayını getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('participants', 'firstName lastName avatar isOnline lastActive')
            .populate('relatedTo');

        if (!conversation) {
            return res.status(404).json({ message: 'Konuşma bulunamadı' });
        }

        // Kullanıcı bu konuşmanın katılımcısı mı?
        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok' });
        }

        // Okunmamış mesaj sayısını sıfırla
        conversation.updateUnreadCount(req.user._id, 0);
        await conversation.save();

        const unreadCount = 0;

        res.json({
            conversation: {
                ...conversation.toObject(),
                unreadCount,
                otherParticipant: conversation.participants.find(
                    p => p._id.toString() !== req.user._id.toString()
                )
            }
        });

    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Konuşmayı sil/gizle
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ message: 'Konuşma bulunamadı' });
        }

        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        // Konuşmayı pasif yap (soft delete)
        conversation.isActive = false;
        await conversation.save();

        res.json({ message: 'Konuşma silindi' });

    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Okunmamış mesaj sayılarını getir
router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
            isActive: true
        });

        const totalUnread = conversations.reduce((total, conv) => {
            const userUnread = conv.unreadCounts?.find(
                uc => uc.user.toString() === req.user._id.toString()
            );
            return total + (userUnread?.count || 0);
        }, 0);

        res.json({ totalUnread });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 