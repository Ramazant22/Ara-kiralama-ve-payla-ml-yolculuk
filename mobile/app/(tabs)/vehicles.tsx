import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../_layout';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Örnek araç verileri
const VEHICLES = [
  { id: '1', brand: 'Toyota', model: 'Corolla', year: 2020, dailyPrice: 250, image: 'https://via.placeholder.com/150', location: 'İstanbul, Beşiktaş', transmission: 'Otomatik', fuelType: 'Benzin' },
  { id: '2', brand: 'Honda', model: 'Civic', year: 2021, dailyPrice: 300, image: 'https://via.placeholder.com/150', location: 'İstanbul, Kadıköy', transmission: 'Otomatik', fuelType: 'Dizel' },
  { id: '3', brand: 'Ford', model: 'Focus', year: 2019, dailyPrice: 200, image: 'https://via.placeholder.com/150', location: 'Ankara, Çankaya', transmission: 'Manuel', fuelType: 'Benzin' },
  { id: '4', brand: 'Volkswagen', model: 'Golf', year: 2022, dailyPrice: 350, image: 'https://via.placeholder.com/150', location: 'İzmir, Karşıyaka', transmission: 'Otomatik', fuelType: 'Hibrit' },
];

// Araç için tip tanımlaması
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number;
  image: string;
  location: string;
  transmission: string;
  fuelType: string;
}

// Araç kartı bileşeni
const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
    >
      <View style={styles.imageContainer}>
        {/* Burada gerçek bir resim kullanabilirsiniz */}
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{vehicle.brand[0]}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.cardSubtitle}>Model Yılı: {vehicle.year}</Text>
        
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <FontAwesome5 name="map-marker-alt" size={12} color={colors.primary} />
            <Text style={styles.featureText}>{vehicle.location}</Text>
          </View>
        </View>
        
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <FontAwesome5 name="cog" size={12} color={colors.primary} />
            <Text style={styles.featureText}>{vehicle.transmission}</Text>
          </View>
          
          <View style={styles.feature}>
            <FontAwesome5 name="gas-pump" size={12} color={colors.primary} />
            <Text style={styles.featureText}>{vehicle.fuelType}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{vehicle.dailyPrice} TL / gün</Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => router.push(`/vehicle/${vehicle.id}`)}
          >
            <Text style={styles.detailsButtonText}>Detaylar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function VehiclesScreen() {
  const [filterVisible, setFilterVisible] = React.useState(false);
  
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
      
      <FlatList
        data={VEHICLES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
        contentContainerStyle={styles.list}
      />
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
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 110,
    height: 150,
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
    color: colors.textDark,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detailsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 