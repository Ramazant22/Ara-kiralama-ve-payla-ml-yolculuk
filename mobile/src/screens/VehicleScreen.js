import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const VehicleScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  // Örnek araç verileri
  const [vehicles] = useState([
    {
      id: '1',
      brand: 'BMW',
      model: '3 Serisi',
      year: '2022',
      price: '850',
      location: 'İstanbul, Kadıköy',
      rating: 4.8,
      features: ['Otomatik', 'Dizel', '5 Koltuk'],
      image: 'https://images.unsplash.com/photo-1555652736-e92021d28a39?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '2',
      brand: 'Mercedes',
      model: 'C Serisi',
      year: '2021',
      price: '950',
      location: 'İstanbul, Beşiktaş',
      rating: 4.6,
      features: ['Otomatik', 'Benzin', '5 Koltuk'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '3',
      brand: 'Audi',
      model: 'A4',
      year: '2022',
      price: '900',
      location: 'İstanbul, Şişli',
      rating: 4.7,
      features: ['Otomatik', 'Benzin', '5 Koltuk'],
      image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    }
  ]);

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.vehicleImage}
        resizeMode="cover"
      />
      <View style={styles.vehicleOverlay} />
      <View style={styles.vehicleInfo}>
        <View>
          <Text style={styles.vehicleBrand}>{item.brand} {item.model}</Text>
          <Text style={styles.vehicleLocation}>{item.location}</Text>
          <View style={styles.featuresContainer}>
            {item.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <View style={[styles.priceTag, { backgroundColor: theme?.primary || '#FFFFFF' }]}>
        <Text style={[styles.priceText, { color: theme?.text?.inverse || '#000000' }]}>{item.price}₺</Text>
        <Text style={[styles.priceSubtext, { color: theme?.text?.inverse || '#000000' }]}>/gün</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: theme?.background || '#000000' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme?.text?.primary || '#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
            Araç Kirala
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color={theme?.text?.primary || '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* Arama Kutusu */}
        <View style={[styles.searchContainer, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <View style={[styles.searchBar, { backgroundColor: theme?.surface || '#121212' }]}>
            <Ionicons name="search" size={22} color={theme?.text?.primary || '#FFFFFF'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme?.text?.primary || '#FFFFFF' }]}
              placeholder="Marka, model veya konum ara..."
              placeholderTextColor={theme?.text?.secondary || '#666666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={22} color={theme?.text?.primary || '#FFFFFF'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Araç Listesi */}
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    padding: 16,
  },
  vehicleCard: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    bottom: 0,
  },
  vehicleInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  vehicleBrand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleLocation: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceSubtext: {
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 2,
  },
});

export default VehicleScreen; 