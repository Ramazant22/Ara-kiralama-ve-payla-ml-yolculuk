import api from './api';

export const vehicleService = {
  // Tüm kiralık araçları getir (mobile için)
  getUserVehicles: async () => {
    try {
      const response = await api.get('/vehicles');
      return response.data.vehicles || [];
    } catch (error) {
      console.error('getUserVehicles error:', error);
      throw error;
    }
  },

  // Kullanıcının sahip olduğu araçları getir
  getMyVehicles: async () => {
    try {
      const response = await api.get('/vehicles/user/my-vehicles');
      return response.data;
    } catch (error) {
      console.error('Kullanıcının araçları getirilemedi:', error);
      throw error;
    }
  },

  // Tüm araçları getir (filtrelerle)
  getVehicles: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/vehicles?${params}`);
    return response.data;
  },

  // Belirli bir aracı getir
  getVehicle: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  // Yeni araç ekle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('createVehicle error:', error);
      throw error;
    }
  },

  // Araç güncelle
  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  // Araç sil
  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  },

  // Araç durumunu güncelle
  updateVehicleStatus: async (vehicleId, status) => {
    const response = await api.patch(`/vehicles/${vehicleId}/status`, { status });
    return response.data;
  },

  // Popüler araç markaları
  getVehicleBrands: async () => {
    const response = await api.get('/vehicles/brands');
    return response.data;
  },

  // Markaya göre modelleri getir
  getVehicleModels: async (brand) => {
    const response = await api.get(`/vehicles/brands/${brand}/models`);
    return response.data;
  },

  // Şehir listesi
  getCities: async () => {
    const response = await api.get('/vehicles/cities');
    return response.data;
  },

  // Şehre göre ilçeler
  getDistricts: async (city) => {
    const response = await api.get(`/vehicles/cities/${city}/districts`);
    return response.data;
  },
}; 