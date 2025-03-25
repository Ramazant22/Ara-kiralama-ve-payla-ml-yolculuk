const express = require('express');
const rentalController = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);

// Kiralama işlemleri
router.route('/')
  .get(rentalController.getAllRentals)
  .post(rentalController.createRental);

router.route('/:id')
  .get(rentalController.getRental)
  .patch(rentalController.updateRental)
  .delete(rentalController.cancelRental);

// Kiralama durumu güncelleme
router.patch('/:id/status', rentalController.updateRentalStatus);

// Kullanıcının kiraladığı araçlar
router.get('/my-rentals', rentalController.getMyRentals);

// Kullanıcının kiraya verdiği araçlar
router.get('/my-rentals-as-owner', rentalController.getMyRentalsAsOwner);

module.exports = router; 