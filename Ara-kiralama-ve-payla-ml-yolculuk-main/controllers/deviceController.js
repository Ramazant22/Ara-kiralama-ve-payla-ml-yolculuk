const Device = require('../models/Device');
const mobileConfig = require('../config/mobileConfig');

/**
 * Yeni cihaz kaydı oluştur
 */
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, deviceName, deviceType, pushToken, appVersion, osVersion } = req.body;
    
    if (!deviceId || !deviceName || !deviceType) {
      return res.status(400).json({
        status: 'error',
        message: 'Cihaz ID, cihaz adı ve cihaz tipi zorunludur'
      });
    }

    // Kullanıcının kaç aktif cihazı olduğunu kontrol et
    const activeDeviceCount = await Device.countDocuments({
      userId: req.user._id,
      isActive: true
    });

    // Maksimum cihaz sayısı kontrolü
    if (activeDeviceCount >= mobileConfig.deviceVerification.maxDevices) {
      return res.status(400).json({
        status: 'error',
        message: `Maksimum ${mobileConfig.deviceVerification.maxDevices} aktif cihazınız olabilir. Lütfen eski bir cihazı kaldırın.`,
        code: 'MAX_DEVICES_REACHED'
      });
    }

    // Cihaz zaten kayıtlı mı kontrol et
    let device = await Device.findOne({
      userId: req.user._id,
      deviceId: deviceId
    });

    // Varsa güncelle, yoksa yeni oluştur
    if (device) {
      device.deviceName = deviceName;
      device.deviceType = deviceType;
      device.pushToken = pushToken;
      device.appVersion = appVersion;
      device.osVersion = osVersion;
      device.ipAddress = req.ip;
      device.lastActive = Date.now();
      device.isActive = true;
      
      await device.save();
    } else {
      device = await Device.create({
        userId: req.user._id,
        deviceId,
        deviceName,
        deviceType,
        pushToken,
        appVersion,
        osVersion,
        ipAddress: req.ip
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        device
      }
    });
  } catch (error) {
    console.error('Cihaz kaydı hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Cihaz kaydedilemedi',
      error: error.message
    });
  }
};

/**
 * Kullanıcının cihazlarını listele
 */
exports.getMyDevices = async (req, res) => {
  try {
    const devices = await Device.find({
      userId: req.user._id
    }).sort({ lastActive: -1 });

    res.status(200).json({
      status: 'success',
      results: devices.length,
      data: {
        devices
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Cihazlar listelenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Cihazı devre dışı bırak
 */
exports.deactivateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cihaz ID gereklidir'
      });
    }

    const device = await Device.findOne({
      userId: req.user._id,
      deviceId
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Cihaz bulunamadı'
      });
    }

    device.isActive = false;
    await device.save();

    res.status(200).json({
      status: 'success',
      message: 'Cihaz devre dışı bırakıldı'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Cihaz devre dışı bırakılırken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Push bildirim tokenını güncelle
 */
exports.updatePushToken = async (req, res) => {
  try {
    const { deviceId, pushToken } = req.body;

    if (!deviceId || !pushToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Cihaz ID ve push token gereklidir'
      });
    }

    const device = await Device.findOne({
      userId: req.user._id,
      deviceId
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Cihaz bulunamadı'
      });
    }

    device.pushToken = pushToken;
    device.lastActive = Date.now();
    await device.save();

    res.status(200).json({
      status: 'success',
      message: 'Push token güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Push token güncellenirken bir hata oluştu',
      error: error.message
    });
  }
}; 