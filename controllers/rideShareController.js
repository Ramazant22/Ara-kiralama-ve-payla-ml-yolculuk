const RideShare = require('../models/RideShare');
const RideBooking = require('../models/RideBooking');
const Vehicle = require('../models/Vehicle');

// Tüm paylaşımlı yolculukları getirme
exports.getAllRideShares = async (req, res) => {
  try {
    const rideShares = await RideShare.find()
      .populate('driver', 'firstName lastName rating')
      .populate('vehicle', 'brand model year');

    res.status(200).json({
      status: 'success',
      results: rideShares.length,
      data: {
        rideShares
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Belirli bir paylaşımlı yolculuğu getirme
exports.getRideShare = async (req, res) => {
  try {
    const rideShare = await RideShare.findById(req.params.id)
      .populate('driver', 'firstName lastName rating phoneNumber')
      .populate('vehicle', 'brand model year seats photos');

    if (!rideShare) {
      return res.status(404).json({
        status: 'fail',
        message: 'Yolculuk bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        rideShare
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Yeni paylaşımlı yolculuk oluşturma
exports.createRideShare = async (req, res) => {
  try {
    const {
      vehicleId,
      startLocation,
      endLocation,
      departureTime,
      estimatedArrivalTime,
      availableSeats,
      pricePerSeat,
      route,
      description,
      allowSmoking,
      allowPets
    } = req.body;

    // Aracı kontrol et
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    // Sadece araç sahibi yolculuk oluşturabilir
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu araçla yolculuk oluşturma yetkiniz yok'
      });
    }

    // Koltuk sayısı kontrolü
    if (availableSeats > vehicle.seats) {
      return res.status(400).json({
        status: 'fail',
        message: `Araçta en fazla ${vehicle.seats} koltuk bulunmaktadır`
      });
    }

    // Tarih kontrolü
    const departure = new Date(departureTime);
    const arrival = new Date(estimatedArrivalTime);
    
    if (departure >= arrival) {
      return res.status(400).json({
        status: 'fail',
        message: 'Kalkış zamanı varış zamanından önce olmalıdır'
      });
    }

    // Yeni yolculuk oluştur
    const newRideShare = await RideShare.create({
      driver: req.user._id,
      vehicle: vehicleId,
      startLocation,
      endLocation,
      departureTime,
      estimatedArrivalTime,
      availableSeats,
      pricePerSeat,
      route,
      description,
      allowSmoking,
      allowPets,
      status: 'scheduled'
    });

    res.status(201).json({
      status: 'success',
      data: {
        rideShare: newRideShare
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Paylaşımlı yolculuk güncelleme
exports.updateRideShare = async (req, res) => {
  try {
    const rideShare = await RideShare.findById(req.params.id);

    if (!rideShare) {
      return res.status(404).json({
        status: 'fail',
        message: 'Yolculuk bulunamadı'
      });
    }

    // Sadece sürücü güncelleyebilir
    if (rideShare.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu yolculuğu güncelleme yetkiniz yok'
      });
    }

    // Başlamış veya tamamlanmış yolculuklar güncellenemez
    if (rideShare.status === 'in_progress' || rideShare.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Başlamış veya tamamlanmış yolculuklar güncellenemez'
      });
    }

    // Sadece belirli alanların güncellenmesine izin ver
    const allowedFields = [
      'departureTime',
      'estimatedArrivalTime',
      'availableSeats',
      'pricePerSeat',
      'description',
      'allowSmoking',
      'allowPets'
    ];
    
    const filteredBody = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const updatedRideShare = await RideShare.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        rideShare: updatedRideShare
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Paylaşımlı yolculuk iptal etme
exports.cancelRideShare = async (req, res) => {
  try {
    const rideShare = await RideShare.findById(req.params.id);

    if (!rideShare) {
      return res.status(404).json({
        status: 'fail',
        message: 'Yolculuk bulunamadı'
      });
    }

    // Sadece sürücü iptal edebilir
    if (rideShare.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu yolculuğu iptal etme yetkiniz yok'
      });
    }

    // Tamamlanmış yolculuklar iptal edilemez
    if (rideShare.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tamamlanmış yolculuklar iptal edilemez'
      });
    }

    rideShare.status = 'cancelled';
    await rideShare.save();

    // İlgili rezervasyonları da iptal et
    await RideBooking.updateMany(
      { rideShare: rideShare._id, status: { $nin: ['completed', 'cancelled'] } },
      { status: 'cancelled' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        rideShare
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Yolculuk arama
exports.searchRideShares = async (req, res) => {
  try {
    const {
      startLat,
      startLng,
      endLat,
      endLng,
      startDistance = 5000, // Varsayılan 5km
      endDistance = 5000,   // Varsayılan 5km
      departureDate,
      minSeats = 1,
      maxPrice
    } = req.query;

    let query = { status: 'scheduled' };

    // Başlangıç konumu bazlı arama
    if (startLat && startLng) {
      query.startLocation = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(startLng), parseFloat(startLat)]
          },
          $maxDistance: parseInt(startDistance)
        }
      };
    }

    // Bitiş konumu bazlı arama
    if (endLat && endLng) {
      query.endLocation = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(endLng), parseFloat(endLat)]
          },
          $maxDistance: parseInt(endDistance)
        }
      };
    }

    // Tarih bazlı arama
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.departureTime = {
        $gte: date,
        $lt: nextDay
      };
    }

    // Koltuk sayısı kontrolü
    query.availableSeats = { $gte: parseInt(minSeats) };

    // Fiyat kontrolü
    if (maxPrice) {
      query.pricePerSeat = { $lte: parseFloat(maxPrice) };
    }

    // Yolculukları ara
    const rideShares = await RideShare.find(query)
      .populate('driver', 'firstName lastName rating')
      .populate('vehicle', 'brand model year photos');

    res.status(200).json({
      status: 'success',
      results: rideShares.length,
      data: {
        rideShares
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcının oluşturduğu yolculukları getirme
exports.getMyRidesAsDriver = async (req, res) => {
  try {
    const rideShares = await RideShare.find({ driver: req.user._id })
      .populate('vehicle', 'brand model year photos');

    res.status(200).json({
      status: 'success',
      results: rideShares.length,
      data: {
        rideShares
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcının katıldığı yolculukları getirme
exports.getMyRidesAsPassenger = async (req, res) => {
  try {
    const bookings = await RideBooking.find({ passenger: req.user._id })
      .populate({
        path: 'rideShare',
        populate: [
          { path: 'driver', select: 'firstName lastName rating phoneNumber' },
          { path: 'vehicle', select: 'brand model year photos' }
        ]
      });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Yolculuğa katılma
exports.bookRideShare = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      seatsBooked,
      paymentMethod
    } = req.body;

    const rideShare = await RideShare.findById(req.params.id);

    if (!rideShare) {
      return res.status(404).json({
        status: 'fail',
        message: 'Yolculuk bulunamadı'
      });
    }

    // Yolculuk durumu kontrolü
    if (rideShare.status !== 'scheduled') {
      return res.status(400).json({
        status: 'fail',
        message: 'Bu yolculuk rezervasyona uygun değil'
      });
    }

    // Kendi yolculuğuna katılamaz
    if (rideShare.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Kendi yolculuğunuza katılamazsınız'
      });
    }

    // Koltuk sayısı kontrolü
    if (seatsBooked > rideShare.availableSeats) {
      return res.status(400).json({
        status: 'fail',
        message: `Bu yolculukta sadece ${rideShare.availableSeats} koltuk müsait`
      });
    }

    // Toplam fiyat hesaplama
    const totalPrice = seatsBooked * rideShare.pricePerSeat;

    // Yeni rezervasyon oluştur
    const newBooking = await RideBooking.create({
      rideShare: rideShare._id,
      passenger: req.user._id,
      driver: rideShare.driver,
      pickupLocation,
      dropoffLocation,
      seatsBooked,
      totalPrice,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Müsait koltuk sayısını güncelle
    rideShare.availableSeats -= seatsBooked;
    await rideShare.save();

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 