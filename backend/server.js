const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const rideRoutes = require('./routes/rides');
const bookingRoutes = require('./routes/bookings');
const rideBookingRoutes = require('./routes/rideBookings');
const tripRoutes = require('./routes/trips');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const { router: notificationRoutes } = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ride-bookings', rideBookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'CarSharing API Server',
        status: 'Running',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Sunucu hatası!', 
        error: config.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint bulunamadı!' });
});

// MongoDB connection
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('MongoDB bağlantısı başarılı');
        app.listen(config.PORT, () => {
            console.log(`Server ${config.PORT} portunda çalışıyor`);
        });
    })
    .catch((error) => {
        console.error('MongoDB bağlantı hatası:', error);
        process.exit(1);
    }); 