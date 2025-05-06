import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Verileri AsyncStorage'e kaydet
 * @param {string} key - Anahtar
 * @param {any} value - Değer (otomatik olarak JSON'a dönüştürülür)
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Veri kaydedilirken hata (${key}):`, error);
    throw error;
  }
};

/**
 * AsyncStorage'dan veri getir
 * @param {string} key - Anahtar
 * @returns {Promise<any>} - JSON olarak parse edilmiş veri
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Veri alınırken hata (${key}):`, error);
    throw error;
  }
};

/**
 * AsyncStorage'dan veri sil
 * @param {string} key - Anahtar
 * @returns {Promise<void>}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Veri silinirken hata (${key}):`, error);
    throw error;
  }
};

/**
 * Tüm depolama anahtarlarını getir
 * @returns {Promise<string[]>} - Anahtar listesi
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Tüm anahtarlar alınırken hata:', error);
    throw error;
  }
};

/**
 * Tüm depolama verilerini temizle
 * @returns {Promise<void>}
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Tüm veri silinirken hata:', error);
    throw error;
  }
};

/**
 * Birden fazla anahtar için veri getir
 * @param {string[]} keys - Anahtar listesi
 * @returns {Promise<{[key: string]: any}>} - Anahtar-değer çiftlerinden oluşan nesne
 */
export const getMultiple = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.reduce((result, [key, value]) => {
      result[key] = value !== null ? JSON.parse(value) : null;
      return result;
    }, {});
  } catch (error) {
    console.error('Çoklu veri alınırken hata:', error);
    throw error;
  }
};

/**
 * Birden fazla veriyi kaydet
 * @param {Array<[string, any]>} pairs - [anahtar, değer] çiftleri dizisi
 * @returns {Promise<void>}
 */
export const storeMultiple = async (pairs) => {
  try {
    const jsonPairs = pairs.map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(jsonPairs);
  } catch (error) {
    console.error('Çoklu veri kaydedilirken hata:', error);
    throw error;
  }
}; 