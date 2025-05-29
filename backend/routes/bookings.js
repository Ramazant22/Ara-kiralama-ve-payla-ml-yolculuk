const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Tüm rezervasyonları listele (admin için)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Bu işlem için admin yetkisi gereklidir'
            });
        }

        const {
            page = 1,
            limit = 10,
            status,
            paymentStatus,
            startDate,
            endDate
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (startDate && endDate) {
            query.startDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bookings = await Booking.find(query)
            .populate('renter', 'firstName lastName email phone')
            .populate('vehicle', 'make model year licensePlate owner')
            .populate('vehicle.owner', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(query);

        res.json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcının kendi rezervasyonlarını listele
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const { type, status } = req.query;

        let query = {};

        if (type === 'renter') {
            query.renter = req.user._id;
        } else if (type === 'owner') {
            // Kullanıcının araçlarına yapılan rezervasyonlar
            const userVehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
            const vehicleIds = userVehicles.map(v => v._id);
            query.vehicle = { $in: vehicleIds };
        } else {
            // Her iki durumu da getir - kullanıcının kiraladığı araçlar ve kendi araçlarına yapılan rezervasyonlar
            const userVehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
            const vehicleIds = userVehicles.map(v => v._id);
            query = {
                $or: [
                    { renter: req.user._id },
                    { vehicle: { $in: vehicleIds } }
                ]
            };
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('renter', 'firstName lastName rating avatar')
            .populate('vehicle', 'make model year licensePlate images owner')
            .populate('vehicle.owner', 'firstName lastName rating avatar')
            .sort({ createdAt: -1 });

        res.json({ bookings });

    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Tek rezervasyon detayını getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('renter', 'firstName lastName email phone rating')
            .populate('vehicle', 'make model year licensePlate owner images location')
            .populate('vehicle.owner', 'firstName lastName phone email rating');

        if (!booking) {
            return res.status(404).json({
                message: 'Rezervasyon bulunamadı'
            });
        }

        // Sadece rezervasyon sahibi, araç sahibi veya admin görebilir
        if (
            booking.renter._id.toString() !== req.user._id.toString() &&
            booking.vehicle.owner._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Bu rezervasyonu görme yetkiniz yoktur'
            });
        }

        res.json({ booking });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yeni rezervasyon oluştur
router.post('/', authenticateToken, [
    body('vehicleId').isMongoId().withMessage('Geçerli bir araç ID giriniz'),
    body('startDate').isISO8601().withMessage('Geçerli başlangıç tarihi giriniz'),
    body('endDate').isISO8601().withMessage('Geçerli bitiş tarihi giriniz'),
    body('pickupAddress').trim().notEmpty().withMessage('Teslim alma adresi gereklidir'),
    body('returnAddress').trim().notEmpty().withMessage('İade adresi gereklidir'),
    body('pickupLatitude').isFloat().withMessage('Geçerli teslim alma enlemi giriniz'),
    body('pickupLongitude').isFloat().withMessage('Geçerli teslim alma boylamı giriniz'),
    body('returnLatitude').isFloat().withMessage('Geçerli iade enlemi giriniz'),
    body('returnLongitude').isFloat().withMessage('Geçerli iade boylamı giriniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const {
            vehicleId, startDate, endDate, pickupAddress, returnAddress,
            pickupLatitude, pickupLongitude, returnLatitude, returnLongitude,
            paymentMethod, specialRequests, notes
        } = req.body;

        // Araç kontrolü
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'Araç bulunamadı'
            });
        }

        if (!vehicle.isActive || vehicle.status !== 'available') {
            return res.status(400).json({
                message: 'Araç şu anda kiralama için müsait değil'
            });
        }

        // Kendi aracını kiralayamaz
        if (vehicle.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Kendi aracınızı kiralayamazsınız'
            });
        }

        // Tarih kontrolü
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start <= now) {
            return res.status(400).json({
                message: 'Başlangıç tarihi gelecekte olmalıdır'
            });
        }

        if (end <= start) {
            return res.status(400).json({
                message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
            });
        }

        // Çakışan rezervasyon kontrolü
        const conflictingBooking = await Booking.findOne({
            vehicle: vehicleId,
            status: { $in: ['pending', 'confirmed', 'ongoing'] },
            $or: [
                {
                    startDate: { $lte: start },
                    endDate: { $gte: start }
                },
                {
                    startDate: { $lte: end },
                    endDate: { $gte: end }
                },
                {
                    startDate: { $gte: start },
                    endDate: { $lte: end }
                }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({
                message: 'Bu tarihler arasında araç zaten rezerve edilmiş'
            });
        }

        // Süre hesaplama
        const durationMs = end.getTime() - start.getTime();
        const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
        const totalDays = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;

        // Fiyat hesaplama
        const dailyTotal = totalDays * vehicle.pricePerDay;
        const hourlyTotal = remainingHours * vehicle.pricePerHour;
        const subtotal = dailyTotal + hourlyTotal;
        const tax = subtotal * 0.18; // %18 KDV
        const serviceFee = subtotal * 0.05; // %5 hizmet bedeli
        const insurance = subtotal * 0.02; // %2 sigorta
        const total = subtotal + tax + serviceFee + insurance;

        const booking = new Booking({
            renter: req.user._id,
            vehicle: vehicleId,
            startDate: start,
            endDate: end,
            pickupLocation: {
                coordinates: [parseFloat(pickupLongitude), parseFloat(pickupLatitude)],
                address: pickupAddress
            },
            returnLocation: {
                coordinates: [parseFloat(returnLongitude), parseFloat(returnLatitude)],
                address: returnAddress
            },
            totalHours,
            totalDays,
            pricing: {
                hourlyRate: vehicle.pricePerHour,
                dailyRate: vehicle.pricePerDay,
                subtotal,
                tax,
                serviceFee,
                insurance,
                total
            },
            paymentMethod: paymentMethod || 'credit_card',
            specialRequests: specialRequests || [],
            notes: {
                renter: notes || ''
            }
        });

        await booking.save();

        // Araç durumunu pending yap (kiralama talebi geldi)
        console.log('Setting vehicle status to pending for vehicle:', vehicleId);
        await Vehicle.findByIdAndUpdate(vehicleId, { status: 'pending' });
        console.log('Vehicle status updated to pending');

        // Araç sahibine bildirim gönder
        await createNotification({
            recipient: vehicle.owner,
            sender: req.user._id,
            type: 'booking_request',
            title: 'Yeni Kiralama İsteği',
            message: `${req.user.firstName} ${req.user.lastName} ${vehicle.make} ${vehicle.model} aracınız için kiralama isteğinde bulundu.`,
            data: {
                bookingId: booking._id,
                vehicleId: vehicle._id
            },
            isActionRequired: true,
            actions: [
                { type: 'approve', label: 'Onayla', url: `/bookings/${booking._id}` },
                { type: 'reject', label: 'Reddet', url: `/bookings/${booking._id}` }
            ]
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('renter', 'firstName lastName email phone')
            .populate('vehicle', 'make model year licensePlate owner images');

        res.status(201).json({
            message: 'Rezervasyon başarıyla oluşturuldu',
            booking: populatedBooking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Rezervasyon durumunu güncelle
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri' });
        }

        const booking = await Booking.findById(bookingId)
            .populate('vehicle', 'owner')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Check if user is the vehicle owner (for approval/rejection)
        if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        booking.status = status;
        await booking.save();

        const updatedBooking = await Booking.findById(bookingId)
            .populate('vehicle', 'make model images')
            .populate('renter', 'firstName lastName email phone');

        res.json(updatedBooking);
    } catch (error) {
        console.error('Booking status update error:', error);
        res.status(500).json({ message: 'Rezervasyon durumu güncellenirken hata oluştu' });
    }
});

// Rezervasyonu iptal et
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner');

        if (!booking) {
            return res.status(404).json({
                message: 'Rezervasyon bulunamadı'
            });
        }

        // Sadece rezervasyon sahibi veya araç sahibi iptal edebilir
        if (
            booking.renter.toString() !== req.user._id.toString() &&
            booking.vehicle.owner.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Bu rezervasyonu iptal etme yetkiniz yoktur'
            });
        }

        if (booking.status === 'ongoing' || booking.status === 'completed') {
            return res.status(400).json({
                message: 'Devam eden veya tamamlanmış rezervasyon iptal edilemez'
            });
        }

        // İptal bilgilerini güncelle
        const updateData = {
            status: 'cancelled',
            'cancellation.cancelledBy': req.user._id,
            'cancellation.cancelledAt': new Date(),
            'cancellation.reason': req.body.reason || ''
        };

        // İade tutarı hesaplama (basit bir algoritma)
        const now = new Date();
        const startDate = new Date(booking.startDate);
        const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilStart > 24) {
            updateData['cancellation.refundAmount'] = booking.pricing.total;
        } else if (hoursUntilStart > 2) {
            updateData['cancellation.refundAmount'] = booking.pricing.total * 0.5;
        } else {
            updateData['cancellation.refundAmount'] = 0;
        }

        await Booking.findByIdAndUpdate(req.params.id, updateData);

        res.json({
            message: 'Rezervasyon başarıyla iptal edildi',
            refundAmount: updateData['cancellation.refundAmount']
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcının rezervasyonlarını listele
router.get('/user/my-bookings', authenticateToken, async (req, res) => {
    try {
        const { type = 'renter', status } = req.query;

        let query = {};

        if (type === 'renter') {
            query.renter = req.user._id;
        } else if (type === 'owner') {
            // Kullanıcının araçlarına yapılan rezervasyonlar
            const userVehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
            const vehicleIds = userVehicles.map(v => v._id);
            query.vehicle = { $in: vehicleIds };
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('renter', 'firstName lastName rating avatar')
            .populate('vehicle', 'make model year licensePlate images owner')
            .populate('vehicle.owner', 'firstName lastName rating avatar')
            .sort({ createdAt: -1 });

        res.json({ bookings });

    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Ödeme durumunu güncelle
router.patch('/:id/payment', authenticateToken, [
    body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Geçerli bir ödeme durumu seçiniz'),
    body('transactionId').optional().trim().notEmpty().withMessage('İşlem ID gereklidir')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz veriler',
                errors: errors.array()
            });
        }

        const { paymentStatus, transactionId } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Rezervasyon bulunamadı'
            });
        }

        // Sadece rezervasyon sahibi ödeme yapabilir
        if (booking.renter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Bu işlemi yapma yetkiniz yoktur'
            });
        }

        const updateData = {
            paymentStatus,
            'paymentDetails.transactionId': transactionId,
            'paymentDetails.paymentDate': paymentStatus === 'paid' ? new Date() : booking.paymentDetails.paymentDate
        };

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            message: 'Ödeme durumu güncellendi',
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Değerlendirme ekle
router.post('/:id/rating', authenticateToken, [
    body('vehicleRating').isInt({ min: 1, max: 5 }).withMessage('Araç değerlendirmesi 1-5 arası olmalıdır'),
    body('ownerRating').isInt({ min: 1, max: 5 }).withMessage('Sahip değerlendirmesi 1-5 arası olmalıdır'),
    body('review').optional().trim().isLength({ max: 500 }).withMessage('Yorum en fazla 500 karakter olabilir')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz veriler',
                errors: errors.array()
            });
        }

        const { vehicleRating, ownerRating, review } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Rezervasyon bulunamadı'
            });
        }

        // Sadece rezervasyon sahibi değerlendirme yapabilir
        if (booking.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Bu rezervasyonu değerlendirme yetkiniz yoktur'
            });
        }

        // Sadece tamamlanmış rezervasyonlar değerlendirilebilir
        if (booking.status !== 'completed') {
            return res.status(400).json({
                message: 'Sadece tamamlanmış rezervasyonlar değerlendirilebilir'
            });
        }

        // Zaten değerlendirilmiş mi kontrol et
        if (booking.rating.vehicleRating) {
            return res.status(400).json({
                message: 'Bu rezervasyon zaten değerlendirilmiş'
            });
        }

        const updateData = {
            'rating.vehicleRating': vehicleRating,
            'rating.ownerRating': ownerRating,
            'rating.review': review || '',
            'rating.ratedAt': new Date()
        };

        await Booking.findByIdAndUpdate(req.params.id, updateData);

        // Araç ve kullanıcı ortalama puanlarını güncelle (bu işlem ayrı bir servis olarak yapılabilir)
        // TODO: Vehicle ve User modellerindeki rating alanlarını güncelle

        res.json({
            message: 'Değerlendirme başarıyla eklendi'
        });

    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Rezervasyonu onayla (araç sahibi)
router.patch('/:id/approve', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece araç sahibi onaylayabilir
        if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Bu rezervasyon artık onaylanamaz' });
        }

        // Ödeme bekleme durumuna geçir ve 15 dakika süre ver
        const paymentExpiryDate = new Date();
        paymentExpiryDate.setMinutes(paymentExpiryDate.getMinutes() + 15);

        booking.status = 'awaiting_payment';
        booking.paymentDetails.paymentExpiryDate = paymentExpiryDate;
        await booking.save();

        // Kiralayan kullanıcıya ödeme bildirimi gönder
        await createNotification({
            recipient: booking.renter._id,
            sender: req.user._id,
            type: 'booking_confirmed',
            title: 'Rezervasyon Onaylandı',
            message: `Rezervasyonunuz onaylandı! 15 dakika içinde ödeme yapmanız gerekmektedir.`,
            data: {
                bookingId: booking._id,
                vehicleId: booking.vehicle._id
            },
            isActionRequired: true,
            actions: [
                { type: 'pay', label: 'Ödeme Yap', url: `/bookings/${booking._id}/payment` }
            ]
        });

        // 15 dakika sonra ödeme yapılmazsa otomatik iptal
        setTimeout(async () => {
            try {
                const currentBooking = await Booking.findById(booking._id);
                if (currentBooking && currentBooking.status === 'awaiting_payment' && currentBooking.paymentStatus === 'pending') {
                    currentBooking.status = 'payment_expired';
                    currentBooking.paymentStatus = 'expired';
                    await currentBooking.save();

                    // Araç durumunu tekrar müsait yap
                    console.log('Setting vehicle status back to available for vehicle:', booking.vehicle._id);
                    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'available' });
                    console.log('Vehicle status updated to available');

                    // Bildirim gönder
                    await createNotification({
                        recipient: booking.renter._id,
                        type: 'payment_expired',
                        title: 'Ödeme Süresi Doldu',
                        message: 'Rezervasyon ödeme süresi doldu. Rezervasyon iptal edildi.',
                        data: { bookingId: booking._id }
                    });
                }
            } catch (error) {
                console.error('Payment timeout error:', error);
            }
        }, 15 * 60 * 1000); // 15 dakika

        res.json({ message: 'Rezervasyon onaylandı, ödeme bekleniyor' });

    } catch (error) {
        console.error('Approve booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Rezervasyonu reddet (araç sahibi)
router.patch('/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner make model')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece araç sahibi reddedebilir
        if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Bu rezervasyon artık reddedilemez' });
        }

        booking.status = 'rejected';
        booking.cancellation = {
            cancelledBy: req.user._id,
            cancelledAt: new Date(),
            reason: reason || 'Araç sahibi tarafından reddedildi'
        };
        await booking.save();

        // Araç durumunu tekrar müsait yap
        console.log('Setting vehicle status back to available for vehicle:', booking.vehicle._id);
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'available' });
        console.log('Vehicle status updated to available');

        // Kiralayan kullanıcıya bildirim gönder
        await createNotification({
            recipient: booking.renter._id,
            sender: req.user._id,
            type: 'booking_rejected',
            title: 'Rezervasyon Reddedildi',
            message: `${booking.vehicle.make} ${booking.vehicle.model} için rezervasyonunuz reddedildi. ${reason ? 'Sebep: ' + reason : ''}`,
            data: {
                bookingId: booking._id,
                vehicleId: booking.vehicle._id
            }
        });

        res.json({ message: 'Rezervasyon reddedildi' });

    } catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ödeme yap (mock ödeme)
router.post('/:id/payment', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner make model')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece kiralayan ödeme yapabilir
        if (booking.renter._id.toString() !== req.user._id.toString()) {
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
        booking.paymentDetails.transactionId = 'TXN' + Date.now();
        await booking.save();

        // Araç durumunu kiralanmış yap
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'rented' });

        res.json({ 
            message: 'Ödeme başarıyla tamamlandı',
            transactionId: booking.paymentDetails.transactionId
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Araç teslim alındı
router.patch('/:id/confirm-pickup', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner make model')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Sadece kiralayan teslim alımını onaylayabilir
        if (booking.renter._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Araç henüz teslim alınabilir durumda değil' });
        }

        booking.status = 'ongoing';
        booking.actualPickupTime = new Date();
        await booking.save();

        // Araç sahibine bildirim gönder
        await createNotification({
            recipient: booking.vehicle.owner,
            sender: req.user._id,
            type: 'vehicle_received',
            title: 'Araç Teslim Alındı',
            message: `${booking.renter.firstName} ${booking.renter.lastName} aracınızı teslim aldı.`,
            data: {
                bookingId: booking._id,
                vehicleId: booking.vehicle._id
            }
        });

        res.json({ message: 'Araç teslim alımı onaylandı' });

    } catch (error) {
        console.error('Confirm pickup error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Kiralama tamamlandı (sistem otomatik)
router.patch('/:id/complete', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'owner make model')
            .populate('renter', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        if (booking.status !== 'ongoing') {
            return res.status(400).json({ message: 'Bu rezervasyon tamamlanamaz' });
        }

        // Kiralama süresinin bitip bitmediğini kontrol et
        if (new Date() < booking.endDate) {
            return res.status(400).json({ message: 'Kiralama süresi henüz bitmedi' });
        }

        booking.status = 'completed';
        booking.actualReturnTime = new Date();
        await booking.save();

        // Araç durumunu tekrar müsait yap
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'available' });

        // Her iki tarafa da bildirim gönder
        await createNotification({
            recipient: booking.vehicle.owner,
            type: 'rental_completed',
            title: 'Kiralama Tamamlandı',
            message: `${booking.vehicle.make} ${booking.vehicle.model} kiralaması tamamlandı. Ödeme hesabınıza aktarılacak.`,
            data: {
                bookingId: booking._id,
                vehicleId: booking.vehicle._id
            }
        });

        await createNotification({
            recipient: booking.renter._id,
            type: 'rental_completed',
            title: 'Kiralama Tamamlandı',
            message: `${booking.vehicle.make} ${booking.vehicle.model} kiralamanız tamamlandı. Teşekkür ederiz!`,
            data: {
                bookingId: booking._id,
                vehicleId: booking.vehicle._id
            }
        });

        res.json({ message: 'Kiralama tamamlandı' });

    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 