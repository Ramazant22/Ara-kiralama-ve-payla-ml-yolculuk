const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadAvatar, uploadDocuments, handleUploadError, deleteFile } = require('../middleware/upload');

const router = express.Router();

// Tüm kullanıcıları listele (admin için)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            role,
            search
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı profil detayını getir
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Sadece kendi profilini, admin veya public bilgileri görebilir
        if (
            req.params.id !== req.user._id.toString() && 
            req.user.role !== 'admin'
        ) {
            // Public profil bilgileri
            const publicUser = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                rating: user.rating,
                status: user.status,
                createdAt: user.createdAt
            };
            return res.json({ user: publicUser });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı profilini güncelle
router.put('/profile', authenticateToken, uploadAvatar, handleUploadError, [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Ad 2-50 karakter arası olmalıdır'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Soyad 2-50 karakter arası olmalıdır'),
    body('phone').optional().matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası giriniz'),
    body('dateOfBirth').optional().isISO8601().withMessage('Geçerli bir doğum tarihi giriniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const updateData = req.body;

        // Avatar yüklenmişse ekle
        if (req.file) {
            // Eski avatarı sil
            if (req.user.avatar) {
                deleteFile(req.user.avatar);
            }
            updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // Email ve phone değişikliği için özel kontrol
        if (updateData.email && updateData.email !== req.user.email) {
            const existingEmail = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: req.user._id }
            });
            if (existingEmail) {
                return res.status(400).json({
                    message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor'
                });
            }
            updateData.emailVerified = false;
        }

        if (updateData.phone && updateData.phone !== req.user.phone) {
            const existingPhone = await User.findOne({ 
                phone: updateData.phone,
                _id: { $ne: req.user._id }
            });
            if (existingPhone) {
                return res.status(400).json({
                    message: 'Bu telefon numarası başka bir kullanıcı tarafından kullanılıyor'
                });
            }
            updateData.phoneVerified = false;
        }

        // Adres güncelleme
        if (updateData.address) {
            if (typeof updateData.address === 'string') {
                // Eğer string olarak geldiyse, eski adres yapısını koruyarak street alanına ata
                updateData.address = {
                    ...req.user.address,
                    street: updateData.address
                };
            } else {
                // Nesne olarak geldiyse birleştir
                updateData.address = {
                    ...req.user.address,
                    ...updateData.address
                };
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Profil başarıyla güncellendi',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                message: `Bu ${field === 'email' ? 'email' : 'telefon'} zaten kullanılıyor`
            });
        }
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Şifre değiştirme
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Mevcut şifre gereklidir'),
    body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Şifre onayı eşleşmiyor');
        }
        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        
        // Mevcut şifre kontrolü
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Mevcut şifre hatalı'
            });
        }

        // Yeni şifre eski şifre ile aynı olmamalı
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                message: 'Yeni şifre mevcut şifreden farklı olmalıdır'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Şifre başarıyla değiştirildi'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Ehliyet bilgilerini güncelle
router.put('/driving-license', authenticateToken, uploadDocuments, handleUploadError, [
    body('number').trim().notEmpty().withMessage('Ehliyet numarası gereklidir'),
    body('expiryDate').isISO8601().withMessage('Geçerli son kullanma tarihi giriniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { number, expiryDate } = req.body;

        const updateData = {
            'drivingLicense.number': number,
            'drivingLicense.expiryDate': new Date(expiryDate),
            'drivingLicense.verified': false // Admin tarafından onaylanması gerekir
        };

        // Ehliyet belgesi yüklenmişse ekle
        if (req.files && req.files.drivingLicense) {
            updateData['drivingLicense.document'] = `/uploads/documents/${req.files.drivingLicense[0].filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            message: 'Ehliyet bilgileri başarıyla güncellendi',
            user
        });

    } catch (error) {
        console.error('Update driving license error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı durumunu güncelle (admin için)
router.patch('/:id/status', authenticateToken, requireAdmin, [
    body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Geçerli bir durum seçiniz')
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

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            message: 'Kullanıcı durumu güncellendi',
            user
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı rolünü güncelle (admin için)
router.patch('/:id/role', authenticateToken, requireAdmin, [
    body('role').isIn(['user', 'admin']).withMessage('Geçerli bir rol seçiniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Geçersiz rol',
                errors: errors.array()
            });
        }

        const { role } = req.body;

        // Kendi rolünü değiştiremez
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Kendi rolünüzü değiştiremezsiniz'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            message: 'Kullanıcı rolü güncellendi',
            user
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Ehliyet doğrulama (admin için)
router.patch('/:id/verify-license', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { verified } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 'drivingLicense.verified': verified },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            message: `Ehliyet ${verified ? 'onaylandı' : 'reddedildi'}`,
            user
        });

    } catch (error) {
        console.error('Verify license error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı silme (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Kendi hesabını silemez
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        await User.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' }
        );

        res.json({
            message: 'Kullanıcı hesabı pasif hale getirildi'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Profil fotoğrafını sil
router.delete('/profile/avatar', authenticateToken, async (req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(400).json({
                message: 'Profil fotoğrafı bulunmuyor'
            });
        }

        // Dosyayı sil
        deleteFile(req.user.avatar);

        // Veritabanından kaldır
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { avatar: 1 } }
        );

        res.json({
            message: 'Profil fotoğrafı başarıyla silindi'
        });

    } catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı istatistikleri (admin için)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });
        const verifiedDrivers = await User.countDocuments({ 'drivingLicense.verified': true });

        // Son 30 günde kayıt olan kullanıcılar
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            totalUsers,
            activeUsers,
            suspendedUsers,
            verifiedDrivers,
            newUsers
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Update user license information (simple endpoint for frontend)
router.put('/license', authenticateToken, async (req, res) => {
    try {
        const { drivingLicense } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { drivingLicense },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Ehliyet bilgileri başarıyla güncellendi',
            user
        });
    } catch (error) {
        console.error('License update error:', error);
        res.status(500).json({ message: 'Ehliyet bilgileri güncellenirken hata oluştu' });
    }
});

module.exports = router; 