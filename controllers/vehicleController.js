const Vehicle = require('../models/Vehicle');

// Tüm araçları getirme
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('owner', 'firstName lastName rating');

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      data: {
        vehicles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Belirli bir aracı getirme
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'firstName lastName rating phoneNumber');

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicle
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Yeni araç oluşturma
exports.createVehicle = async (req, res) => {
  try {
    // Araç sahibi olarak mevcut kullanıcıyı ekle
    req.body.owner = req.user._id;

    const newVehicle = await Vehicle.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        vehicle: newVehicle
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Araç güncelleme
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    // Sadece araç sahibi güncelleyebilir
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu aracı güncelleme yetkiniz yok'
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        vehicle: updatedVehicle
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Araç silme
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    // Sadece araç sahibi silebilir
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu aracı silme yetkiniz yok'
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Araç arama
exports.searchVehicles = async (req, res) => {
  try {
    const {
      lat,
      lng,
      distance = 10000, // Varsayılan 10km
      startDate,
      endDate,
      vehicleType,
      minSeats,
      maxPrice,
      transmission,
      fuelType
    } = req.query;

    // Konum bazlı arama için
    let query = {};

    // Konum belirtilmişse, belirli bir mesafe içindeki araçları ara
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      };
    }

    // Diğer filtreler
    if (vehicleType) query.vehicleType = vehicleType;
    if (minSeats) query.seats = { $gte: parseInt(minSeats) };
    if (maxPrice) query.dailyRate = { $lte: parseFloat(maxPrice) };
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;

    // Sadece müsait araçları getir
    query.isAvailable = true;

    // Araçları ara
    const vehicles = await Vehicle.find(query).populate('owner', 'firstName lastName rating');

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      data: {
        vehicles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcının kendi araçlarını getirme
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      data: {
        vehicles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Araç fotoğrafı yükleme (gerçek uygulamada dosya yükleme işlemi eklenecek)
exports.uploadVehiclePhoto = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    // Sadece araç sahibi fotoğraf yükleyebilir
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu araca fotoğraf yükleme yetkiniz yok'
      });
    }

    // Gerçek uygulamada burada dosya yükleme işlemi yapılacak
    // Şimdilik örnek bir URL ekleyelim
    const photoUrl = `https://example.com/vehicle-photos/${req.params.id}-${Date.now()}.jpg`;
    
    vehicle.photos.push(photoUrl);
    await vehicle.save();

    res.status(200).json({
      status: 'success',
      data: {
        vehicle
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 