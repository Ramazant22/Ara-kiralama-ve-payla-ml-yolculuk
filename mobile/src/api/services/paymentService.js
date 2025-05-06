import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cacheService from '../config/cacheService';

/**
 * Ödeme işlemini gerçekleştirir
 * @param {Object} paymentDetails - Ödeme detayları
 * @returns {Promise<Object>} İşlem sonucu
 */
const processPayment = async (paymentDetails) => {
  try {
    const response = await apiClient.post('/mobile/payment/process', paymentDetails);
    return response.data;
  } catch (error) {
    console.error('Ödeme işlemi hatası:', error);
    throw error;
  }
};

/**
 * İade işlemi başlatır
 * @param {string} paymentId - Ödeme ID
 * @param {Object} refundDetails - İade detayları
 * @returns {Promise<Object>} İade işlem sonucu
 */
const initiateRefund = async (paymentId, refundDetails) => {
  try {
    const response = await apiClient.post(`/mobile/payment/${paymentId}/refund`, refundDetails);
    return response.data;
  } catch (error) {
    console.error('İade işlemi hatası:', error);
    throw error;
  }
};

/**
 * Fatura oluşturur
 * @param {string} paymentId - Ödeme ID
 * @returns {Promise<Object>} Fatura verisi
 */
const generateInvoice = async (paymentId) => {
  try {
    const response = await apiClient.get(`/mobile/payment/${paymentId}/invoice`);
    return response.data;
  } catch (error) {
    console.error('Fatura oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Yeni bir ödeme işlemi oluşturur
 * @param {Object} paymentData - Ödeme verileri
 * @returns {Promise<Object>} Ödeme sonucu
 */
const createPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/mobile/payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Ödeme oluşturma hatası:', error);
    
    // Offline durumunda işlemi bekleyen işlemlere ekle
    if (!await cacheService.isConnected()) {
      await addPendingPaymentOperation('create', paymentData);
      return {
        success: false,
        offline: true,
        message: 'Ödeme işlemi çevrimdışı durumda kaydedildi. İnternet bağlantısı sağlandığında işlenecektir.'
      };
    }
    
    throw error;
  }
};

/**
 * Ödeme durumunu kontrol eder
 * @param {string} paymentId - Ödeme ID
 * @returns {Promise<Object>} Ödeme durumu
 */
const getPaymentStatus = async (paymentId) => {
  try {
    const response = await apiClient.get(`/mobile/payments/${paymentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Ödeme durumu kontrol hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının ödeme geçmişini getirir
 * @param {Object} params - Sayfalama ve filtreleme parametreleri
 * @returns {Promise<Object>} Kullanıcının ödemeleri
 */
const getPaymentHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/mobile/payments/history', { params });
    return response.data;
  } catch (error) {
    console.error('Ödeme geçmişi getirme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının ödeme yöntemlerini getirir
 * @returns {Promise<Object>} Kullanıcının ödeme yöntemleri
 */
const getPaymentMethods = async () => {
  try {
    const response = await apiClient.get('/mobile/payments/methods');
    
    // Ödeme yöntemlerini önbelleğe kaydet (1 gün)
    const oneDayInMs = 24 * 60 * 60 * 1000;
    await cacheService.setCache('payment_methods', response.data, oneDayInMs);
    
    return response.data;
  } catch (error) {
    console.error('Ödeme yöntemleri getirme hatası:', error);
    
    // Offline durumunda önbellekten oku
    const cachedData = await cacheService.getCache('payment_methods');
    if (cachedData) {
      return {
        ...cachedData,
        _isFromCache: true
      };
    }
    
    throw error;
  }
};

/**
 * Yeni bir ödeme yöntemi ekler
 * @param {Object} methodData - Ödeme yöntemi verileri
 * @returns {Promise<Object>} Eklenen ödeme yöntemi
 */
const addPaymentMethod = async (methodData) => {
  try {
    const response = await apiClient.post('/mobile/payments/methods', methodData);
    return response.data;
  } catch (error) {
    console.error('Ödeme yöntemi ekleme hatası:', error);
    
    // Offline durumunda işlemi bekleyen işlemlere ekle
    if (!await cacheService.isConnected()) {
      await addPendingPaymentOperation('addMethod', methodData);
      return {
        success: false,
        offline: true,
        message: 'Ödeme yöntemi ekleme işlemi çevrimdışı durumda kaydedildi. İnternet bağlantısı sağlandığında işlenecektir.'
      };
    }
    
    throw error;
  }
};

/**
 * Ödeme yöntemini siler
 * @param {string} methodId - Ödeme yöntemi ID
 * @returns {Promise<Object>} Silme sonucu
 */
const deletePaymentMethod = async (methodId) => {
  try {
    const response = await apiClient.delete(`/mobile/payments/methods/${methodId}`);
    return response.data;
  } catch (error) {
    console.error('Ödeme yöntemi silme hatası:', error);
    
    // Offline durumunda işlemi bekleyen işlemlere ekle
    if (!await cacheService.isConnected()) {
      await addPendingPaymentOperation('deleteMethod', { methodId });
      return {
        success: false,
        offline: true,
        message: 'Ödeme yöntemi silme işlemi çevrimdışı durumda kaydedildi. İnternet bağlantısı sağlandığında işlenecektir.'
      };
    }
    
    throw error;
  }
};

/**
 * İnternet bağlantısı geldiğinde bekleyen ödeme işlemlerini gerçekleştirir
 * @returns {Promise<{success: boolean}>}
 */
const processPendingPaymentOperations = async () => {
  try {
    const pendingKey = 'pending_payments';
    
    // Bekleyen ödeme işlemlerini işle
    await cacheService.processPendingRequests(pendingKey, async (requestData) => {
      const { action, data } = requestData;
      
      switch (action) {
        case 'create':
          await createPayment(data);
          break;
        case 'addMethod':
          await addPaymentMethod(data);
          break;
        case 'deleteMethod':
          await deletePaymentMethod(data.methodId);
          break;
        default:
          console.warn('Bilinmeyen ödeme işlemi:', action);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bekleyen ödeme işlemleri hatası:', error);
    throw error;
  }
};

/**
 * Çevrimdışı durumda bir ödeme işlemini bekleyen işlemlere ekler
 * @param {string} action - İşlem tipi ('create', 'addMethod', 'deleteMethod')
 * @param {Object} data - İşlem verileri
 * @returns {Promise<void>}
 */
const addPendingPaymentOperation = async (action, data) => {
  const pendingKey = 'pending_payments';
  await cacheService.addPendingRequest(pendingKey, { action, data });
};

export default {
  processPayment,
  initiateRefund,
  generateInvoice,
  createPayment,
  getPaymentStatus,
  getPaymentHistory,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  processPendingPaymentOperations,
  addPendingPaymentOperation
}; 