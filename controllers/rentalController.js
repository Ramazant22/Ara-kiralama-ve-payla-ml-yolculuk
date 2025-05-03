const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');

// Tüm kiralamaları getirme (admin için)
exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('vehicle', 'brand model year licensePlate')
      .populate('renter', 'firstName lastName')
      .populate('owner', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Belirli bir kiralamayı getirme
exports.getRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('vehicle', 'brand model year licensePlate photos')
      .populate('renter', 'firstName lastName phoneNumber')
      .populate('owner', 'firstName lastName phoneNumber');

    if (!rental) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kiralama bulunamadı'
      });
    }

    // Sadece kiralayan veya araç sahibi görüntüleyebilir
    if (rental.renter.toString() !== req.user._id.toString() && 
        rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu kiralamayı görüntüleme yetkiniz yok'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Yeni kiralama oluşturma
exports.createRental = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupLocation, dropoffLocation, rentalType, paymentMethod } = req.body;

    // Aracı kontrol et
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Araç bulunamadı'
      });
    }

    // Aracın müsait olup olmadığını kontrol et
    if (!vehicle.isAvailable) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bu araç şu anda kiralanabilir değil'
      });
    }

    // Tarih kontrolü
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        status: 'fail',
        message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır'
      });
    }

    // Toplam fiyat hesaplama
    let totalPrice;
    const diffTime = Math.abs(end - start);
    
    if (rentalType === 'hourly') {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      totalPrice = diffHours * vehicle.hourlyRate;
    } else {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalPrice = diffDays * vehicle.dailyRate;
    }

    // Yeni kiralama oluştur
    const newRental = await Rental.create({
      vehicle: vehicleId,
      renter: req.user._id,
      owner: vehicle.owner,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      totalPrice,
      rentalType,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: {
        rental: newRental
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kiralama güncelleme
exports.updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kiralama bulunamadı'
      });
    }

    // Sadece kiralayan güncelleyebilir
    if (rental.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu kiralamayı güncelleme yetkiniz yok'
      });
    }

    // Onaylanmış veya tamamlanmış kiralamalar güncellenemez
    if (rental.status === 'approved' || rental.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Onaylanmış veya tamamlanmış kiralamalar güncellenemez'
      });
    }

    // Sadece belirli alanların güncellenmesine izin ver
    const allowedFields = ['startDate', 'endDate', 'pickupLocation', 'dropoffLocation'];
    const filteredBody = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const updatedRental = await Rental.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        rental: updatedRental
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kiralama iptal etme
exports.cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kiralama bulunamadı'
      });
    }

    // Sadece kiralayan veya araç sahibi iptal edebilir
    if (rental.renter.toString() !== req.user._id.toString() && 
        rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu kiralamayı iptal etme yetkiniz yok'
      });
    }

    // Tamamlanmış kiralamalar iptal edilemez
    if (rental.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tamamlanmış kiralamalar iptal edilemez'
      });
    }

    rental.status = 'cancelled';
    await rental.save();

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kiralama durumu güncelleme (araç sahibi için)
exports.updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Geçersiz durum değeri'
      });
    }

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kiralama bulunamadı'
      });
    }

    // Sadece araç sahibi durumu güncelleyebilir
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bu kiralamayı güncelleme yetkiniz yok'
      });
    }

    // İptal edilmiş kiralamalar güncellenemez
    if (rental.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: 'İptal edilmiş kiralamalar güncellenemez'
      });
    }

    rental.status = status;
    
    // Eğer durum "completed" olarak güncellendiyse, ödeme durumunu da güncelle
    if (status === 'completed') {
      rental.paymentStatus = 'paid';
    }
    
    await rental.save();

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcının kiraladığı araçları getirme
exports.getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.user._id })
      .populate('vehicle', 'brand model year photos')
      .populate('owner', 'firstName lastName rating phoneNumber');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcının kiraya verdiği araçları getirme
exports.getMyRentalsAsOwner = async (req, res) => {
  try {
    const rentals = await Rental.find({ owner: req.user._id })
      .populate('vehicle', 'brand model year photos')
      .populate('renter', 'firstName lastName rating phoneNumber');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 