import api from '../api';

/**
 * Bir araca ait değerlendirmeleri getirir
 * @param {string} vehicleId - Araç ID'si
 * @param {object} options - Sayfalama veya sıralama seçenekleri
 * @returns {Promise} - Değerlendirme listesi
 */
const getVehicleReviews = async (vehicleId, options = {}) => {
  try {
    const response = await api.get(`/reviews/vehicle/${vehicleId}`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('Araç değerlendirmeleri alınırken hata:', error);
    throw error;
  }
};

/**
 * Bir kullanıcının yaptığı değerlendirmeleri getirir
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} options - Sayfalama veya sıralama seçenekleri
 * @returns {Promise} - Değerlendirme listesi
 */
const getUserReviews = async (userId, options = {}) => {
  try {
    const response = await api.get(`/reviews/user/${userId}`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('Kullanıcı değerlendirmeleri alınırken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir değerlendirmeyi ID'ye göre getirir
 * @param {string} reviewId - Değerlendirme ID'si
 * @returns {Promise} - Değerlendirme detayları
 */
const getReviewById = async (reviewId) => {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Değerlendirme detayları alınırken hata:', error);
    throw error;
  }
};

/**
 * Yeni bir değerlendirme oluşturur
 * @param {object} reviewData - Değerlendirme verileri
 * @returns {Promise} - Oluşturulan değerlendirme
 */
const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Değerlendirme oluşturulurken hata:', error);
    throw error;
  }
};

/**
 * Bir değerlendirmeyi günceller
 * @param {string} reviewId - Değerlendirme ID'si
 * @param {object} reviewData - Güncellenecek veriler
 * @returns {Promise} - Güncellenen değerlendirme
 */
const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Değerlendirme güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Bir değerlendirmeyi siler
 * @param {string} reviewId - Değerlendirme ID'si
 * @returns {Promise} - Silme işlemi sonucu
 */
const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Değerlendirme silinirken hata:', error);
    throw error;
  }
};

/**
 * Bir araca ait değerlendirme özetini getirir
 * @param {string} vehicleId - Araç ID'si
 * @returns {Promise} - Değerlendirme özeti (ortalama puan, toplam değerlendirme sayısı vb.)
 */
const getVehicleReviewSummary = async (vehicleId) => {
  try {
    const response = await api.get(`/reviews/summary/vehicle/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Araç değerlendirme özeti alınırken hata:', error);
    throw error;
  }
};

/**
 * Bir değerlendirmeye yorum yapar veya var olan yorumu günceller
 * @param {string} reviewId - Değerlendirme ID'si
 * @param {object} commentData - Yorum verileri
 * @returns {Promise} - Yorum sonucu
 */
const commentOnReview = async (reviewId, commentData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Değerlendirmeye yorum yapılırken hata:', error);
    throw error;
  }
};

export default {
  getVehicleReviews,
  getUserReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getVehicleReviewSummary,
  commentOnReview
}; 