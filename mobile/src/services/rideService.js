import api from './api';

export const rideService = {
  // Tüm aktif yolculukları getir
  getRides: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/rides?${params}`);
      return response.data;
    } catch (error) {
      console.error('getRides error:', error);
      throw error;
    }
  },

  // Kullanıcının yolculuklarını getir
  getMyRides: async () => {
    try {
      const response = await api.get('/rides/user/my-rides');
      return response.data;
    } catch (error) {
      console.error('getMyRides error:', error);
      throw error;
    }
  },

  // Tek yolculuk detayını getir
  getRide: async (rideId) => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      console.error('getRide error:', error);
      throw error;
    }
  },

  // Yeni yolculuk oluştur
  createRide: async (rideData) => {
    try {
      const response = await api.post('/rides', rideData);
      return response.data;
    } catch (error) {
      console.error('createRide error:', error);
      throw error;
    }
  },

  // Yolculuk güncelle
  updateRide: async (rideId, rideData) => {
    try {
      const response = await api.put(`/rides/${rideId}`, rideData);
      return response.data;
    } catch (error) {
      console.error('updateRide error:', error);
      throw error;
    }
  },

  // Yolculuk sil/iptal et
  deleteRide: async (rideId) => {
    try {
      const response = await api.delete(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      console.error('deleteRide error:', error);
      throw error;
    }
  },

  // Yolculuğa katılma talebi gönder
  joinRide: async (rideId, bookingData) => {
    try {
      const response = await api.post('/ride-bookings', {
        rideId,
        ...bookingData
      });
      return response.data;
    } catch (error) {
      console.error('joinRide error:', error);
      throw error;
    }
  },

  // Kullanıcının yolculuk rezervasyonlarını getir
  getMyRideBookings: async (type = 'all') => {
    try {
      const response = await api.get(`/ride-bookings/my?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('getMyRideBookings error:', error);
      throw error;
    }
  },

  // Yolculuk talebini onayla/reddet
  respondToBooking: async (bookingId, action, responseData = {}) => {
    try {
      const response = await api.patch(`/ride-bookings/${bookingId}/${action}`, responseData);
      return response.data;
    } catch (error) {
      console.error('respondToBooking error:', error);
      throw error;
    }
  },

  // Ödeme simülasyonu
  simulatePayment: async (bookingId, paymentData) => {
    try {
      const response = await api.post(`/ride-bookings/${bookingId}/pay`, paymentData);
      return response.data;
    } catch (error) {
      console.error('simulatePayment error:', error);
      throw error;
    }
  },

  // Yolculuğu tamamla
  completeRide: async (rideId) => {
    try {
      const response = await api.patch(`/rides/${rideId}/complete`);
      return response.data;
    } catch (error) {
      console.error('completeRide error:', error);
      throw error;
    }
  }
}; 