const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Konuşmanın mesajlarını listele
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Konuşma kontrolü
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Konuşma bulunamadı' });
        }

        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok' });
        }

        const messages = await Message.find({
            conversation: conversationId,
            isDeleted: false
        })
            .populate('sender', 'firstName lastName avatar')
            .populate('replyTo', 'content sender messageType')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        // Mesajları okundu olarak işaretle
        const unreadMessages = messages.filter(msg => 
            msg.sender._id.toString() !== req.user._id.toString() && 
            !msg.isReadBy(req.user._id)
        );

        if (unreadMessages.length > 0) {
            await Promise.all(
                unreadMessages.map(async (msg) => {
                    msg.markAsRead(req.user._id);
                    await msg.save();
                })
            );

            // Konuşmanın okunmamış sayısını sıfırla
            conversation.updateUnreadCount(req.user._id, 0);
            await conversation.save();
        }

        const total = await Message.countDocuments({
            conversation: conversationId,
            isDeleted: false
        });

        res.json({
            messages: messages.reverse(), // Eskiden yeniye sırala
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni mesaj gönder
router.post('/', authenticateToken, [
    body('conversationId').isMongoId().withMessage('Geçerli konuşma ID gereklidir'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Mesaj 1-1000 karakter arası olmalıdır'),
    body('messageType').optional().isIn(['text', 'image', 'location', 'file']).withMessage('Geçerli mesaj türü seçiniz'),
    body('replyTo').optional().isMongoId().withMessage('Geçerli mesaj ID gereklidir')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { conversationId, content, messageType = 'text', replyTo, attachments = [] } = req.body;

        // Konuşma kontrolü
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Konuşma bulunamadı' });
        }

        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({ message: 'Bu konuşmaya mesaj gönderme yetkiniz yok' });
        }

        // Yanıtlanan mesaj kontrolü
        if (replyTo) {
            const originalMessage = await Message.findById(replyTo);
            if (!originalMessage || originalMessage.conversation.toString() !== conversationId) {
                return res.status(400).json({ message: 'Yanıtlanan mesaj bulunamadı' });
            }
        }

        const message = new Message({
            conversation: conversationId,
            sender: req.user._id,
            content,
            messageType,
            replyTo,
            attachments,
            readBy: [{ user: req.user._id }] // Gönderen otomatik okundu
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'firstName lastName avatar')
            .populate('replyTo', 'content sender messageType');

        res.status(201).json({
            message: 'Mesaj gönderildi',
            data: populatedMessage
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Mesajı düzenle
router.patch('/:id', authenticateToken, [
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Mesaj 1-1000 karakter arası olmalıdır')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { content } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }

        // Sadece gönderen düzenleyebilir
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu mesajı düzenleme yetkiniz yok' });
        }

        // 15 dakika sonra düzenlenemez
        const now = new Date();
        const messageTime = new Date(message.createdAt);
        const diffInMinutes = (now - messageTime) / (1000 * 60);

        if (diffInMinutes > 15) {
            return res.status(400).json({ message: 'Mesaj 15 dakika sonra düzenlenemez' });
        }

        // Düzenleme geçmişine ekle
        message.editHistory.push({
            content: message.content,
            editedAt: new Date()
        });

        message.content = content;
        message.isEdited = true;
        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'firstName lastName avatar');

        res.json({
            message: 'Mesaj düzenlendi',
            data: populatedMessage
        });

    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Mesajı sil
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }

        // Sadece gönderen silebilir
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu mesajı silme yetkiniz yok' });
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = 'Bu mesaj silindi';
        await message.save();

        res.json({ message: 'Mesaj silindi' });

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Mesajı okundu olarak işaretle
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }

        // Konuşma katılımcısı kontrolü
        const conversation = await Conversation.findById(message.conversation);
        if (!conversation || !conversation.isParticipant(req.user._id)) {
            return res.status(403).json({ message: 'Bu mesajı okuma yetkiniz yok' });
        }

        message.markAsRead(req.user._id);
        await message.save();

        res.json({ message: 'Mesaj okundu olarak işaretlendi' });

    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Sistem mesajı gönder (internal use)
router.post('/system', authenticateToken, [
    body('conversationId').isMongoId().withMessage('Geçerli konuşma ID gereklidir'),
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Mesaj 1-500 karakter arası olmalıdır'),
    body('systemData.action').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { conversationId, content, systemData } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Konuşma bulunamadı' });
        }

        const systemMessage = new Message({
            conversation: conversationId,
            sender: req.user._id,
            content,
            messageType: 'system',
            systemData,
            readBy: conversation.participants.map(p => ({ user: p }))
        });

        await systemMessage.save();

        const populatedMessage = await Message.findById(systemMessage._id)
            .populate('sender', 'firstName lastName avatar');

        res.status(201).json({
            message: 'Sistem mesajı gönderildi',
            data: populatedMessage
        });

    } catch (error) {
        console.error('Send system message error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 