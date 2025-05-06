import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import vehicleService from '../api/services/vehicleService';
import { useConnectivityContext } from '../context/ConnectivityContext';
import VehicleCard from '../components/VehicleCard';

// Mock data - gerçek uygulamada API'den gelecek
const VEHICLES = [
  {
    id: '1',
    brand: 'Mercedes',
    model: 'E200',
    year: 2020,
    price: 850,
    rating: 4.8,
    location: 'İstanbul, Beşiktaş',
    image: require('../../assets/images/car1.jpg'),
    description: 'Lüks sınıf araç, yeni kasa, temiz ve bakımlı.'
  },
  {
    id: '2',
    brand: 'BMW',
    model: '320i',
    year: 2019,
    price: 750,
    rating: 4.6,
    location: 'İstanbul, Kadıköy',
    image: require('../../assets/images/car2.jpg'),
    description: 'Sport paket, otomatik vites, benzinli.'
  },
  {
    id: '3',
    brand: 'Volkswagen',
    model: 'Passat',
    year: 2021,
    price: 650,
    rating: 4.5,
    location: 'İstanbul, Bahçelievler',
    image: require('../../assets/images/car3.jpg'),
    description: 'Dizel, otomatik, multimedya ekranlı.'
  },
  {
    id: '4',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    price: 550,
    rating: 4.7,
    location: 'İstanbul, Maltepe',
    image: require('../../assets/images/car4.jpg'),
    description: 'Hybrid motor, düşük yakıt tüketimi.'
  },
  {
    id: '5',
    brand: 'Audi',
    model: 'A4',
    year: 2020,
    price: 780,
    rating: 4.9,
    location: 'İstanbul, Şişli',
    image: require('../../assets/images/car5.jpg'),
    description: 'Quattro, deri koltuklar, sunroof.'
  },
];

// Filtre seçenekleri
const FILTERS = [
  'Tümü',
  'En Uygun',
  'En Yüksek Puan',
  'Yeni Model',
  'Lüks',
];

const VehicleListScreen = () => {
  const navigation = useNavigation();
  const { isOnline, wasOffline } = useConnectivityContext();
  
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState(null);

  // Araçları yükle
  const loadVehicles = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      if (!isRefreshing) setIsLoading(true);
      
      const response = await vehicleService.getAllVehicles({}, forceRefresh);
      
      // Önbellekten gelip gelmediğini kontrol et
      if (response._isFromCache) {
        setIsFromCache(true);
      } else {
        setIsFromCache(false);
      }
      
      setVehicles(response.vehicles || []);
      setFilteredVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
      setError('Araçlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Sayfa her açıldığında verileri yenile
  useFocusEffect(
    useCallback(() => {
      // Sayfa odaklandığında verileri yükle (bağlantı durumu değiştiyse zorla yenile)
      loadVehicles(wasOffline);
      
      return () => {
        // Temizleme işlemleri
      };
    }, [loadVehicles, wasOffline])
  );

  // Kullanıcı yenileme yaptığında
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVehicles(true); // true: forceRefresh
  };

  // Filtreleme
  const filterVehicles = (filterType) => {
    setActiveFilter(filterType);
    
    if (filterType === 'all') {
      setFilteredVehicles(vehicles);
    } else if (filterType === 'available') {
      setFilteredVehicles(vehicles.filter(vehicle => vehicle.isAvailable));
    } else if (filterType === 'nearby') {
      // Burada konum bazlı filtreleme yapılabilir
      // Şimdilik tüm araçları göster
      setFilteredVehicles(vehicles);
    }
  };

  // Sıralama butonları
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
        onPress={() => filterVehicles('all')}
      >
        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
          Tümü
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'available' && styles.activeFilterButton]}
        onPress={() => filterVehicles('available')}
      >
        <Text style={[styles.filterText, activeFilter === 'available' && styles.activeFilterText]}>
          Müsait
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'nearby' && styles.activeFilterButton]}
        onPress={() => filterVehicles('nearby')}
      >
        <Text style={[styles.filterText, activeFilter === 'nearby' && styles.activeFilterText]}>
          Yakınımda
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Yükleme ekranı
  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Araçlar yükleniyor...</Text>
      </View>
    );
  }

  // Hata ekranı
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadVehicles(true)}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araçlar</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#2196F3" />
        </TouchableOpacity>
      </View>
      
      {isFromCache && (
        <View style={styles.cacheNotice}>
          <Ionicons name="information-circle" size={16} color="#757575" />
          <Text style={styles.cacheText}>Çevrimdışı veriler gösteriliyor</Text>
        </View>
      )}
      
      {renderFilterButtons()}
      
      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredVehicles.length} araç bulundu
        </Text>
      </View>
      
      {/* Vehicle List */}
      {filteredVehicles.length > 0 ? (
        <FlatList
          data={filteredVehicles}
          renderItem={({ item }) => (
            <VehicleCard 
              vehicle={item} 
              onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item._id })} 
            />
          )}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.vehicleList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="car" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>Henüz araç bulunmamaktadır</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  vehicleList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cacheNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDE7',
    paddingVertical: 6,
  },
  cacheText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#757575',
  },
});

export default VehicleListScreen; 