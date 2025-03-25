const express = require('express');
const { protectMobile } = require('../middleware/mobileAuth');
const deviceController = require('../controllers/deviceController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const vehicleController = require('../controllers/vehicleController');
const rentalController = require('../controllers/rentalController');
const rideShareController = require('../controllers/rideShareController');
const syncController = require('../controllers/syncController');

const router = express.Router();

// Cihaz yönetimi
router.post('/devices/register', protectMobile, deviceController.registerDevice);
router.get('/devices', protectMobile, deviceController.getMyDevices);
router.put('/devices/push-token', protectMobile, deviceController.updatePushToken);
router.delete('/devices/:deviceId', protectMobile, deviceController.deactivateDevice);

// Senkronizasyon rotaları
router.post('/sync/offline-actions', protectMobile, syncController.syncOfflineActions);
router.post('/sync/usage-stats', protectMobile, syncController.saveUsageStats);
router.post('/sync/test-notification', protectMobile, syncController.testNotification);

// Genel Web API rotalarına mobil erişim noktaları

// Kimlik Doğrulama (Auth) - Web ile aynı ancak mobil middleware kullanılarak
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/forgot-password', authController.forgotPassword);
router.patch('/auth/reset-password/:token', authController.resetPassword);
router.patch('/auth/update-password', protectMobile, authController.updatePassword);

// Profil Yönetimi
router.get('/users/me', protectMobile, userController.getMe);
router.patch('/users/update-me', protectMobile, userController.updateMe);
router.delete('/users/delete-me', protectMobile, userController.deleteMe);

// Araç Yönetimi
router.get('/vehicles', protectMobile, vehicleController.getAllVehicles);
router.get('/vehicles/:id', protectMobile, vehicleController.getVehicle);
router.post('/vehicles', protectMobile, vehicleController.createVehicle);
router.patch('/vehicles/:id', protectMobile, vehicleController.updateVehicle);
router.delete('/vehicles/:id', protectMobile, vehicleController.deleteVehicle);

// Kiralama Yönetimi
router.get('/rentals', protectMobile, rentalController.getAllRentals);
router.get('/rentals/:id', protectMobile, rentalController.getRental);
router.post('/rentals', protectMobile, rentalController.createRental);
router.patch('/rentals/:id', protectMobile, rentalController.updateRental);
router.post('/rentals/:id/cancel', protectMobile, rentalController.cancelRental);

// Yolculuk Paylaşımı Yönetimi
router.get('/ride-shares', protectMobile, rideShareController.getAllRideShares);
router.get('/ride-shares/:id', protectMobile, rideShareController.getRideShare);
router.post('/ride-shares', protectMobile, rideShareController.createRideShare);
router.patch('/ride-shares/:id', protectMobile, rideShareController.updateRideShare);
router.post('/ride-shares/:id/cancel', protectMobile, rideShareController.cancelRideShare);

module.exports = router; 