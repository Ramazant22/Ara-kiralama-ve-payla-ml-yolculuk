import api from '../api';
import { storeData, getData } from '../storage';

/**
 * Veritabanından tüm koleksiyonları getirir
 * @returns {Promise} - Tüm koleksiyonlar
 */
const getAllCollections = async () => {
  try {
    const response = await api.get('/db/collections');
    return response.data;
  } catch (error) {
    console.error('Koleksiyonlar alınırken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir koleksiyondan tüm dökümanları getirir
 * @param {string} collectionName - Koleksiyon adı
 * @param {object} filters - Filtreleme parametreleri
 * @param {number} limit - Sonuç limiti
 * @param {number} skip - Atlama sayısı (sayfalama için)
 * @returns {Promise} - Dökümanlar
 */
const getDocuments = async (collectionName, filters = {}, limit = 100, skip = 0) => {
  try {
    const response = await api.get(`/db/collections/${collectionName}`, {
      params: {
        filters: JSON.stringify(filters),
        limit,
        skip
      }
    });
    return response.data;
  } catch (error) {
    console.error(`${collectionName} dökümanları alınırken hata:`, error);
    throw error;
  }
};

/**
 * Belirli bir koleksiyona döküman ekler
 * @param {string} collectionName - Koleksiyon adı
 * @param {object} document - Eklenecek döküman
 * @returns {Promise} - Eklenen döküman
 */
const insertDocument = async (collectionName, document) => {
  try {
    const response = await api.post(`/db/collections/${collectionName}`, document);
    return response.data;
  } catch (error) {
    console.error(`${collectionName} koleksiyonuna döküman eklenirken hata:`, error);
    throw error;
  }
};

/**
 * Belirli bir koleksiyondaki dökümanı günceller
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} documentId - Döküman ID'si
 * @param {object} updateData - Güncellenecek veriler
 * @returns {Promise} - Güncellenen döküman
 */
const updateDocument = async (collectionName, documentId, updateData) => {
  try {
    const response = await api.put(`/db/collections/${collectionName}/${documentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`${collectionName} koleksiyonundaki döküman güncellenirken hata:`, error);
    throw error;
  }
};

/**
 * Belirli bir koleksiyondan döküman siler
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} documentId - Döküman ID'si
 * @returns {Promise} - Silme işlemi sonucu
 */
const deleteDocument = async (collectionName, documentId) => {
  try {
    const response = await api.delete(`/db/collections/${collectionName}/${documentId}`);
    return response.data;
  } catch (error) {
    console.error(`${collectionName} koleksiyonundan döküman silinirken hata:`, error);
    throw error;
  }
};

/**
 * Veritabanı durumunu getirir
 * @returns {Promise} - Veritabanı durumu
 */
const getDatabaseStatus = async () => {
  try {
    const response = await api.get('/db/status');
    return response.data;
  } catch (error) {
    console.error('Veritabanı durumu alınırken hata:', error);
    throw error;
  }
};

/**
 * Özel sorgu çalıştırır
 * @param {string} collectionName - Koleksiyon adı
 * @param {object} pipeline - Aggregation pipeline
 * @returns {Promise} - Sorgu sonuçları
 */
const runAggregation = async (collectionName, pipeline) => {
  try {
    const response = await api.post(`/db/collections/${collectionName}/aggregate`, {
      pipeline
    });
    return response.data;
  } catch (error) {
    console.error(`${collectionName} için aggregation çalıştırılırken hata:`, error);
    throw error;
  }
};

/**
 * Koleksiyon istatistiklerini getirir
 * @param {string} collectionName - Koleksiyon adı
 * @returns {Promise} - Koleksiyon istatistikleri
 */
const getCollectionStats = async (collectionName) => {
  try {
    const response = await api.get(`/db/collections/${collectionName}/stats`);
    return response.data;
  } catch (error) {
    console.error(`${collectionName} istatistikleri alınırken hata:`, error);
    throw error;
  }
};

/**
 * Döküman sayısını getirir
 * @param {string} collectionName - Koleksiyon adı
 * @param {object} filters - Filtreleme parametreleri
 * @returns {Promise} - Döküman sayısı
 */
const countDocuments = async (collectionName, filters = {}) => {
  try {
    const response = await api.get(`/db/collections/${collectionName}/count`, {
      params: {
        filters: JSON.stringify(filters)
      }
    });
    return response.data;
  } catch (error) {
    console.error(`${collectionName} döküman sayısı alınırken hata:`, error);
    throw error;
  }
};

export default {
  getAllCollections,
  getDocuments,
  insertDocument,
  updateDocument,
  deleteDocument,
  getDatabaseStatus,
  runAggregation,
  getCollectionStats,
  countDocuments
}; 