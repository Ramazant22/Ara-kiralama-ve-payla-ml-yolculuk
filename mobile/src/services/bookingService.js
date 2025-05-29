import api from './api';

export const bookingService = {
  // Kullanıcının rezervasyonlarını getir (kiralayan/araç sahibi)
  getMyBookings: async (type = 'renter') => {
    try {
      const response = await api.get(`/bookings/my?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Rezervasyonlar getirilemedi:', error);
      throw error;
    }
  },

  // Yolculuk rezervasyonlarını getir
  getMyRideBookings: async (type = 'passenger') => {
    try {
      const response = await api.get(`/ride-bookings/my?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Yolculuk rezervasyonları getirilemedi:', error);
      throw error;
    }
  },

  // Yeni rezervasyon oluştur
  createBooking: async (vehicleId, bookingData) => {
    try {
      const response = await api.post('/bookings', {
        vehicleId,
        ...bookingData
      });
      return response.data;
    } catch (error) {
      console.error('Rezervasyon oluşturulamadı:', error);
      throw error;
    }
  },

  // Rezervasyonu onayla (araç sahibi)
  approveBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/approve`, {});
      return response.data;
    } catch (error) {
      console.error('Rezervasyon onaylanamadı:', error);
      throw error;
    }
  },

  // Rezervasyonu reddet (araç sahibi)
  rejectBooking: async (bookingId, reason) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
      throw error;
    }
  },

  // Ödeme yap (simülasyon)
  makePayment: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/payment`, {
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardNumber: '****-****-****-1234',
          cardHolder: 'Test User'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ödeme yapılamadı:', error);
      throw error;
    }
  },

  // Aracı teslim al (kiralayan)
  confirmPickup: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/confirm-pickup`, {});
      return response.data;
    } catch (error) {
      console.error('Teslim alma onaylanamadı:', error);
      throw error;
    }
  },

  // Kiralama bitir (kiralayan)
  completeBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/complete`, {});
      return response.data;
    } catch (error) {
      console.error('Kiralama tamamlanamadı:', error);
      throw error;
    }
  },

  // Rezervasyonu iptal et
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Rezervasyon iptal edilemedi:', error);
      throw error;
    }
  },

  // RIDE BOOKING METHODS
  // Yolculuk rezervasyonunu onayla (sürücü)
  approveRideBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/ride-bookings/${bookingId}/approve`, {});
      return response.data;
    } catch (error) {
      console.error('Yolculuk rezervasyonu onaylanamadı:', error);
      throw error;
    }
  },

  // Yolculuk rezervasyonunu reddet (sürücü)
  rejectRideBooking: async (bookingId, reason) => {
    try {
      const response = await api.patch(`/ride-bookings/${bookingId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Yolculuk rezervasyonu reddedilemedi:', error);
      throw error;
    }
  },

  // Yolculuk ödemesi yap
  makeRidePayment: async (bookingId) => {
    try {
      const response = await api.post(`/ride-bookings/${bookingId}/payment`, {});
      return response.data;
    } catch (error) {
      console.error('Yolculuk ödemesi yapılamadı:', error);
      throw error;
    }
  }
}; 