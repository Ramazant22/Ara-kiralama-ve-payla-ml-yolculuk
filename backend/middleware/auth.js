const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// JWT token doğrulama middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Erişim reddedildi. Token gereklidir.' 
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                message: 'Geçersiz token. Kullanıcı bulunamadı.' 
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ 
                message: 'Hesap aktif değil.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Geçersiz token.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token süresi dolmuş.' 
            });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası.' 
        });
    }
};

// Admin rolü kontrolü
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Bu işlem için admin yetkisi gereklidir.' 
        });
    }
    next();
};

// Araç sahibi kontrolü
const requireVehicleOwner = async (req, res, next) => {
    try {
        const Vehicle = require('../models/Vehicle');
        const vehicle = await Vehicle.findById(req.params.vehicleId);
        
        if (!vehicle) {
            return res.status(404).json({ 
                message: 'Araç bulunamadı.' 
            });
        }

        if (vehicle.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Bu araç üzerinde yetkiniz bulunmamaktadır.' 
            });
        }

        req.vehicle = vehicle;
        next();
    } catch (error) {
        console.error('Vehicle owner check error:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası.' 
        });
    }
};

// Sürücü kontrolü (ride için)
const requireRideDriver = async (req, res, next) => {
    try {
        const Ride = require('../models/Ride');
        const ride = await Ride.findById(req.params.rideId);
        
        if (!ride) {
            return res.status(404).json({ 
                message: 'Yolculuk bulunamadı.' 
            });
        }

        if (ride.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Bu yolculuk üzerinde yetkiniz bulunmamaktadır.' 
            });
        }

        req.ride = ride;
        next();
    } catch (error) {
        console.error('Ride driver check error:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası.' 
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireVehicleOwner,
    requireRideDriver
}; 