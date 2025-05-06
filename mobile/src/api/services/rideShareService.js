import apiClient from './apiClient';
import cacheService from './cacheService';

// Tüm yolculukları getir
const getAllRideShares = async (params = {}) => {
  try {
    const response = await apiClient.get('/mobile/ride-shares', { params });
    return response.data;
  } catch (error) {
    console.error('Yolculukları getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Belirli bir yolculuğu getir
const getRideShareById = async (id) => {
  try {
    const response = await apiClient.get(`/mobile/ride-shares/${id}`);
    return response.data;
  } catch (error) {
    console.error('Yolculuk detayı getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yeni yolculuk oluştur
const createRideShare = async (rideShareData) => {
  try {
    const response = await apiClient.post('/mobile/ride-shares', rideShareData);
    return response.data;
  } catch (error) {
    console.error('Yolculuk oluşturma hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolculuk güncelle
const updateRideShare = async (id, rideShareData) => {
  try {
    const response = await apiClient.patch(`/mobile/ride-shares/${id}`, rideShareData);
    return response.data;
  } catch (error) {
    console.error('Yolculuk güncelleme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolculuk iptal et
const cancelRideShare = async (id, reason) => {
  try {
    const response = await apiClient.post(`/mobile/ride-shares/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Yolculuk iptal hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Sürücü olarak yolculuklarımı getir
const getMyRideSharesAsDriver = async (status = '') => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get('/mobile/ride-shares/as-driver', { params });
    return response.data;
  } catch (error) {
    console.error('Sürücü yolculuklarını getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolcu olarak yolculuklarımı getir
const getMyRideSharesAsPassenger = async (status = '') => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get('/mobile/ride-shares/as-passenger', { params });
    return response.data;
  } catch (error) {
    console.error('Yolcu yolculuklarını getirme hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolculuk rezervasyonu yap
const bookRideShare = async (rideShareId, bookingData) => {
  try {
    const response = await apiClient.post(`/mobile/ride-shares/${rideShareId}/book`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Yolculuk rezervasyon hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolculuk rezervasyonunu iptal et
const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await apiClient.post(`/mobile/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Rezervasyon iptal hatası:', error.response?.data || error.message);
    throw error;
  }
};

// Yolculuk ara (konum bazlı)
const searchRideShares = async (filters) => {
  try {
    const response = await apiClient.get('/mobile/ride-shares/search', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Yolculuk arama hatası:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * İnternet bağlantısı geldiğinde bekleyen yolculuk işlemlerini gerçekleştirir
 * @returns {Promise<{success: boolean}>}
 */
const processPendingRideOperations = async () => {
  try {
    const pendingKey = 'pending_rides';
    
    // Bekleyen yolculuk işlemlerini işle
    await cacheService.processPendingRequests(pendingKey, async (requestData) => {
      const { action, data } = requestData;
      
      switch (action) {
        case 'create':
          await createRideShare(data);
          break;
        case 'update':
          const { rideId, updateData } = data;
          await updateRideShare(rideId, updateData);
          break;
        case 'cancel':
          await cancelRideShare(data.rideId, data.reason);
          break;
        case 'book':
          await bookRideShare(data.rideId, data.bookingDetails);
          break;
        case 'cancelBooking':
          await cancelBooking(data.rideId, data.bookingId, data.reason);
          break;
        default:
          console.warn('Bilinmeyen yolculuk işlemi:', action);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bekleyen yolculuk işlemleri hatası:', error);
    throw error;
  }
};

/**
 * Çevrimdışı durumda bir yolculuk işlemini bekleyen işlemlere ekler
 * @param {string} action - İşlem tipi ('create', 'update', 'cancel', 'book', 'cancelBooking')
 * @param {Object} data - İşlem verileri
 * @returns {Promise<void>}
 */
const addPendingRideOperation = async (action, data) => {
  const pendingKey = 'pending_rides';
  await cacheService.addPendingRequest(pendingKey, { action, data });
};

export default {
  getAllRideShares,
  getRideShareById,
  createRideShare,
  updateRideShare,
  cancelRideShare,
  getMyRideSharesAsDriver,
  getMyRideSharesAsPassenger,
  bookRideShare,
  cancelBooking,
  searchRideShares,
  processPendingRideOperations,
  addPendingRideOperation
}; 