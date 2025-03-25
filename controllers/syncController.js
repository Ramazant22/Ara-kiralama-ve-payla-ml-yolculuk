const syncService = require('../utils/syncService');

/**
 * Çevrimdışı işlemleri senkronize et
 */
exports.syncOfflineActions = async (req, res) => {
  try {
    const { offlineActions } = req.body;
    
    if (!offlineActions) {
      return res.status(400).json({
        status: 'error',
        message: 'Senkronize edilecek işlemler sağlanmalıdır'
      });
    }

    const result = await syncService.syncOfflineActions(
      req.user._id,
      offlineActions
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Senkronizasyon hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Senkronizasyon sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kullanım istatistiklerini kaydet
 */
exports.saveUsageStats = async (req, res) => {
  try {
    const { deviceId, stats } = req.body;
    
    if (!deviceId || !stats) {
      return res.status(400).json({
        status: 'error',
        message: 'Cihaz ID ve istatistikler gereklidir'
      });
    }

    const result = await syncService.saveUsageStats(
      req.user._id,
      deviceId,
      stats
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('İstatistik kaydetme hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'İstatistikler kaydedilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kullanıcıya bildirim gönder (test amaçlı)
 */
exports.testNotification = async (req, res) => {
  try {
    const { message, title, payload } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Bildirim mesajı gereklidir'
      });
    }

    const success = await syncService.notifyUser(req.user._id, {
      message,
      title: title || 'Test Bildirimi',
      payload: payload || {}
    });

    if (success) {
      res.status(200).json({
        status: 'success',
        message: 'Bildirim gönderildi'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Bildirim gönderilemedi'
      });
    }
  } catch (error) {
    console.error('Test bildirim hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Bildirim gönderilirken bir hata oluştu',
      error: error.message
    });
  }
}; 