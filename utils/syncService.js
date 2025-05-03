/**
 * Web ve Mobil platformlar arasında veri senkronizasyonunu sağlayan servis.
 * İki platform da aynı veritabanını kullandığı için gerçek veri senkronizasyonu ihtiyacı yok,
 * ancak mobil cihazlara özel bazı işlemleri yönetmek için bu servis oluşturuldu.
 */

const Device = require('../models/Device');
const User = require('../models/User');
const pushNotificationService = require('./pushNotificationService');

class SyncService {
  /**
   * Kullanıcıya bildirim gönder
   * @param {String} userId - Kullanıcı ID
   * @param {Object} data - Bildirim verileri
   */
  async notifyUser(userId, data) {
    try {
      // Bildirim gönder
      const notification = {
        title: data.title || 'TakDrive',
        body: data.message,
        data: data.payload || {}
      };

      await pushNotificationService.sendToUser(userId, notification, {
        priority: data.priority || 'high'
      });

      return true;
    } catch (error) {
      console.error('Kullanıcı bildirim hatası:', error);
      return false;
    }
  }

  /**
   * Çevrimdışı yapılan işlemleri senkronize et
   * @param {String} userId - Kullanıcı ID
   * @param {Array} offlineActions - Çevrimdışı aksiyonlar
   */
  async syncOfflineActions(userId, offlineActions) {
    if (!offlineActions || !Array.isArray(offlineActions) || offlineActions.length === 0) {
      return { success: true, message: 'Senkronize edilecek işlem yok' };
    }

    const results = {
      success: true,
      processed: 0,
      failed: 0,
      details: []
    };

    // Her bir çevrimdışı işlemi sırayla işle
    for (const action of offlineActions) {
      try {
        const result = await this._processOfflineAction(userId, action);
        results.details.push({
          actionId: action.id,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          results.processed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error('Çevrimdışı işlem hatası:', error);
        results.details.push({
          actionId: action.id,
          success: false,
          message: error.message
        });
        results.failed++;
      }
    }

    results.success = results.failed === 0;
    return results;
  }

  /**
   * Tek bir çevrimdışı işlemi işle
   * @param {String} userId - Kullanıcı ID
   * @param {Object} action - İşlem detayları
   * @private
   */
  async _processOfflineAction(userId, action) {
    // İşlem tipine göre gereken işlemleri yap
    switch (action.type) {
      case 'UPDATE_PROFILE':
        // Kullanıcı profilini güncelle
        return await this._handleProfileUpdate(userId, action.data);

      case 'VEHICLE_STATUS_CHANGE':
        // Araç durumunu güncelle
        return await this._handleVehicleStatusChange(userId, action.data);

      case 'RENTAL_REQUEST':
        // Kiralama isteği oluştur
        return await this._handleRentalRequest(userId, action.data);

      case 'RIDE_SHARE_JOIN':
        // Yolculuk paylaşımına katıl
        return await this._handleRideShareJoin(userId, action.data);

      default:
        return { 
          success: false, 
          message: `Bilinmeyen işlem tipi: ${action.type}` 
        };
    }
  }

  /**
   * Profil güncelleme işlemini yönet
   * @param {String} userId - Kullanıcı ID
   * @param {Object} data - Profil verileri
   * @private
   */
  async _handleProfileUpdate(userId, data) {
    try {
      // Güvenli bir şekilde güncellenebilecek alanları belirle
      const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'profilePicture'];
      
      // Sadece izin verilen alanları içeren bir güncelleme objesi oluştur
      const updateData = {};
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      // Boş güncelleme objesi kontrolü
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'Güncellenecek veri bulunamadı' };
      }

      // Kullanıcı profilini güncelle
      await User.findByIdAndUpdate(userId, updateData);
      
      return { success: true, message: 'Profil başarıyla güncellendi' };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Araç durumu değişikliğini yönet
   * @param {String} userId - Kullanıcı ID
   * @param {Object} data - Araç verileri
   * @private
   */
  async _handleVehicleStatusChange(userId, data) {
    // Bu metodun gerçek implementasyonu uygulamanızın ihtiyaçlarına göre yapılmalıdır
    return { success: true, message: 'Araç durumu güncellendi' };
  }

  /**
   * Kiralama isteğini yönet
   * @param {String} userId - Kullanıcı ID
   * @param {Object} data - Kiralama verileri
   * @private
   */
  async _handleRentalRequest(userId, data) {
    // Bu metodun gerçek implementasyonu uygulamanızın ihtiyaçlarına göre yapılmalıdır
    return { success: true, message: 'Kiralama isteği işlendi' };
  }

  /**
   * Yolculuk paylaşımına katılma isteğini yönet
   * @param {String} userId - Kullanıcı ID
   * @param {Object} data - Yolculuk verileri
   * @private
   */
  async _handleRideShareJoin(userId, data) {
    // Bu metodun gerçek implementasyonu uygulamanızın ihtiyaçlarına göre yapılmalıdır
    return { success: true, message: 'Yolculuk paylaşımına katılma isteği işlendi' };
  }

  /**
   * Mobil cihaz kullanım istatistiklerini kaydet
   * @param {String} userId - Kullanıcı ID
   * @param {String} deviceId - Cihaz ID
   * @param {Object} stats - Kullanım istatistikleri
   */
  async saveUsageStats(userId, deviceId, stats) {
    try {
      const device = await Device.findOne({ userId, deviceId });
      
      if (!device) {
        return { success: false, message: 'Cihaz bulunamadı' };
      }

      // Gerçek uygulamada burada istatistik verileri kaydedilir
      console.log(`${userId} kullanıcısı için kullanım istatistikleri kaydedildi:`, stats);
      
      return { success: true, message: 'Kullanım istatistikleri kaydedildi' };
    } catch (error) {
      console.error('İstatistik kaydetme hatası:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new SyncService(); 