const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm yolculukları listele (kullanıcıya göre filtrelenmiş)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            role = 'all' // 'renter', 'owner', 'all'
        } = req.query;

        let query = {};

        // Rol bazında filtreleme
        if (role === 'renter') {
            query.renter = req.user._id;
        } else if (role === 'owner') {
            query.owner = req.user._id;
        } else {
            // Kullanıcının hem kiralayan hem de araç sahibi olduğu yolculuklar
            query = {
                $or: [
                    { renter: req.user._id },
                    { owner: req.user._id }
                ]
            };
        }

        // Durum filtrelemesi
        if (status) {
            query.status = status;
        }

        const trips = await Trip.find(query)
            .populate('renter', 'firstName lastName avatar email phone')
            .populate('owner', 'firstName lastName avatar email phone')
            .populate('vehicle', 'make model year licensePlate images location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Trip.countDocuments(query);

        res.json({
            trips,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        });

    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Tek yolculuk detayını getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('renter', 'firstName lastName avatar email phone')
            .populate('owner', 'firstName lastName avatar email phone')
            .populate('vehicle', 'make model year licensePlate images location features')
            .exec();

        if (!trip) {
            return res.status(404).json({
                message: 'Yolculuk bulunamadı'
            });
        }

        // Sadece ilgili kullanıcılar görebilir
        if (trip.renter._id.toString() !== req.user._id.toString() && 
            trip.owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Bu yolculuğu görme yetkiniz yok'
            });
        }

        res.json({ trip });

    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yeni yolculuk oluştur (rezervasyon)
router.post('/', authenticateToken, [
    body('vehicleId').isMongoId().withMessage('Geçerli bir araç ID\'si gereklidir'),
    body('startDate').isISO8601().withMessage('Geçerli bir başlangıç tarihi gereklidir'),
    body('endDate').isISO8601().withMessage('Geçerli bir bitiş tarihi gereklidir'),
    body('pickupAddress').notEmpty().withMessage('Teslim alma adresi gereklidir'),
    body('dropoffAddress').notEmpty().withMessage('Teslim etme adresi gereklidir')
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
            vehicleId,
            startDate,
            endDate,
            pickupAddress,
            dropoffAddress,
            pickupNotes,
            dropoffNotes,
            renterNotes
        } = req.body;

        // Aracı kontrol et
        const vehicle = await Vehicle.findById(vehicleId).populate('owner');
        if (!vehicle || !vehicle.isActive || vehicle.status !== 'available') {
            return res.status(400).json({
                message: 'Araç müsait değil'
            });
        }

        // Kendi aracını kiralayamaz
        if (vehicle.owner._id.toString() === req.user._id.toString()) {
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
        const conflictingTrip = await Trip.findOne({
            vehicle: vehicleId,
            status: { $in: ['pending', 'confirmed', 'active'] },
            $or: [
                { startDate: { $lte: start }, endDate: { $gte: start } },
                { startDate: { $lte: end }, endDate: { $gte: end } },
                { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
        });

        if (conflictingTrip) {
            return res.status(400).json({
                message: 'Bu tarihler arası araç zaten rezerve edilmiş'
            });
        }

        // Süre ve fiyat hesaplaması
        const diffTime = Math.abs(end - start);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let totalAmount = 0;
        if (diffDays > 0) {
            totalAmount = diffDays * vehicle.pricePerDay;
            const remainingHours = diffHours % 24;
            if (remainingHours > 0) {
                totalAmount += remainingHours * vehicle.pricePerHour;
            }
        } else {
            totalAmount = diffHours * vehicle.pricePerHour;
        }

        const serviceFee = totalAmount * 0.1; // %10 servis ücreti
        const taxes = totalAmount * 0.18; // %18 KDV
        const securityDeposit = vehicle.pricePerDay; // 1 günlük ücret kadar depozit

        // Yolculuk oluştur
        const trip = new Trip({
            renter: req.user._id,
            vehicle: vehicleId,
            owner: vehicle.owner._id,
            startDate: start,
            endDate: end,
            pickupLocation: {
                address: pickupAddress,
                notes: pickupNotes
            },
            dropoffLocation: {
                address: dropoffAddress,
                notes: dropoffNotes
            },
            pricing: {
                pricePerHour: vehicle.pricePerHour,
                pricePerDay: vehicle.pricePerDay,
                totalAmount: totalAmount + serviceFee + taxes,
                securityDeposit,
                serviceFee,
                taxes
            },
            notes: {
                renterNotes
            }
        });

        await trip.save();

        const populatedTrip = await Trip.findById(trip._id)
            .populate('renter', 'firstName lastName avatar')
            .populate('owner', 'firstName lastName avatar')
            .populate('vehicle', 'make model year licensePlate images');

        res.status(201).json({
            message: 'Rezervasyon başarıyla oluşturuldu',
            trip: populatedTrip
        });

    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuk durumunu güncelle
router.patch('/:id/status', authenticateToken, [
    body('status').isIn(['confirmed', 'rejected', 'active', 'completed', 'cancelled']).withMessage('Geçerli bir durum seçiniz'),
    body('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz durum',
                errors: errors.array()
            });
        }

        const { status, notes } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                message: 'Yolculuk bulunamadı'
            });
        }

        // Yetki kontrolü
        const isOwner = trip.owner.toString() === req.user._id.toString();
        const isRenter = trip.renter.toString() === req.user._id.toString();

        if (!isOwner && !isRenter) {
            return res.status(403).json({
                message: 'Bu işlemi yapma yetkiniz yok'
            });
        }

        // Durum geçiş kontrolü
        const validTransitions = {
            pending: ['confirmed', 'rejected', 'cancelled'],
            confirmed: ['active', 'cancelled'],
            active: ['completed', 'cancelled'],
            completed: [],
            cancelled: [],
            rejected: []
        };

        if (!validTransitions[trip.status].includes(status)) {
            return res.status(400).json({
                message: 'Geçersiz durum geçişi'
            });
        }

        // Sadece araç sahibi onaylayabilir/reddedebilir
        if ((status === 'confirmed' || status === 'rejected') && !isOwner) {
            return res.status(403).json({
                message: 'Sadece araç sahibi rezervasyonu onaylayabilir/reddedebilir'
            });
        }

        // Güncelleme
        trip.status = status;
        
        if (notes) {
            if (isOwner) {
                trip.notes.ownerNotes = notes;
            } else {
                trip.notes.renterNotes = notes;
            }
        }

        if (status === 'cancelled') {
            trip.cancellation = {
                cancelledBy: req.user._id,
                cancelledAt: new Date(),
                reason: notes
            };
        }

        // Araç durumunu güncelle
        if (status === 'active') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'rented' });
        } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'available' });
        }

        await trip.save();

        const updatedTrip = await Trip.findById(trip._id)
            .populate('renter', 'firstName lastName avatar')
            .populate('owner', 'firstName lastName avatar')
            .populate('vehicle', 'make model year licensePlate');

        res.json({
            message: 'Yolculuk durumu güncellendi',
            trip: updatedTrip
        });

    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuk değerlendirmesi ekle
router.post('/:id/rating', authenticateToken, [
    body('score').isInt({ min: 1, max: 5 }).withMessage('Puan 1-5 arası olmalıdır'),
    body('comment').optional().isString().isLength({ max: 500 }).withMessage('Yorum 500 karakterden uzun olamaz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz değerlendirme',
                errors: errors.array()
            });
        }

        const { score, comment } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                message: 'Yolculuk bulunamadı'
            });
        }

        if (trip.status !== 'completed') {
            return res.status(400).json({
                message: 'Sadece tamamlanan yolculuklar değerlendirilebilir'
            });
        }

        const isOwner = trip.owner.toString() === req.user._id.toString();
        const isRenter = trip.renter.toString() === req.user._id.toString();

        if (!isOwner && !isRenter) {
            return res.status(403).json({
                message: 'Bu yolculuğu değerlendirme yetkiniz yok'
            });
        }

        // Değerlendirme ekle
        if (isRenter) {
            if (trip.rating.renterRating.score) {
                return res.status(400).json({
                    message: 'Bu yolculuğu zaten değerlendirdiniz'
                });
            }
            trip.rating.renterRating = {
                score,
                comment,
                date: new Date()
            };
        } else {
            if (trip.rating.ownerRating.score) {
                return res.status(400).json({
                    message: 'Bu yolculuğu zaten değerlendirdiniz'
                });
            }
            trip.rating.ownerRating = {
                score,
                comment,
                date: new Date()
            };
        }

        await trip.save();

        res.json({
            message: 'Değerlendirme başarıyla eklendi',
            rating: isRenter ? trip.rating.renterRating : trip.rating.ownerRating
        });

    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuk istatistikleri
router.get('/stats/summary', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        // Kiralayan olarak istatistikler
        const renterStats = await Trip.aggregate([
            { $match: { renter: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);

        // Araç sahibi olarak istatistikler
        const ownerStats = await Trip.aggregate([
            { $match: { owner: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);

        res.json({
            renterStats,
            ownerStats
        });

    } catch (error) {
        console.error('Get trip stats error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router; 