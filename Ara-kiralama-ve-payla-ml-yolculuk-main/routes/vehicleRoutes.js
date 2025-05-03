const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(protect);

// Araç işlemleri
router.route('/')
  .get(vehicleController.getAllVehicles)
  .post(vehicleController.createVehicle);

router.route('/:id')
  .get(vehicleController.getVehicle)
  .patch(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

// Araç arama
router.get('/search', vehicleController.searchVehicles);

// Kullanıcının kendi araçları
router.get('/my-vehicles', vehicleController.getMyVehicles);

// Araç fotoğrafı yükleme
router.post('/:id/upload-photo', vehicleController.uploadVehiclePhoto);

module.exports = router; 