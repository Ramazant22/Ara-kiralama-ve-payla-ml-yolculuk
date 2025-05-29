const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { authenticateToken, requireVehicleOwner } = require('../middleware/auth');
const { uploadVehicleImages, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Tüm araçları listele (filtreleme ve sayfalama ile)
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            city,
            district,
            category,
            fuelType,
            transmission,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { isActive: true, status: 'available' };
        console.log('Vehicle query:', query);

        // Filtreleme
        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }
        if (district) {
            query['location.district'] = new RegExp(district, 'i');
        }
        if (category) {
            query.category = category;
        }
        if (fuelType) {
            query.fuelType = fuelType;
        }
        if (transmission) {
            query.transmission = transmission;
        }
        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }

        // Sıralama
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const vehicles = await Vehicle.find(query)
            .populate('owner', 'firstName lastName rating avatar')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Vehicle.countDocuments(query);
        console.log(`Found ${total} vehicles with query:`, query);
        console.log('Vehicle statuses:', vehicles.map(v => ({ id: v._id, status: v.status })));

        res.json({
            vehicles,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        });

    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Tek araç detayını getir
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('owner', 'firstName lastName rating avatar phone email')
            .exec();

        if (!vehicle || !vehicle.isActive) {
            return res.status(404).json({
                message: 'Araç bulunamadı'
            });
        }

        res.json({ vehicle });

    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Yeni araç ekle
router.post('/', authenticateToken, uploadVehicleImages, handleUploadError, [
    body('make').trim().notEmpty().withMessage('Araç markası gereklidir'),
    body('model').trim().notEmpty().withMessage('Araç modeli gereklidir'),
    body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Geçerli bir yıl giriniz'),
    body('licensePlate').matches(/^[0-9]{2}\s*[A-Z]{1,4}\s*[0-9]{1,4}$/).withMessage('Geçerli bir plaka giriniz'),
    body('color').trim().notEmpty().withMessage('Araç rengi gereklidir'),
    body('fuelType').isIn(['benzin', 'dizel', 'elektrik', 'hibrit', 'lpg']).withMessage('Geçerli bir yakıt türü seçiniz'),
    body('transmission').isIn(['manuel', 'otomatik']).withMessage('Geçerli bir şanzıman türü seçiniz'),
    body('seats').isInt({ min: 2, max: 9 }).withMessage('Koltuk sayısı 2-9 arası olmalıdır'),
    body('category').isIn(['ekonomi', 'kompakt', 'orta', 'büyük', 'lüks', 'suv', 'minivan']).withMessage('Geçerli bir kategori seçiniz'),
    body('pricePerHour').optional().isFloat({ min: 10 }).withMessage('Saatlik ücret minimum 10 TL olmalıdır'),
    body('pricePerDay').isFloat({ min: 100 }).withMessage('Günlük ücret minimum 100 TL olmalıdır'),
    body('city').trim().notEmpty().withMessage('İl gereklidir'),
    body('district').trim().notEmpty().withMessage('İlçe gereklidir'),
    body('address').trim().notEmpty().withMessage('Adres gereklidir')
], async (req, res) => {
    try {
        console.log('Vehicle creation request body:', req.body);
        console.log('Request files:', req.files);
        console.log('File field names:', req.files ? req.files.map(f => f.fieldname) : []);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const {
            make, model, year, licensePlate, color, fuelType,
            transmission, seats, category, features, pricePerHour,
            pricePerDay, city, district, neighborhood, address
        } = req.body;

        // Plakayı normalize et (boşlukları temizle)
        const normalizedLicensePlate = licensePlate.replace(/\s+/g, '').toUpperCase();

        // Plaka kontrolü
        const existingPlate = await Vehicle.findOne({ licensePlate: normalizedLicensePlate });
        if (existingPlate) {
            return res.status(400).json({
                message: 'Bu plaka zaten sistemde kayıtlı'
            });
        }

        // Yüklenen resimleri işle
        const images = req.files ? req.files.map((file, index) => ({
            url: `/uploads/vehicles/${file.filename}`,
            caption: `${make} ${model} - Resim ${index + 1}`,
            isPrimary: index === 0
        })) : [];

        const vehicle = new Vehicle({
            owner: req.user._id,
            make,
            model,
            year: parseInt(year),
            licensePlate: normalizedLicensePlate,
            color,
            fuelType,
            transmission,
            seats: parseInt(seats),
            category,
            features: features ? (Array.isArray(features) ? features : [features]) : [],
            ...(pricePerHour && { pricePerHour: parseFloat(pricePerHour) }),
            pricePerDay: parseFloat(pricePerDay),
            location: {
                city,
                district,
                neighborhood: neighborhood || '',
                address
            },
            images
        });

        await vehicle.save();

        const populatedVehicle = await Vehicle.findById(vehicle._id)
            .populate('owner', 'firstName lastName rating avatar');

        res.status(201).json({
            message: 'Araç başarıyla eklendi',
            vehicle: populatedVehicle
        });

    } catch (error) {
        console.error('Add vehicle error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Bu plaka zaten kullanılıyor'
            });
        }
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Araç güncelle
router.put('/:vehicleId', authenticateToken, requireVehicleOwner, uploadVehicleImages, handleUploadError, async (req, res) => {
    try {
        const updateData = req.body;

        // Yeni resimler varsa ekle
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file, index) => ({
                url: `/uploads/vehicles/${file.filename}`,
                caption: `${updateData.make || req.vehicle.make} ${updateData.model || req.vehicle.model} - Resim`,
                isPrimary: false
            }));
            
            updateData.images = [...(req.vehicle.images || []), ...newImages];
        }

        // Konum güncellemesi
        if (updateData.city || updateData.district || updateData.address) {
            updateData.location = {
                ...req.vehicle.location,
                ...(updateData.city && { city: updateData.city }),
                ...(updateData.district && { district: updateData.district }),
                ...(updateData.neighborhood && { neighborhood: updateData.neighborhood }),
                ...(updateData.address && { address: updateData.address })
            };
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            updateData,
            { new: true, runValidators: true }
        ).populate('owner', 'firstName lastName rating avatar');

        res.json({
            message: 'Araç başarıyla güncellendi',
            vehicle
        });

    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Araç sil (soft delete)
router.delete('/:vehicleId', authenticateToken, requireVehicleOwner, async (req, res) => {
    try {
        await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            { isActive: false, status: 'inactive' }
        );

        res.json({
            message: 'Araç başarıyla silindi'
        });

    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcının araçlarını listele
router.get('/user/my-vehicles', authenticateToken, async (req, res) => {
    try {
        console.log('Getting vehicles for user:', req.user._id);
        const vehicles = await Vehicle.find({ 
            owner: req.user._id,
            isActive: true 
        }).sort({ createdAt: -1 });

        console.log('Found vehicles:', vehicles.length);
        console.log('Vehicle IDs:', vehicles.map(v => v._id));
        
        res.json({ vehicles });

    } catch (error) {
        console.error('Get my vehicles error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Araç durumunu güncelle
router.patch('/:vehicleId/status', authenticateToken, requireVehicleOwner, [
    body('status').isIn(['available', 'rented', 'maintenance', 'inactive']).withMessage('Geçerli bir durum seçiniz')
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

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            { status },
            { new: true }
        ).populate('owner', 'firstName lastName');

        res.json({
            message: 'Araç durumu güncellendi',
            vehicle
        });

    } catch (error) {
        console.error('Update vehicle status error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router; 