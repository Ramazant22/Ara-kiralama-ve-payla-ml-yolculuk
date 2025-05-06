import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Önbellek anahtarlarını prefixle ayarlamak için
const CACHE_PREFIX = 'takdrive_cache_';
// Önbellek yaşam süresi (ms) - varsayılan: 1 saat
const DEFAULT_CACHE_TTL = 60 * 60 * 1000;

/**
 * Veriyi önbelleğe kaydet
 * @param {string} key - Önbellek anahtarı
 * @param {any} data - Kaydedilecek veri
 * @param {number} ttl - Yaşam süresi (milisaniye olarak)
 * @returns {Promise<void>}
 */
const setCache = async (key, data, ttl = DEFAULT_CACHE_TTL) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Önbellek kaydetme hatası:', error);
  }
};

/**
 * Önbellekten veri getir
 * @param {string} key - Önbellek anahtarı
 * @returns {Promise<any>} Önbellekteki veri veya null
 */
const getCache = async (key) => {
  try {
    const cachedData = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedData) return null;
    
    const parsedData = JSON.parse(cachedData);
    
    // Verinin geçerlilik süresini kontrol et
    if (parsedData.expiry < Date.now()) {
      // Süre dolduysa önbelleği temizle
      await removeCache(key);
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Önbellek okuma hatası:', error);
    return null;
  }
};

/**
 * Belirli bir önbelleği temizle
 * @param {string} key - Önbellek anahtarı
 * @returns {Promise<void>}
 */
const removeCache = async (key) => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error('Önbellek silme hatası:', error);
  }
};

/**
 * Tüm önbellekleri temizle
 * @returns {Promise<void>}
 */
const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Tüm önbellekleri temizleme hatası:', error);
  }
};

/**
 * Mevcut ağ durumunu kontrol et
 * @returns {Promise<boolean>} Bağlantı durumu
 */
const isConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Bağlantı durumu kontrol hatası:', error);
    return false;
  }
};

/**
 * İnternete bağlı olunduğunda callback fonksiyon çalıştır
 * @param {Function} callback - İnternet bağlantısı olduğunda çalışacak fonksiyon
 * @returns {Function} Aboneliği sonlandırmak için kullanılacak fonksiyon
 */
const onConnectivityChange = (callback) => {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      callback();
    }
  });
};

/**
 * API isteklerini önbellekle yöneten fonksiyon
 * @param {string} cacheKey - Önbellek anahtarı
 * @param {Function} apiCall - API isteğini yapan fonksiyon
 * @param {number} ttl - Yaşam süresi (milisaniye)
 * @param {boolean} forceRefresh - Önbelleği zorla yenile
 * @returns {Promise<any>} API yanıtı veya önbellekten veri
 */
const withCache = async (cacheKey, apiCall, ttl = DEFAULT_CACHE_TTL, forceRefresh = false) => {
  try {
    // İnternet bağlantısını kontrol et
    const connected = await isConnected();
    
    // Önbelleği kullanma koşulları:
    // 1. İnternet bağlantısı yok, veya
    // 2. forceRefresh false ve veri önbellekte var
    if (!forceRefresh && (!connected || (await getCache(cacheKey)))) {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // İnternet bağlantısı varsa API'den veri çek
    if (connected) {
      const freshData = await apiCall();
      
      // Veriyi önbelleğe kaydet
      await setCache(cacheKey, freshData, ttl);
      
      return freshData;
    }
    
    // İnternet bağlantısı yoksa ve önbellekte de veri yoksa
    throw new Error('İnternet bağlantısı yok ve önbellekte veri bulunamadı');
  } catch (error) {
    // Hata durumunda yine önbellekten okuma dene
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      // Veriyi önbellekten döndür, ancak hata olduğunu belirt
      return {
        ...cachedData,
        _isFromCache: true,
        _cacheDate: new Date()
      };
    }
    
    throw error;
  }
};

/**
 * Çevrimdışı durumda bekleyen istekleri işler
 * @param {string} storageKey - Depolama anahtarı
 * @param {Function} apiCall - API isteğini yapan fonksiyon
 * @returns {Promise<void>}
 */
const processPendingRequests = async (storageKey, apiCall) => {
  try {
    const data = await AsyncStorage.getItem(storageKey);
    if (!data) return;

    const pendingRequests = JSON.parse(data);
    if (!pendingRequests.length) return;

    // İnternet bağlantısını kontrol et
    const connected = await isConnected();
    if (!connected) return;

    // Tüm bekleyen istekleri işle
    const results = await Promise.allSettled(pendingRequests.map(req => apiCall(req)));
    
    // Başarılı istekleri filtrele
    const remainingRequests = pendingRequests.filter((_, index) => {
      return results[index].status === 'rejected';
    });

    // Kalan istekleri kaydet veya tamamlandıysa sil
    if (remainingRequests.length) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(remainingRequests));
    } else {
      await AsyncStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error('Bekleyen istekleri işleme hatası:', error);
  }
};

/**
 * Bekleyen bir istek ekle
 * @param {string} storageKey - Depolama anahtarı
 * @param {any} requestData - İstek verisi
 * @returns {Promise<void>}
 */
const addPendingRequest = async (storageKey, requestData) => {
  try {
    const existingData = await AsyncStorage.getItem(storageKey);
    let pendingRequests = [];
    
    if (existingData) {
      pendingRequests = JSON.parse(existingData);
    }
    
    pendingRequests.push(requestData);
    await AsyncStorage.setItem(storageKey, JSON.stringify(pendingRequests));
  } catch (error) {
    console.error('Bekleyen istek ekleme hatası:', error);
  }
};

export default {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  isConnected,
  onConnectivityChange,
  withCache,
  processPendingRequests,
  addPendingRequest
}; 