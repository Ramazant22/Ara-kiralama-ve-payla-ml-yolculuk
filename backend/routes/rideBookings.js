const express = require('express');
const { body, validationResult } = require('express-validator');
const RideBooking = require('../models/RideBooking');
const Ride = require('../models/Ride');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Kullanıcının yolculuk rezervasyonlarını listele
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const { type, status } = req.query;

        let query = {};

        if (type === 'passenger') {
            query.passenger = req.user._id;
        } else if (type === 'driver') {
            // Kullanıcının yolculuklarına yapılan rezervasyonlar
            const userRides = await Ride.find({ driver: req.user._id }).select('_id');
            const rideIds = userRides.map(r => r._id);
            query.ride = { $in: rideIds };
        } else {
            // Her iki durumu da getir
            const userRides = await Ride.find({ driver: req.user._id }).select('_id');
            const rideIds = userRides.map(r => r._id);
            query = {
                $or: [
                    { passenger: req.user._id },
                    { ride: { $in: rideIds } }
                ]
            };
        }

        if (status) {
            query.status = status;
        }

        const bookings = await RideBooking.find(query)
            .populate('passenger', 'firstName lastName rating avatar')
            .populate({
                path: 'ride',
                populate: {
                    path: 'driver',
                    select: 'firstName lastName rating avatar'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ bookings });

    } catch (error) {
        console.error('Get my ride bookings error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuğa katılım talebi gönder
router.post('/', authenticateToken, [
    body('rideId').isMongoId().withMessage('Geçerli bir yolculuk ID giriniz'),
    body('seatsRequested').isInt({ min: 1, max: 4 }).withMessage('Koltuk sayısı 1-4 arası olmalıdır'),
    body('pickupAddress').optional().trim(),
    body('dropoffAddress').optional().trim(),
    body('notes').optional().trim().isLength({ max: 200 }).withMessage('Notlar 200 karakterden uzun olamaz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { rideId, seatsRequested, pickupAddress, dropoffAddress, notes } = req.body;

        // Yolculuk kontrolü
        const ride = await Ride.findById(rideId).populate('driver', 'firstName lastName');
        if (!ride) {
            return res.status(404).json({
                message: 'Yolculuk bulunamadı'
            });
        }

        // Kendi yolculuğuna katılamaz
        if (ride.driver._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Kendi yolculuğunuza katılamazsınız'
            });
        }

        // Yolculuk durumu kontrolü
        if (ride.status !== 'active') {
            return res.status(400).json({
                message: 'Bu yolculuk katılıma açık değil'
            });
        }

        // Zaten katılım talebi göndermiş mi kontrol et
        const existingRequest = await RideBooking.findOne({
            ride: rideId,
            passenger: req.user._id,
            status: { $in: ['pending', 'approved', 'awaiting_payment', 'confirmed'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'Bu yolculuk için zaten aktif bir talebiniz bulunuyor'
            });
        }

        // Kalan koltuk kontrolü
        const confirmedBookings = await RideBooking.find({
            ride: rideId,
            status: { $in: ['confirmed', 'awaiting_payment'] }
        });

        const occupiedSeats = confirmedBookings.reduce((total, booking) => 
            total + booking.seatsRequested, 0
        );
        const remainingSeats = ride.availableSeats - occupiedSeats;

        if (seatsRequested > remainingSeats) {
            return res.status(400).json({
                message: `Yeterli koltuk bulunmuyor. Kalan koltuk: ${remainingSeats}`
            });
        }

        // Fiyat hesaplama
        const totalAmount = seatsRequested * ride.pricePerSeat;

        const booking = new RideBooking({
            ride: rideId,
            passenger: req.user._id,
            seatsRequested,
            pickupPoint: pickupAddress ? { address: pickupAddress } : undefined,
            dropoffPoint: dropoffAddress ? { address: dropoffAddress } : undefined,
            paymentDetails: {
                amount: totalAmount
            },
            notes: {
                passenger: notes || ''
            }
        });

        await booking.save();

        // Sürücüye bildirim gönder
        await createNotification({
            recipient: ride.driver._id,
            sender: req.user._id,
            type: 'ride_join_request',
            title: 'Yeni Katılım İsteği',
            message: `${req.user.firstName} ${req.user.lastName} ${ride.from.city} - ${ride.to.city} yolculuğunuza katılım isteğinde bulundu.`,
            data: {
                bookingId: booking._id,
                rideId: ride._id
            },
            isActionRequired: true,
            actions: [
                { type: 'approve', label: 'Onayla', url: `/ride-bookings/${booking._id}` },
                { type: 'reject', label: 'Reddet', url: `/ride-bookings/${booking._id}` }
            ]
        });

        const populatedBooking = await RideBooking.findById(booking._id)
            .populate('passenger', 'firstName lastName email')
            .populate('ride', 'from to departureDate departureTime driver')
            .populate('ride.driver', 'firstName lastName');

        res.status(201).json({
            message: 'Katılım talebiniz gönderildi',
            booking: populatedBooking
        });

    } catch (error) {
        console.error('Create ride booking error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Katılım talebini onayla (sürücü)
router.patch('/:id/approve', authenticateToken, async (req, res) => {
    try {
        const booking = await RideBooking.findById(req.params.id)
            .populate('ride', 'driver from to')
            .populate('passenger', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece sürücü onaylayabilir
        if (booking.ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Bu rezervasyon artık onaylanamaz' });
        }

        // Koltuk durumu tekrar kontrol et
        const confirmedBookings = await RideBooking.find({
            ride: booking.ride._id,
            status: { $in: ['confirmed', 'awaiting_payment'] },
            _id: { $ne: booking._id }
        });

        const occupiedSeats = confirmedBookings.reduce((total, b) => 
            total + b.seatsRequested, 0
        );

        const ride = await Ride.findById(booking.ride._id);
        const remainingSeats = ride.availableSeats - occupiedSeats;

        if (booking.seatsRequested > remainingSeats) {
            return res.status(400).json({ 
                message: `Yeterli koltuk bulunmuyor. Kalan koltuk: ${remainingSeats}` 
            });
        }

        // Ödeme bekleme durumuna geçir ve 15 dakika süre ver
        const paymentExpiryDate = new Date();
        paymentExpiryDate.setMinutes(paymentExpiryDate.getMinutes() + 15);

        booking.status = 'awaiting_payment';
        booking.paymentDetails.paymentExpiryDate = paymentExpiryDate;
        booking.responseDate = new Date();
        await booking.save();

        // Yolcuya ödeme bildirimi gönder
        await createNotification({
            recipient: booking.passenger._id,
            sender: req.user._id,
            type: 'ride_booking_approved',
            title: 'Katılım İsteği Onaylandı',
            message: `${booking.ride.from.city} - ${booking.ride.to.city} yolculuğuna katılım isteğiniz onaylandı! 15 dakika içinde ödeme yapmanız gerekmektedir.`,
            data: {
                bookingId: booking._id,
                rideId: booking.ride._id
            },
            isActionRequired: true,
            actions: [
                { type: 'pay', label: 'Ödeme Yap', url: `/ride-bookings/${booking._id}/payment` }
            ]
        });

        // 15 dakika sonra ödeme yapılmazsa otomatik iptal
        setTimeout(async () => {
            try {
                const currentBooking = await RideBooking.findById(booking._id);
                if (currentBooking && currentBooking.status === 'awaiting_payment' && currentBooking.paymentStatus === 'pending') {
                    currentBooking.status = 'payment_expired';
                    currentBooking.paymentStatus = 'expired';
                    await currentBooking.save();

                    // Bildirim gönder
                    await createNotification({
                        recipient: booking.passenger._id,
                        type: 'ride_payment_expired',
                        title: 'Ödeme Süresi Doldu',
                        message: 'Yolculuk ödeme süresi doldu. Katılım talebiniz iptal edildi.',
                        data: { bookingId: booking._id }
                    });
                }
            } catch (error) {
                console.error('Payment timeout error:', error);
            }
        }, 15 * 60 * 1000); // 15 dakika

        res.json({ message: 'Katılım talebi onaylandı, ödeme bekleniyor' });

    } catch (error) {
        console.error('Approve ride booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Katılım talebini reddet (sürücü)
router.patch('/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await RideBooking.findById(req.params.id)
            .populate('ride', 'driver from to')
            .populate('passenger', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece sürücü reddedebilir
        if (booking.ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Bu rezervasyon artık reddedilemez' });
        }

        booking.status = 'rejected';
        booking.responseDate = new Date();
        booking.cancellation = {
            cancelledBy: req.user._id,
            cancelledAt: new Date(),
            reason: reason || 'Sürücü tarafından reddedildi'
        };
        await booking.save();

        // Yolcuya bildirim gönder
        await createNotification({
            recipient: booking.passenger._id,
            sender: req.user._id,
            type: 'ride_booking_rejected',
            title: 'Katılım İsteği Reddedildi',
            message: `${booking.ride.from.city} - ${booking.ride.to.city} yolculuğuna katılım isteğiniz reddedildi. ${reason ? 'Sebep: ' + reason : ''}`,
            data: {
                bookingId: booking._id,
                rideId: booking.ride._id
            }
        });

        res.json({ message: 'Katılım talebi reddedildi' });

    } catch (error) {
        console.error('Reject ride booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ödeme yap (mock ödeme)
router.post('/:id/payment', authenticateToken, async (req, res) => {
    try {
        const booking = await RideBooking.findById(req.params.id)
            .populate('ride', 'driver from to')
            .populate('passenger', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece yolcu ödeme yapabilir
        if (booking.passenger._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'awaiting_payment') {
            return res.status(400).json({ message: 'Bu rezervasyon için ödeme yapılamaz' });
        }

        // Ödeme süresinin dolup dolmadığını kontrol et
        if (new Date() > booking.paymentDetails.paymentExpiryDate) {
            booking.status = 'payment_expired';
            booking.paymentStatus = 'expired';
            await booking.save();
            return res.status(400).json({ message: 'Ödeme süresi dolmuş' });
        }

        // Mock ödeme - gerçek ödeme sistemi entegrasyonu burada olacak
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.paymentDetails.paymentDate = new Date();
        booking.paymentDetails.transactionId = 'RIDE-TXN' + Date.now();
        await booking.save();

        res.json({ 
            message: 'Ödeme başarıyla tamamlandı',
            transactionId: booking.paymentDetails.transactionId
        });

    } catch (error) {
        console.error('Ride payment error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Rezervasyonu iptal et
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await RideBooking.findById(req.params.id)
            .populate('ride', 'driver')
            .populate('passenger');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece yolcu veya sürücü iptal edebilir
        if (
            booking.passenger._id.toString() !== req.user._id.toString() &&
            booking.ride.driver.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Bu rezervasyonu iptal etme yetkiniz yok' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ message: 'Bu rezervasyon iptal edilemez' });
        }

        booking.status = 'cancelled';
        booking.cancellation = {
            cancelledBy: req.user._id,
            cancelledAt: new Date(),
            reason: reason || 'Kullanıcı tarafından iptal edildi'
        };

        // İade tutarı hesaplama (basit algoritma)
        if (booking.paymentStatus === 'paid') {
            const now = new Date();
            const rideDate = new Date(booking.ride.departureDate);
            const hoursUntilRide = (rideDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilRide > 24) {
                booking.cancellation.refundAmount = booking.paymentDetails.amount;
            } else if (hoursUntilRide > 2) {
                booking.cancellation.refundAmount = booking.paymentDetails.amount * 0.5;
            } else {
                booking.cancellation.refundAmount = 0;
            }
        }

        await booking.save();

        res.json({
            message: 'Rezervasyon başarıyla iptal edildi',
            refundAmount: booking.cancellation.refundAmount || 0
        });

    } catch (error) {
        console.error('Cancel ride booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yolculuğu tamamla
router.patch('/:id/complete', authenticateToken, async (req, res) => {
    try {
        const booking = await RideBooking.findById(req.params.id)
            .populate('ride', 'driver')
            .populate('passenger', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece sürücü tamamlayabilir
        if (booking.ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Bu rezervasyon tamamlanamaz' });
        }

        booking.status = 'completed';
        await booking.save();

        // Yolcuya bildirim gönder
        await createNotification({
            recipient: booking.passenger._id,
            type: 'ride_completed',
            title: 'Yolculuk Tamamlandı',
            message: 'Yolculuğunuz tamamlandı. İyi yolculuklar!',
            data: {
                bookingId: booking._id,
                rideId: booking.ride._id
            }
        });

        res.json({ message: 'Yolculuk tamamlandı' });

    } catch (error) {
        console.error('Complete ride booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 