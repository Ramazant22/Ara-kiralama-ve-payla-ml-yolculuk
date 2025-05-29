const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const RideBooking = require('../models/RideBooking');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Yolculukları listele (arama ve filtreleme ile)
router.get('/', async (req, res) => {
    try {
        const {
            from,
            to,
            date,
            passengers = 1,
            page = 1,
            limit = 10,
            sortBy = 'departureDate'
        } = req.query;

        let query = { status: { $in: ['active', 'full'] } };

        // Şehir filtreleri
        if (from) {
            query['from.city'] = new RegExp(from, 'i');
        }
        if (to) {
            query['to.city'] = new RegExp(to, 'i');
        }

        // Tarih filtresi
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            query.departureDate = {
                $gte: searchDate,
                $lt: nextDay
            };
        } else {
            // Sadece gelecekteki yolculukları göster
            query.departureDate = { $gte: new Date() };
        }

        // Yolculukları al
        const rides = await Ride.find(query)
            .populate('driver', 'firstName lastName rating avatar')
            .sort({ [sortBy]: 1 })
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .lean();

        // Her yolculuk için kalan koltuk sayısını hesapla
        const ridesWithSeats = await Promise.all(
            rides.map(async (ride) => {
                // Bu yolculuk için aktif rezervasyonları say (pending, awaiting_payment, confirmed)
                const activeBookings = await RideBooking.find({
                    ride: ride._id,
                    status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
                });

                const occupiedSeats = activeBookings.reduce((total, booking) => 
                    total + booking.seatsRequested, 0
                );

                const remainingSeats = ride.availableSeats - occupiedSeats;

                return {
                    ...ride,
                    remainingSeats,
                    occupiedSeats
                };
            })
        );

        // Koltuk sayısı filtresi uygula
        const filteredRides = ridesWithSeats.filter(ride => 
            ride.remainingSeats >= parseInt(passengers)
        );

        const total = await Ride.countDocuments(query);

        res.json({
            rides: filteredRides,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total: filteredRides.length
        });

    } catch (error) {
        console.error('Get rides error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Tek yolculuk detayını getir
router.get('/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'firstName lastName avatar phone rating')
            .lean();

        if (!ride) {
            return res.status(404).json({
                message: 'Yolculuk bulunamadı'
            });
        }

        // Kalan koltuk sayısını hesapla
        const activeBookings = await RideBooking.find({
            ride: ride._id,
            status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
        });

        const occupiedSeats = activeBookings.reduce((total, booking) => 
            total + booking.seatsRequested, 0
        );

        const remainingSeats = ride.availableSeats - occupiedSeats;

        res.json({ 
            ride: {
                ...ride,
                remainingSeats,
                occupiedSeats
            }
        });

    } catch (error) {
        console.error('Get ride error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuk oluştur
router.post('/', authenticateToken, [
    body('from.city').trim().notEmpty().withMessage('Başlangıç şehri gereklidir'),
    body('to.city').trim().notEmpty().withMessage('Varış şehri gereklidir'),
    body('departureDate').isISO8601().withMessage('Geçerli bir tarih giriniz'),
    body('departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir saat formatı giriniz (HH:MM)'),
    body('availableSeats').isInt({ min: 1, max: 8 }).withMessage('Koltuk sayısı 1-8 arası olmalıdır'),
    body('pricePerSeat').isFloat({ min: 0 }).withMessage('Geçerli bir fiyat giriniz'),
    body('vehicle.make').trim().notEmpty().withMessage('Araç markası gereklidir'),
    body('vehicle.model').trim().notEmpty().withMessage('Araç modeli gereklidir'),
    body('vehicle.year').isInt({ min: 1990 }).withMessage('Geçerli bir araç yılı giriniz'),
    body('vehicle.licensePlate').trim().notEmpty().withMessage('Plaka gereklidir')
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
            from,
            to,
            departureDate,
            departureTime,
            availableSeats,
            pricePerSeat,
            vehicle,
            preferences = {},
            description,
            notes,
            stops = []
        } = req.body;

        // Tarih kontrolü
        const rideDate = new Date(departureDate);
        const now = new Date();
        
        if (rideDate <= now) {
            return res.status(400).json({
                message: 'Yolculuk tarihi gelecekte olmalıdır'
            });
        }

        // Aynı güne çok fazla yolculuk oluşturma kontrolü
        const todayRides = await Ride.countDocuments({
            driver: req.user._id,
            departureDate: {
                $gte: new Date(rideDate.setHours(0, 0, 0, 0)),
                $lt: new Date(rideDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['active', 'full'] }
        });

        if (todayRides >= 3) {
            return res.status(400).json({
                message: 'Aynı gün en fazla 3 yolculuk oluşturabilirsiniz'
            });
        }

        const ride = new Ride({
            driver: req.user._id,
            from: {
                city: from.city,
                district: from.district,
                address: from.address
            },
            to: {
                city: to.city,
                district: to.district,
                address: to.address
            },
            departureDate: new Date(departureDate),
            departureTime,
            availableSeats: parseInt(availableSeats),
            pricePerSeat: parseFloat(pricePerSeat),
            vehicle: {
                make: vehicle.make,
                model: vehicle.model,
                year: parseInt(vehicle.year),
                color: vehicle.color,
                licensePlate: vehicle.licensePlate.toUpperCase()
            },
            preferences: {
                smokingAllowed: preferences.smokingAllowed || false,
                petsAllowed: preferences.petsAllowed || false,
                musicAllowed: preferences.musicAllowed !== false, // default true
                conversationLevel: preferences.conversationLevel || 'moderate'
            },
            description,
            notes,
            stops: stops.map(stop => ({
                ...stop,
                estimatedArrival: stop.estimatedArrival ? new Date(stop.estimatedArrival) : undefined
            }))
        });

        await ride.save();

        const populatedRide = await Ride.findById(ride._id)
            .populate('driver', 'firstName lastName avatar')
            .lean();

        res.status(201).json({
            message: 'Yolculuk başarıyla oluşturuldu',
            ride: {
                ...populatedRide,
                remainingSeats: populatedRide.availableSeats,
                occupiedSeats: 0
            }
        });

    } catch (error) {
        console.error('Create ride error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcının yolculuklarını listele
router.get('/user/my-rides', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;

        let query = { driver: req.user._id };
        
        if (status) {
            query.status = status;
        }

        const rides = await Ride.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Her yolculuk için rezervasyon bilgilerini al
        const ridesWithBookings = await Promise.all(
            rides.map(async (ride) => {
                const bookings = await RideBooking.find({ ride: ride._id })
                    .populate('passenger', 'firstName lastName avatar rating')
                    .sort({ createdAt: -1 });

                const confirmedBookings = bookings.filter(b => 
                    ['confirmed', 'awaiting_payment'].includes(b.status)
                );

                const occupiedSeats = confirmedBookings.reduce((total, booking) => 
                    total + booking.seatsRequested, 0
                );

                return {
                    ...ride,
                    bookings,
                    remainingSeats: ride.availableSeats - occupiedSeats,
                    occupiedSeats
                };
            })
        );

        res.json({ rides: ridesWithBookings });

    } catch (error) {
        console.error('Get my rides error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yolculuk durumunu güncelle
router.patch('/:id/status', authenticateToken, [
    body('status').isIn(['active', 'full', 'completed', 'cancelled']).withMessage('Geçerli bir durum seçiniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz durum',
                errors: errors.array()
            });
        }

        const { status } = req.body;
        const rideId = req.params.id;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Yolculuk bulunamadı' });
        }

        // Sadece sürücü değiştirebilir
        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        ride.status = status;
        await ride.save();

        res.json({ message: 'Yolculuk durumu güncellendi', ride });

    } catch (error) {
        console.error('Update ride status error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yolculuğu sil
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        
        if (!ride) {
            return res.status(404).json({ message: 'Yolculuk bulunamadı' });
        }

        // Sadece sürücü silebilir
        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
        }

        // Aktif rezervasyonlar varsa silinemez
        const activeBookings = await RideBooking.countDocuments({
            ride: req.params.id,
            status: { $in: ['pending', 'confirmed', 'awaiting_payment'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({ 
                message: 'Aktif rezervasyonları olan yolculuk silinemez' 
            });
        }

        await Ride.findByIdAndDelete(req.params.id);

        res.json({ message: 'Yolculuk başarıyla silindi' });

    } catch (error) {
        console.error('Delete ride error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 