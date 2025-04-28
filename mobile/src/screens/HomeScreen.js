import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { CarPlaceholder, AvatarPlaceholder } from '../components/PlaceholderImages';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import RideSummaryCard from '../components/RideSummaryCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [featuredVehicles, setFeaturedVehicles] = useState([
    {
      id: '1',
      brand: 'BMW',
      model: '3 Serisi',
      year: '2022',
      price: '850',
      location: 'İstanbul, Kadıköy',
      rating: 4.8,
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
      image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    }
  ]);
  
  const [nearbyRides, setNearbyRides] = useState([
    {
      id: '1',
      origin: 'Kadıköy, İstanbul',
      destination: 'Beşiktaş, İstanbul',
      departureTime: '2025-04-24T14:30:00',
      arrivalTime: '2025-04-24T15:15:00',
      price: '60',
      availableSeats: 3,
      driverName: 'Ahmet Y.',
      driverRating: 4.9,
      carModel: 'BMW 3 Serisi'
    },
    {
      id: '2',
      origin: 'Üsküdar, İstanbul',
      destination: 'Taksim, İstanbul',
      departureTime: '2025-04-24T15:45:00',
      arrivalTime: '2025-04-24T16:30:00',
      price: '65',
      availableSeats: 2,
      driverName: 'Meral K.',
      driverRating: 4.7,
      carModel: 'Toyota Corolla'
    },
    {
      id: '3',
      origin: 'Ataşehir, İstanbul',
      destination: 'Levent, İstanbul',
      departureTime: '2025-04-25T16:30:00',
      arrivalTime: '2025-04-25T17:15:00',
      price: '85',
      availableSeats: 4,
      driverName: 'Emre T.',
      driverRating: 4.8,
      carModel: 'Honda Civic'
    }
  ]);

  // Yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    // Burada API istekleri yaparak verileri yenileyebilirsiniz
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      onPress={() => console.log('Araç seçildi:', item.id)}
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
        {/* Üst Bar */}
        <View style={[styles.header, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile')}
          >
            <Avatar 
              uri={user?.profileImage} 
              name={user?.firstName || 'Kullanıcı'} 
              size={48} 
              online={true}
            />
            <View style={styles.userTextContainer}>
              <Text style={[styles.welcomeText, { color: theme?.text?.secondary || '#666666' }]}>Hoş geldiniz,</Text>
              <Text style={[styles.userName, { color: theme?.text?.primary || '#171A1F' }]}>{user?.firstName || 'Kullanıcı'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.notificationButton, { backgroundColor: theme?.states?.hover || '#F0F0F0' }]}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={22} color={theme?.text?.primary || '#171A1F'} />
              <View style={[styles.notificationBadge, { backgroundColor: theme?.danger || '#EF4444' }]}>
                <Text style={styles.notificationCount}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Arama Kutusu */}
        <View style={[styles.searchContainer, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <View style={[styles.searchBar, { backgroundColor: theme?.surface || '#121212' }]}>
            <Ionicons name="search" size={22} color={theme?.text?.primary || '#FFFFFF'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme?.text?.primary || '#FFFFFF' }]}
              placeholder="Nereye gitmek istiyorsunuz?"
              placeholderTextColor={theme?.text?.secondary || '#CCCCCC'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme?.text?.primary || '#FFFFFF'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Ana Hizmetler */}
          <View style={styles.servicesContainer}>
            <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>Hizmetler</Text>
            <View style={styles.services}>
              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => navigation.navigate('Vehicle')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="car" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>Araç Kirala</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => navigation.navigate('Home')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="compass" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>Yolculuk Bul</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => navigation.navigate('CreateTrip')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="add-circle" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>Yolculuk Oluştur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => {
                  if (user) {
                    navigation.navigate('AddVehicle');
                  } else {
                    navigation.navigate('Login');
                  }
                }}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="key" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>Aracını Kiraya Ver</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="person" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>Profilim</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.serviceItem, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                onPress={() => navigation.navigate('Contact')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                  <Ionicons name="mail" size={24} color={theme?.text?.inverse || '#000000'} />
                </View>
                <Text style={[styles.serviceText, { color: theme?.text?.inverse || '#000000' }]}>İletişim</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Öne Çıkan Araçlar */}
          <View style={styles.featuredContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>Öne Çıkan Araçlar</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme?.primary || '#FFFFFF' }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={featuredVehicles}
              renderItem={renderVehicleItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          {/* Yakındaki Yolculuklar */}
          <View style={styles.ridesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>Yakındaki Yolculuklar</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme?.primary || '#FFFFFF' }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            
            {nearbyRides.map((ride) => (
              <RideSummaryCard 
                key={ride.id} 
                ride={ride} 
                onPress={() => console.log('Yolculuk seçildi:', ride.id)} 
              />
            ))}
          </View>
        </ScrollView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: -10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 9,
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
    height: '100%',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  servicesContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  serviceItem: {
    width: (width - 64) / 3,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    margin: 4,
    marginBottom: 12,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  featuredContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredList: {
    paddingRight: 16,
  },
  vehicleCard: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    bottom: 0,
    height: '50%',
    backgroundGradient: {
      colors: ['transparent', 'rgba(0,0,0,0.8)'],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleLocation: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  priceSubtext: {
    color: '#000000',
    fontSize: 10,
    opacity: 0.8,
    marginLeft: 2,
  },
  ridesContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;