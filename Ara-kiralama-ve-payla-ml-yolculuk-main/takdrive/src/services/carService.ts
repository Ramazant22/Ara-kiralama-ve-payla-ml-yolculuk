import API from './api';

// Araç için tür tanımı
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  pricePerDay: number;
  transmission: string;
  fuelType: string;
  seats: number;
  location: string;
  available: boolean;
  imageUrl: string;
  features: string[];
  owner: string;
  createdAt: string;
}

// Kiralama isteği için tür tanımı
export interface RentalRequest {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
}

// Araç servisi
class CarService {
  // Tüm araçları getirme
  getAllCars = async () => {
    const response = await API.get('/cars');
    return response.data;
  };

  // Araç detaylarını getirme
  getCarById = async (id: string) => {
    const response = await API.get(`/cars/${id}`);
    return response.data;
  };

  // Araç kiralama
  rentCar = async (rentalData: RentalRequest) => {
    const response = await API.post('/rentals', rentalData);
    return response.data;
  };

  // Kullanıcının kiraladığı araçları getirme
  getUserRentals = async () => {
    const response = await API.get('/rentals/user');
    return response.data;
  };

  // Araç arama
  searchCars = async (params: any) => {
    const response = await API.get('/cars/search', { params });
    return response.data;
  };
}

export default new CarService(); 