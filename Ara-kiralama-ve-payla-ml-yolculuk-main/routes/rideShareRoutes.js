const express = require('express');
const rideShareController = require('../controllers/rideShareController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);

// Paylaşımlı yolculuk işlemleri
router.route('/')
  .get(rideShareController.getAllRideShares)
  .post(rideShareController.createRideShare);

router.route('/:id')
  .get(rideShareController.getRideShare)
  .patch(rideShareController.updateRideShare)
  .delete(rideShareController.cancelRideShare);

// Yolculuk arama
router.get('/search', rideShareController.searchRideShares);

// Kullanıcının oluşturduğu yolculuklar
router.get('/my-rides-as-driver', rideShareController.getMyRidesAsDriver);

// Kullanıcının katıldığı yolculuklar
router.get('/my-rides-as-passenger', rideShareController.getMyRidesAsPassenger);

// Yolculuğa katılma
router.post('/:id/book', rideShareController.bookRideShare);

module.exports = router; 