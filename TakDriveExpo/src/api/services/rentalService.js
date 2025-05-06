import apiClient from './apiClient';
import cacheService from './cacheService';

// Tüm kiralamaları getir
const getAllRentals = async (params = {}) => {
  try {
    const response = await apiClient.get('/mobile/rentals', { params });
    return response.data;
  } catch (error) {
    console.error('Kiralamaları getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Belirli bir kiralamayı getir
const getRentalById = async (id) => {
  try {
    const response = await apiClient.get(`/mobile/rentals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Kiralama detayı getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yeni kiralama oluştur
const createRental = async (rentalData) => {
  try {
    const response = await apiClient.post('/mobile/rentals', rentalData);
    return response.data;
  } catch (error) {
    console.error('Kiralama oluşturma hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kiralama güncelle
const updateRental = async (id, rentalData) => {
  try {
    const response = await apiClient.patch(`/mobile/rentals/${id}`, rentalData);
    return response.data;
  } catch (error) {
    console.error('Kiralama güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kiralama iptal et
const cancelRental = async (id, reason) => {
  try {
    const response = await apiClient.post(`/mobile/rentals/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Kiralama iptal hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kiralama tamamla
const completeRental = async (id, reviewData = {}) => {
  try {
    const response = await apiClient.post(`/mobile/rentals/${id}/complete`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Kiralama tamamlama hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kiracı olarak kiralamalarımı getir
const getMyRentalsAsRenter = async (status = '') => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get('/mobile/rentals/as-renter', { params });
    return response.data;
  } catch (error) {
    console.error('Kiracı kiralamalarını getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Araç sahibi olarak kiralamalarımı getir
const getMyRentalsAsOwner = async (status = '') => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get('/mobile/rentals/as-owner', { params });
    return response.data;
  } catch (error) {
    console.error('Araç sahibi kiralamalarını getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Kiralama ödemesi yap
const payForRental = async (rentalId, paymentData) => {
  try {
    const response = await apiClient.post(`/mobile/rentals/${rentalId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Kiralama ödeme hatası:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * İnternet bağlantısı geldiğinde bekleyen kiralama işlemlerini gerçekleştirir
 * @returns {Promise<{success: boolean}>}
 */
const processPendingRentalOperations = async () => {
  try {
    const pendingKey = 'pending_rentals';
    
    // Bekleyen kiralama işlemlerini işle
    await cacheService.processPendingRequests(pendingKey, async (requestData) => {
      const { action, data } = requestData;
      
      switch (action) {
        case 'create':
          await createRental(data);
          break;
        case 'update':
          const { rentalId, updateData } = data;
          await updateRental(rentalId, updateData);
          break;
        case 'cancel':
          await cancelRental(data.rentalId, data.reason);
          break;
        case 'complete':
          await completeRental(data.rentalId, data.reviewData);
          break;
        case 'payment':
          await payForRental(data.rentalId, data.paymentDetails);
          break;
        default:
          console.warn('Bilinmeyen kiralama işlemi:', action);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bekleyen kiralama işlemleri hatası:', error);
    throw error;
  }
};

/**
 * Çevrimdışı durumda bir kiralama işlemini bekleyen işlemlere ekler
 * @param {string} action - İşlem tipi ('create', 'update', 'cancel', 'complete', 'payment')
 * @param {Object} data - İşlem verileri
 * @returns {Promise<void>}
 */
const addPendingRentalOperation = async (action, data) => {
  const pendingKey = 'pending_rentals';
  await cacheService.addPendingRequest(pendingKey, { action, data });
};

export default {
  getAllRentals,
  getRentalById,
  createRental,
  updateRental,
  cancelRental,
  completeRental,
  getMyRentalsAsRenter,
  getMyRentalsAsOwner,
  payForRental,
  processPendingRentalOperations,
  addPendingRentalOperation
}; 