const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Genel routelar
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/stats/:userId', reviewController.getUserReviewStats);

// Tüm routelar için authentication gerekli
router.use(authController.protect);

// Kullanıcı değerlendirme routeları
router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);
router.get('/my-stats', reviewController.getUserReviewStats);

router.route('/:reviewId')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// Admin routeları
router.use(authController.restrictTo('admin'));
router.get('/', reviewController.getAllReviews);
router.patch('/:reviewId/status', reviewController.updateReviewStatus);

module.exports = router;