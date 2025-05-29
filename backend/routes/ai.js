const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const config = require('../config');

const router = express.Router();

// Get available AI models
router.get('/models', async (req, res) => {
    try {
        res.json({
            success: true,
            current_model: config.AI_MODELS.CHAT_MODEL,
            available_models: config.AI_MODELS.AVAILABLE_MODELS
        });
    } catch (error) {
        console.error('Models fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Model bilgileri alınamadı'
        });
    }
});

// Change AI model (admin only)
router.post('/change-model', [
    body('model').isString().isLength({ min: 1 }).withMessage('Model adı gerekli')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz model adı',
                errors: errors.array()
            });
        }

        const { model } = req.body;

        // Check if model exists in available models
        if (!config.AI_MODELS.AVAILABLE_MODELS[model]) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz model. Mevcut modeller listesini kontrol edin.'
            });
        }

        // Update the current model
        config.AI_MODELS.CHAT_MODEL = model;
        aiService.chatModel = model;

        console.log(`AI model changed to: ${model}`);

        res.json({
            success: true,
            message: `AI model başarıyla ${model} olarak değiştirildi`,
            current_model: model,
            model_info: config.AI_MODELS.AVAILABLE_MODELS[model]
        });

    } catch (error) {
        console.error('Model change error:', error);
        res.status(500).json({
            success: false,
            message: 'Model değiştirilemedi',
            error: error.message
        });
    }
});

// Chatbot endpoint
router.post('/chat', [
    body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Mesaj 1-500 karakter arası olmalıdır'),
    body('context').optional().isObject()
], async (req, res) => {
    try {
        console.log('AI Chat endpoint hit:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { message, context = {} } = req.body;

        // Kullanıcı mesajına göre ilgili veriyi getir
        let enhancedContext = { ...context };

        // Araç arama anahtar kelimeleri
        const vehicleKeywords = ['araç', 'araba', 'oto', 'kiralama', 'rent', 'car'];
        // Yolculuk arama anahtar kelimeleri  
        const rideKeywords = ['yolculuk', 'seyahat', 'paylaşım', 'ride', 'trip'];

        const lowerMessage = message.toLowerCase();

        // Araç ile ilgili soru ise araçları getir
        if (vehicleKeywords.some(keyword => lowerMessage.includes(keyword))) {
            try {
                const vehicles = await Vehicle.find({ status: 'available' })
                    .populate('owner', 'firstName lastName rating')
                    .limit(5)
                    .sort({ createdAt: -1 });
                enhancedContext.vehicles = vehicles;
                console.log(`Found ${vehicles.length} vehicles for context`);
            } catch (dbError) {
                console.error('Database error fetching vehicles:', dbError);
            }
        }

        // Yolculuk ile ilgili soru ise yolculukları getir
        if (rideKeywords.some(keyword => lowerMessage.includes(keyword))) {
            try {
                const rides = await Ride.find({ 
                    status: 'active',
                    departureDate: { $gte: new Date() }
                })
                    .populate('driver', 'firstName lastName rating')
                    .limit(5)
                    .sort({ departureDate: 1 });
                enhancedContext.rides = rides;
                console.log(`Found ${rides.length} rides for context`);
            } catch (dbError) {
                console.error('Database error fetching rides:', dbError);
            }
        }

        // AI ile sohbet et
        const aiResponse = await aiService.chatWithAI(message, enhancedContext);
        
        console.log('AI response success:', aiResponse.success);

        res.json(aiResponse);

    } catch (error) {
        console.error('AI Chat Route Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'AI servisi şu anda kullanılamıyor',
            error: error.message 
        });
    }
});

// Metin düzeltme endpoint
router.post('/correct-text', authenticateToken, [
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Metin 1-500 karakter arası olmalıdır'),
    body('type').optional().isIn(['vehicle_brand', 'vehicle_model', 'city', 'description', 'general'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { text, type = 'general' } = req.body;

        const correction = await aiService.correctText(text, type);

        res.json(correction);

    } catch (error) {
        console.error('Text Correction Error:', error);
        res.status(500).json({ 
            message: 'Metin düzeltme servisi şu anda kullanılamıyor',
            error: error.message 
        });
    }
});

// Kullanıcı puanı hesaplama
router.get('/user-score/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Basit bir kullanıcı objesi oluştur (gerçek uygulamada User model'den gelecek)
        const user = {
            createdAt: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random eski tarih
            rating: { average: 3 + Math.random() * 2 }, // 3-5 arası random rating
            completedBookings: Math.floor(Math.random() * 20),
            avatar: Math.random() > 0.5 ? 'avatar.jpg' : null,
            phone: Math.random() > 0.3 ? '+905555555555' : null,
            bio: Math.random() > 0.7 ? 'Bio text here' : null
        };

        const score = aiService.calculateUserScore(user);

        res.json({
            success: true,
            userId,
            score,
            details: {
                accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
                rating: user.rating.average,
                completedBookings: user.completedBookings,
                profileComplete: !!(user.avatar && user.phone && user.bio)
            }
        });

    } catch (error) {
        console.error('User Score Error:', error);
        res.status(500).json({ 
            message: 'Kullanıcı puanı hesaplanamadı',
            error: error.message 
        });
    }
});

// SEO başlık önerme
router.post('/generate-seo-title', authenticateToken, [
    body('type').isIn(['vehicle', 'ride']).withMessage('Tip vehicle veya ride olmalıdır'),
    body('data').isObject().withMessage('Veri objesi gereklidir')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Giriş verileri hatalı',
                errors: errors.array()
            });
        }

        const { type, data } = req.body;

        const seoTitle = await aiService.generateSEOTitle(type, data);

        res.json(seoTitle);

    } catch (error) {
        console.error('SEO Title Generation Error:', error);
        res.status(500).json({ 
            message: 'SEO başlık oluşturulamadı',
            error: error.message 
        });
    }
});

// Popüler konuları getir
router.get('/popular-topics', async (req, res) => {
    try {
        const topics = [
            {
                title: 'Araç Kiralama Rehberi',
                description: 'Nasıl güvenli araç kiralayabilirim?',
                keywords: ['araç', 'kiralama', 'güvenlik', 'rehber']
            },
            {
                title: 'Yolculuk Paylaşımı',
                description: 'Yolculuk paylaşımında nelere dikkat etmeliyim?',
                keywords: ['yolculuk', 'paylaşım', 'güvenlik', 'ipuçları']
            },
            {
                title: 'Fiyat Karşılaştırması',
                description: 'En uygun fiyatlı araçları bul',
                keywords: ['fiyat', 'karşılaştırma', 'ucuz', 'ekonomik']
            },
            {
                title: 'Platform Özellikleri',
                description: 'TakDrive\'da neler yapabilirsiniz?',
                keywords: ['özellik', 'platform', 'nasıl', 'kullanım']
            }
        ];

        res.json({
            success: true,
            topics
        });

    } catch (error) {
        console.error('Popular Topics Error:', error);
        res.status(500).json({ 
            message: 'Popüler konular yüklenemedi',
            error: error.message 
        });
    }
});

module.exports = router; 