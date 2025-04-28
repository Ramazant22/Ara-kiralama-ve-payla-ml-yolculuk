const Device = require('../models/Device');
const mobileConfig = require('../config/mobileConfig');

/**
 * Push bildirim gönderme servisi
 */
class PushNotificationService {
  constructor() {
    this.enabled = mobileConfig.pushNotifications.enabled;
    this.provider = mobileConfig.pushNotifications.provider;
    
    // Gerçek dünyada bu kısımda Firebase, OneSignal veya başka bir bildirim 
    // servisi için gerekli yapılandırmalar yapılır
    console.log(`Push bildirim servisi başlatıldı (${this.provider})`);
  }

  /**
   * Belirli bir kullanıcıya bildirim gönder
   * @param {string} userId - Kullanıcı ID
   * @param {object} notification - Bildirim içeriği
   * @param {object} options - Ek seçenekler
   */
  async sendToUser(userId, notification, options = {}) {
    if (!this.enabled) {
      console.log('Push bildirimler devre dışı');
      return;
    }

    try {
      // Kullanıcının aktif cihazlarını bul
      const devices = await Device.find({
        userId,
        isActive: true,
        pushToken: { $exists: true, $ne: '' }
      });

      if (devices.length === 0) {
        console.log(`Kullanıcı ${userId} için bildirim gönderilemedi: Aktif cihaz bulunamadı`);
        return;
      }

      // Her cihaza bildirim gönder
      const results = await Promise.all(
        devices.map(device => this.sendToDevice(device.pushToken, notification, options))
      );

      console.log(`${userId} kullanıcısına ${results.filter(r => r).length}/${devices.length} bildirim gönderildi`);
      return results;
    } catch (error) {
      console.error('Push bildirim gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Belirli bir cihaza bildirim gönder
   * @param {string} token - Cihaz push token
   * @param {object} notification - Bildirim içeriği
   * @param {object} options - Ek seçenekler
   */
  async sendToDevice(token, notification, options = {}) {
    if (!this.enabled || !token) {
      return false;
    }

    try {
      // Bu kısım gerçek dünyada Firebase, OneSignal veya başka bir 
      // bildirim servisi API'sini çağırır
      
      // Simüle edilmiş başarılı gönderim
      console.log(`Bildirim gönderildi: ${JSON.stringify(notification)}`);
      console.log(`Hedef token: ${token.substring(0, 10)}...`);
      return true;
    } catch (error) {
      console.error('Cihaza bildirim gönderme hatası:', error);
      return false;
    }
  }

  /**
   * Toplu bildirim gönder
   * @param {array} userIds - Kullanıcı ID listesi
   * @param {object} notification - Bildirim içeriği
   * @param {object} options - Ek seçenekler
   */
  async sendToMultipleUsers(userIds, notification, options = {}) {
    if (!this.enabled) {
      return;
    }

    try {
      const results = await Promise.all(
        userIds.map(userId => this.sendToUser(userId, notification, options))
      );
      
      return results;
    } catch (error) {
      console.error('Toplu bildirim gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Konuya göre bildirim gönder (örn. belirli bir araç için)
   * @param {string} topic - Konu adı
   * @param {object} notification - Bildirim içeriği
   * @param {object} options - Ek seçenekler
   */
  async sendToTopic(topic, notification, options = {}) {
    if (!this.enabled) {
      return false;
    }

    try {
      // Bu kısım gerçek dünyada Firebase, OneSignal veya başka bir 
      // bildirim servisi API'sini çağırır
      
      // Simüle edilmiş başarılı gönderim
      console.log(`${topic} konusuna bildirim gönderildi: ${JSON.stringify(notification)}`);
      return true;
    } catch (error) {
      console.error('Konu bildirimi gönderme hatası:', error);
      return false;
    }
  }
}

module.exports = new PushNotificationService(); 