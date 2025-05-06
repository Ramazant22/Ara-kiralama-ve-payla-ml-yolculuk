import api from '../api';
import cacheService from '../config/cacheService';
import { PENDING_KEYS } from '../../context/ConnectivityContext';

// Önbellek anahtarları
const CACHE_KEYS = {
  ALL_VEHICLES: 'all_vehicles',
  VEHICLE_DETAIL: (id) => `vehicle_${id}`,
  MY_VEHICLES: 'my_vehicles',
  SEARCH_VEHICLES: (params) => `search_vehicles_${JSON.stringify(params)}`,
  AVAILABLE_VEHICLES: (startDate, endDate) => `available_vehicles_${startDate}_${endDate}`
};

// Önbellek süresi (ms)
const CACHE_TTL = {
  VEHICLES: 30 * 60 * 1000, // 30 dakika
  MY_VEHICLES: 15 * 60 * 1000, // 15 dakika
  SEARCH_RESULTS: 10 * 60 * 1000 // 10 dakika
};

/**
 * Tüm araçları listeler
 * @param {object} filters - Filtreleme parametreleri
 * @returns {Promise} - Araç listesi
 */
const getAllVehicles = async (filters = {}) => {
  try {
    const response = await api.get('/vehicles', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Araçlar alınırken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir aracın detaylarını getirir
 * @param {string} vehicleId - Araç ID'si
 * @returns {Promise} - Araç detayları
 */
const getVehicleById = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Araç detayları alınırken hata:', error);
    throw error;
  }
};

/**
 * Araç arama
 * @param {string} query - Arama sorgusu
 * @param {object} filters - Filtreleme parametreleri
 * @returns {Promise} - Araç arama sonuçları
 */
const searchVehicles = async (query, filters = {}) => {
  try {
    const response = await api.get('/vehicles/search', {
      params: {
        query,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Araç araması yapılırken hata:', error);
    throw error;
  }
};

/**
 * Araç kategorilerine göre araçları getirir
 * @param {string} categoryId - Kategori ID'si
 * @returns {Promise} - Kategori araçları
 */
const getVehiclesByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/vehicles/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Kategori araçları alınırken hata:', error);
    throw error;
  }
};

/**
 * Kullanıcının araçlarını getirir
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise} - Kullanıcı araçları
 */
const getUserVehicles = async (userId) => {
  try {
    const response = await api.get(`/vehicles/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Kullanıcı araçları alınırken hata:', error);
    throw error;
  }
};

/**
 * Yeni bir araç ekler
 * @param {object} vehicleData - Araç bilgileri
 * @returns {Promise} - Eklenen araç
 */
const addVehicle = async (vehicleData) => {
  try {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  } catch (error) {
    console.error('Araç eklenirken hata:', error);
    throw error;
  }
};

/**
 * Bir aracı günceller
 * @param {string} vehicleId - Araç ID'si
 * @param {object} vehicleData - Güncellenecek veriler
 * @returns {Promise} - Güncellenen araç
 */
const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Araç güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Bir aracı siler
 * @param {string} vehicleId - Araç ID'si
 * @returns {Promise} - Silme işlemi sonucu
 */
const deleteVehicle = async (vehicleId) => {
  try {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Araç silinirken hata:', error);
    throw error;
  }
};

/**
 * Araç resmi yükler
 * @param {string} vehicleId - Araç ID'si
 * @param {FormData} formData - Resim verisi
 * @returns {Promise} - Yükleme sonucu
 */
const uploadVehicleImage = async (vehicleId, formData) => {
  try {
    const response = await api.post(`/vehicles/${vehicleId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Araç resmi yüklenirken hata:', error);
    throw error;
  }
};

/**
 * Bir aracın müsaitliğini kontrol eder
 * @param {string} vehicleId - Araç ID'si
 * @param {string} startDate - Başlangıç tarihi
 * @param {string} endDate - Bitiş tarihi
 * @returns {Promise} - Müsaitlik durumu
 */
const checkAvailability = async (vehicleId, startDate, endDate) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/availability`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Araç müsaitliği kontrol edilirken hata:', error);
    throw error;
  }
};

/**
 * Benzer araçları getirir
 * @param {string} vehicleId - Araç ID'si
 * @param {number} limit - Sonuç limiti
 * @returns {Promise} - Benzer araçlar listesi
 */
const getSimilarVehicles = async (vehicleId, limit = 5) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/similar`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Benzer araçlar alınırken hata:', error);
    throw error;
  }
};

/**
 * İnternet bağlantısı geldiğinde bekleyen araç işlemlerini gerçekleştirir
 * @returns {Promise<void>}
 */
const processPendingVehicleOperations = async () => {
  try {
    const pendingKey = 'pending_vehicle_updates';
    
    // Bekleyen araç güncelleme işlemlerini işle
    await cacheService.processPendingRequests(pendingKey, async (requestData) => {
      const { action, data } = requestData;
      
      switch (action) {
        case 'create':
          await addVehicle(data);
          break;
        case 'update':
          const { vehicleId, updateData } = data;
          await updateVehicle(vehicleId, updateData);
          break;
        case 'delete':
          await deleteVehicle(data.vehicleId);
          break;
        default:
          console.warn('Bilinmeyen araç işlemi:', action);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Bekleyen araç işlemleri hatası:', error);
    throw error;
  }
};

/**
 * Çevrimdışı durumda bir araç işlemini bekleyen işlemlere ekler
 * @param {string} action - İşlem tipi ('create', 'update', 'delete')
 * @param {Object} data - İşlem verileri
 * @returns {Promise<void>}
 */
const addPendingVehicleOperation = async (action, data) => {
  const pendingKey = 'pending_vehicle_updates';
  await cacheService.addPendingRequest(pendingKey, { action, data });
};

export default {
  getAllVehicles,
  getVehicleById,
  searchVehicles,
  getVehiclesByCategory,
  getUserVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage,
  checkAvailability,
  getSimilarVehicles,
  processPendingVehicleOperations,
  addPendingVehicleOperation
}; 