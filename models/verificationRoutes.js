const express = require('express');
const verificationController = require('../controllers/verificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Tüm routelar için authentication gerekli
router.use(authController.protect);

// Kullanıcı doğrulama rotaları
router.post(
  '/documents',
  verificationController.uploadVerificationDocument,
  verificationController.submitVerificationDocument
);
router.get('/status', verificationController.getUserVerificationStatus);

// Admin routeları
router.use(authController.restrictTo('admin'));
router.get('/pending', verificationController.listPendingVerifications);
router.patch('/verify', verificationController.verifyDocument);
router.get('/users/:userId', verificationController.getUserVerificationStatusByAdmin);

module.exports = router;