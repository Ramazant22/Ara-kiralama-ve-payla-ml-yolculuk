import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../_layout';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';

// API URL
const API_URL = 'http://localhost:3000/api';

// Vehicle type definition
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
}

// Araç kartı bileşeni
const VehicleCard = ({ vehicle, onPress }: { vehicle: Vehicle; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {/* Burada gerçek bir resim kullanabilirsiniz */}
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{vehicle.brand ? vehicle.brand[0] : 'A'}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.cardSubtitle}>Model Yılı: {vehicle.year}</Text>
        
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <FontAwesome5 name="map-marker-alt" size={12} color={colors.textDark} />
            <Text style={styles.featureText}>{vehicle.location || 'Konum bilgisi yok'}</Text>
          </View>
        </View>
        
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <FontAwesome5 name="cog" size={12} color={colors.textDark} />
            <Text style={styles.featureText}>{vehicle.transmission || 'Bilgi yok'}</Text>
          </View>
          
          <View style={styles.feature}>
            <FontAwesome5 name="gas-pump" size={12} color={colors.textDark} />
            <Text style={styles.featureText}>{vehicle.fuelType || 'Bilgi yok'}</Text>
          </View>
        </View>
        
        <Text style={styles.cardPrice}>{vehicle.dailyPrice || vehicle.pricePerDay || vehicle.dailyRate || 0} TL / gün</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function VehiclesScreen() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('Araçlar yükleniyor...');
      
      const response = await axios.get(`${API_URL}/vehicles`);
      console.log('API yanıtı:', response.data);
      
      let vehicleData: Vehicle[] = [];
      
      // API yanıt formatını kontrol et
      if (response.data && response.data.status === 'success' && response.data.data && Array.isArray(response.data.data.vehicles)) {
        // { status: 'success', data: { vehicles: [] } }
        vehicleData = response.data.data.vehicles;
      } else if (response.data && Array.isArray(response.data.vehicles)) {
        // { vehicles: [] }
        vehicleData = response.data.vehicles;
      } else if (response.data && Array.isArray(response.data)) {
        // []
        vehicleData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // { data: [] }
        vehicleData = response.data.data;
      } else {
        console.warn('Bilinmeyen API yanıt formatı:', response.data);
        vehicleData = [];
      }
      
      setVehicles(vehicleData);
      setError(null);
    } catch (err) {
      console.error('Araçları getirirken hata oluştu:', err);
      setError('Araçlar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    router.push({
      pathname: '/vehicle/[id]',
      params: { id: vehicle.id || vehicle._id }
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Kiralanabilir Araçlar</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(!filterVisible)}
        >
          <FontAwesome5 name="filter" size={16} color={colors.text} />
          <Text style={styles.filterButtonText}>Filtrele</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Araçlar yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVehicles}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="car" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Araç bulunamadı</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => (item.id || item._id || Math.random().toString()) as string}
          renderItem={({ item }) => <VehicleCard vehicle={item} onPress={() => handleVehiclePress(item)} />}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchVehicles}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 100,
    height: 140,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#757575',
  },
  cardContent: {
    padding: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.textDark,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textDark,
    marginTop: 10,
  },
}); 