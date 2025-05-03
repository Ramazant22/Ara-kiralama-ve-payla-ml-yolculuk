import API from './api';

// Yolculuk için tür tanımı
export interface Ride {
  id: string;
  driver: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  passengers: string[];
  createdAt: string;
}

// Yolculuk oluşturma isteği için tür tanımı
export interface CreateRideRequest {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description: string;
}

// Yolculuğa katılma isteği için tür tanımı
export interface JoinRideRequest {
  rideId: string;
  seats: number;
}

// Yolculuk servisi
class RideService {
  // Tüm yolculukları getirme
  getAllRides = async () => {
    const response = await API.get('/rides');
    return response.data;
  };

  // Yolculuk detaylarını getirme
  getRideById = async (id: string) => {
    const response = await API.get(`/rides/${id}`);
    return response.data;
  };

  // Yolculuk oluşturma
  createRide = async (rideData: CreateRideRequest) => {
    const response = await API.post('/rides', rideData);
    return response.data;
  };

  // Yolculuğa katılma
  joinRide = async (joinData: JoinRideRequest) => {
    const response = await API.post(`/rides/${joinData.rideId}/join`, { seats: joinData.seats });
    return response.data;
  };

  // Kullanıcının yolculuklarını getirme
  getUserRides = async () => {
    const response = await API.get('/rides/user');
    return response.data;
  };

  // Kullanıcının katıldığı yolculukları getirme
  getUserJoinedRides = async () => {
    const response = await API.get('/rides/user/joined');
    return response.data;
  };

  // Yolculuk arama
  searchRides = async (params: any) => {
    const response = await API.get('/rides/search', { params });
    return response.data;
  };
}

export default new RideService(); 