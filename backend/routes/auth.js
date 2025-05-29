const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Ad 2-50 karakter arası olmalıdır'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Soyad 2-50 karakter arası olmalıdır'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('phone')
        .matches(/^(\+90|0)?[0-9]{10}$/)
        .withMessage('Geçerli bir telefon numarası giriniz'),
    body('dateOfBirth')
        .isISO8601()
        .withMessage('Geçerli bir doğum tarihi giriniz')
], async (req, res) => {
    try {
        // Validation errors kontrolü
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone, 
            dateOfBirth,
            address 
        } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }

        // Telefon kontrolü
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                message: 'Bu telefon numarası zaten kullanılıyor'
            });
        }

        // Yaş kontrolü (18 yaş minimum)
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return res.status(400).json({
                message: 'Kayıt olabilmek için en az 18 yaşında olmalısınız'
            });
        }

        // Yeni kullanıcı oluştur
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth: birthDate,
            address: address || {}
        });

        await user.save();

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRE }
        );

        res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validasyon hatası',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı girişi
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    body('password')
        .notEmpty()
        .withMessage('Şifre gereklidir')
], async (req, res) => {
    try {
        // Validation errors kontrolü
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: 'Email veya şifre hatalı'
            });
        }

        // Şifre kontrolü
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Email veya şifre hatalı'
            });
        }

        // Hesap durumu kontrolü
        if (user.status !== 'active') {
            return res.status(401).json({
                message: 'Hesabınız aktif değil. Lütfen destek ekibi ile iletişime geçin.'
            });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRE }
        );

        res.json({
            message: 'Giriş başarılı',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                rating: user.rating
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı bilgilerini getir (mevcut oturum)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('drivingLicense')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            user: user
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Token doğrulama
router.post('/verify-token', authenticateToken, (req, res) => {
    res.json({
        message: 'Token geçerli',
        user: {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Şifre sıfırlama talebi (placeholder)
router.post('/forgot-password', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Geçerli bir email adresi giriniz')
], async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            // Güvenlik için her durumda başarılı mesajı döndür
            return res.json({
                message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.'
            });
        }

        // Burada email gönderme işlemi yapılacak
        // Şimdilik sadece başarılı mesajı döndür
        res.json({
            message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
});

// Çıkış (token blacklist işlemi burada yapılabilir)
router.post('/logout', authenticateToken, (req, res) => {
    // Client-side'da token silinecek
    res.json({
        message: 'Başarıyla çıkış yapıldı'
    });
});

module.exports = router; 