import api from '../api';
import { storeData, getData } from '../storage';

/**
 * Kullanıcının rezervasyonlarını getirir
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} filters - Filtreleme parametreleri
 * @returns {Promise} - Rezervasyon listesi
 */
const getUserReservations = async (userId, filters = {}) => {
  try {
    const response = await api.get(`/reservations/user/${userId}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Rezervasyonlar alınırken hata:', error);
    throw error;
  }
};

/**
 * Rezervasyon detaylarını getirir
 * @param {string} reservationId - Rezervasyon ID'si
 * @returns {Promise} - Rezervasyon detayları
 */
const getReservationById = async (reservationId) => {
  try {
    const response = await api.get(`/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Rezervasyon detayları alınırken hata:', error);
    throw error;
  }
};

/**
 * Yeni bir rezervasyon oluşturur
 * @param {object} reservationData - Rezervasyon bilgileri
 * @returns {Promise} - Oluşturulan rezervasyon
 */
const createReservation = async (reservationData) => {
  try {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  } catch (error) {
    console.error('Rezervasyon oluşturulurken hata:', error);
    throw error;
  }
};

/**
 * Rezervasyon iptal eder
 * @param {string} reservationId - Rezervasyon ID'si
 * @param {object} cancelData - İptal nedeni ve ek bilgiler
 * @returns {Promise} - İptal edilen rezervasyon
 */
const cancelReservation = async (reservationId, cancelData = {}) => {
  try {
    const response = await api.put(`/reservations/${reservationId}/cancel`, cancelData);
    return response.data;
  } catch (error) {
    console.error('Rezervasyon iptal edilirken hata:', error);
    throw error;
  }
};

/**
 * Rezervasyon durumunu günceller
 * @param {string} reservationId - Rezervasyon ID'si
 * @param {string} status - Yeni durum
 * @returns {Promise} - Güncellenen rezervasyon
 */
const updateReservationStatus = async (reservationId, status) => {
  try {
    const response = await api.put(`/reservations/${reservationId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Rezervasyon durumu güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Rezervasyon için ödeme yapar
 * @param {string} reservationId - Rezervasyon ID'si
 * @param {object} paymentData - Ödeme bilgileri
 * @returns {Promise} - Ödeme sonucu
 */
const makePayment = async (reservationId, paymentData) => {
  try {
    const response = await api.post(`/reservations/${reservationId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Ödeme yapılırken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir tarih aralığında aracın müsaitlik durumunu kontrol eder
 * @param {string} vehicleId - Araç ID'si 
 * @param {string} startDate - Başlangıç tarihi
 * @param {string} endDate - Bitiş tarihi
 * @returns {Promise} - Müsaitlik durumu
 */
const checkVehicleAvailability = async (vehicleId, startDate, endDate) => {
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
 * Belirli bir araç için rezervasyon tutarı hesaplar
 * @param {string} vehicleId - Araç ID'si
 * @param {string} startDate - Başlangıç tarihi
 * @param {string} endDate - Bitiş tarihi
 * @param {object} extras - Ek hizmetler
 * @returns {Promise} - Hesaplanan fiyat bilgisi
 */
const calculateReservationPrice = async (vehicleId, startDate, endDate, extras = {}) => {
  try {
    const response = await api.post(`/vehicles/${vehicleId}/calculate-price`, {
      startDate,
      endDate,
      extras
    });
    return response.data;
  } catch (error) {
    console.error('Rezervasyon fiyatı hesaplanırken hata:', error);
    throw error;
  }
};

export default {
  getUserReservations,
  getReservationById,
  createReservation,
  cancelReservation,
  updateReservationStatus,
  makePayment,
  checkVehicleAvailability,
  calculateReservationPrice
}; 