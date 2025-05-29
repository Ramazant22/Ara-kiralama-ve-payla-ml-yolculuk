const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Kullanıcının bildirimlerini getir
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const query = { recipient: req.user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'firstName lastName avatar')
            .populate('data.bookingId', 'startDate endDate pricing')
            .populate('data.vehicleId', 'make model year')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({
            notifications,
            unreadCount,
            totalPages: Math.ceil(notifications.length / limit),
            currentPage: page
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Bildirimi okundu olarak işaretle
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Bildirim bulunamadı' });
        }

        res.json({ message: 'Bildirim okundu olarak işaretlendi' });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Tüm bildirimleri okundu olarak işaretle
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });

    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Bildirim oluştur (helper function)
const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};

module.exports = { router, createNotification }; 