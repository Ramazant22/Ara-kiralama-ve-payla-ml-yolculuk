import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../_layout';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:3000/api';
const { width } = Dimensions.get('window');

interface Vehicle {
  id?: string;
  _id?: string;
  brand?: string;
  model?: string;
  year?: number;
  dailyPrice?: number;
  pricePerDay?: number;
  dailyRate?: number;
  location?: string;
  transmission?: string;
  fuelType?: string;
  description?: string;
  owner?: {
    id?: string;
    name?: string;
    avatar?: string;
    rating?: number;
  };
  images?: string[];
  rating?: number;
  reviewCount?: number;
  plateNumber?: string;
  features?: string[];
}

const VehicleDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      console.log(`Araç detayları yükleniyor... ID: ${id}`);
      
      const response = await axios.get(`${API_URL}/vehicles/${id}`);
      console.log('API yanıtı:', response.data);
      
      let vehicleData: Vehicle | null = null;
      
      // API yanıt formatını kontrol et
      if (response.data && response.data.status === 'success' && response.data.data && response.data.data.vehicle) {
        // { status: 'success', data: { vehicle: {} } }
        vehicleData = response.data.data.vehicle;
      } else if (response.data && response.data.vehicle) {
        // { vehicle: {} }
        vehicleData = response.data.vehicle;
      } else if (response.data && !response.data.status) {
        // Doğrudan obje: {}
        vehicleData = response.data;
      } else {
        console.warn('Bilinmeyen API yanıt formatı:', response.data);
        vehicleData = null;
      }
      
      // Varsayılan özellikler ekle
      if (vehicleData) {
        if (!vehicleData.features) {
          vehicleData.features = [
            vehicleData.transmission || 'Vites tipi belirtilmemiş',
            vehicleData.fuelType || 'Yakıt tipi belirtilmemiş',
            `Yıl: ${vehicleData.year || 'Belirtilmemiş'}`,
          ];
        }
        
        if (!vehicleData.owner) {
          vehicleData.owner = {
            name: 'Araç Sahibi',
            rating: 4.5
          };
        }
        
        if (!vehicleData.rating) {
          vehicleData.rating = 4.2;
        }
        
        if (!vehicleData.reviewCount) {
          vehicleData.reviewCount = 0;
        }
      }
      
      setVehicle(vehicleData);
      setError(null);
    } catch (err) {
      console.error('Araç detaylarını getirirken hata oluştu:', err);
      setError('Araç detayları yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    setStartDate(date);
    hideDatePicker();
    updateTotalDays(date, endDate);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
    hideEndDatePicker();
    updateTotalDays(startDate, date);
  };

  const updateTotalDays = (start: Date | null, end: Date | null) => {
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalDays(diffDays);
    }
  };

  const handleBookNow = () => {
    if (!startDate || !endDate) {
      Alert.alert("Hata", "Lütfen başlangıç ve bitiş tarihlerini seçin.");
      return;
    }
    
    const price = vehicle?.dailyPrice || vehicle?.pricePerDay || vehicle?.dailyRate || 0;
    
    Alert.alert(
      "Rezervasyon Onayı",
      `${vehicle?.brand} ${vehicle?.model} aracını ${totalDays} gün için kiralamak istiyor musunuz? Toplam ücret: ₺${price * totalDays}`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Onayla", 
          onPress: () => {
            router.push({
              pathname: '/ride/create',
              params: { 
                vehicleId: vehicle?.id || vehicle?._id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                totalDays: totalDays.toString(),
                totalPrice: (price * totalDays).toString()
              }
            } as any);
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    if (!date) return "Seçiniz";
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('otomatik') || feature.toLowerCase().includes('vites')) return 'cog';
    if (feature.toLowerCase().includes('benzin') || feature.toLowerCase().includes('dizel') || feature.toLowerCase().includes('yakıt')) return 'gas-pump';
    if (feature.toLowerCase().includes('koltuk') || feature.toLowerCase().includes('yolcu')) return 'chair';
    if (feature.toLowerCase().includes('klima')) return 'snowflake';
    if (feature.toLowerCase().includes('bluetooth')) return 'bluetooth-b';
    if (feature.toLowerCase().includes('usb')) return 'usb';
    if (feature.toLowerCase().includes('gps') || feature.toLowerCase().includes('navigasyon')) return 'map-marker-alt';
    if (feature.toLowerCase().includes('yıl')) return 'calendar-alt';
    return 'check-circle';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Araç Detayı',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4500" />
          <Text style={styles.loadingText}>Araç detayları yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVehicleDetails}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : vehicle ? (
        <ScrollView style={styles.container}>
          <View style={styles.imageContainer}>
            {/* Varsayılan placeholder görseli */}
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{vehicle.brand ? vehicle.brand[0] : 'A'}</Text>
            </View>
            
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome5 name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>₺{vehicle.dailyPrice || vehicle.pricePerDay || vehicle.dailyRate || 0}</Text>
              <Text style={styles.priceUnit}>/gün</Text>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <View>
                <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
                <Text style={styles.vehicleModel}>Yıl: {vehicle.year}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" solid size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{vehicle.rating?.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>
                  ({vehicle.reviewCount} değerlendirme)
                </Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#FF5A5F" />
              <Text style={styles.locationText}>
                {vehicle.location || 'Konum belirtilmemiş'}
              </Text>
            </View>

            {vehicle.plateNumber && (
              <View style={styles.plateContainer}>
                <FontAwesome5 name="car" size={16} color="#4A90E2" />
                <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Araç Özellikleri</Text>
            <View style={styles.featuresContainer}>
              {vehicle.features?.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <FontAwesome5 name={getFeatureIcon(feature)} size={16} color="#4A90E2" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {vehicle.description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Açıklama</Text>
                <Text style={styles.descriptionText}>
                  {vehicle.description}
                </Text>
              </>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Tarih Seçin</Text>
            <View style={styles.datePickerContainer}>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={showDatePicker}
              >
                <FontAwesome5 name="calendar-alt" size={18} color="#4A90E2" />
                <Text style={styles.datePickerText}>
                  {startDate ? formatDate(startDate) : "Başlangıç Tarihi"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={showEndDatePicker}
              >
                <FontAwesome5 name="calendar-alt" size={18} color="#4A90E2" />
                <Text style={styles.datePickerText}>
                  {endDate ? formatDate(endDate) : "Bitiş Tarihi"}
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              minimumDate={new Date()}
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
            />

            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="date"
              minimumDate={startDate || new Date()}
              onConfirm={handleEndDateConfirm}
              onCancel={hideEndDatePicker}
            />

            {totalDays > 0 && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    Günlük ücret
                  </Text>
                  <Text style={styles.summaryValue}>
                    ₺{vehicle.dailyPrice || vehicle.pricePerDay || vehicle.dailyRate || 0}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    Toplam gün
                  </Text>
                  <Text style={styles.summaryValue}>
                    {totalDays} gün
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalText}>
                    Toplam
                  </Text>
                  <Text style={styles.totalValue}>
                    ₺{(vehicle.dailyPrice || vehicle.pricePerDay || vehicle.dailyRate || 0) * totalDays}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBookNow}
              disabled={!startDate || !endDate}
            >
              <Text style={styles.bookButtonText}>Hemen Kirala</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="car" size={50} color="#ccc" />
          <Text style={styles.errorText}>Araç bulunamadı</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#757575',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff4500',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleModel: {
    fontSize: 16,
    color: '#666',
    marginTop: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  plateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  datePickerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 5,
    marginBottom: 0,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4500',
  },
  bookButton: {
    backgroundColor: '#ff4500',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VehicleDetailScreen; 