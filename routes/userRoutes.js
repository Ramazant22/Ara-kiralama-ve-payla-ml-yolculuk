const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Korumalı rotalar
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);

// Admin rotaları
router.use(restrictTo('admin'));
router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router; 