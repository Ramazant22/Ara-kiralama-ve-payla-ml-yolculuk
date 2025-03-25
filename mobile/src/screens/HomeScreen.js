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
  SafeAreaView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import { CarPlaceholder, AvatarPlaceholder } from '../components/PlaceholderImages';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredVehicles, setFeaturedVehicles] = useState([
    {
      id: '1',
      brand: 'BMW',
      model: '3 Serisi',
      year: '2022',
      price: '850',
      location: 'İstanbul, Kadıköy',
      rating: 4.8
    },
    {
      id: '2',
      brand: 'Mercedes',
      model: 'C Serisi',
      year: '2021',
      price: '950',
      location: 'İstanbul, Beşiktaş',
      rating: 4.6
    },
    {
      id: '3',
      brand: 'Audi',
      model: 'A4',
      year: '2022',
      price: '900',
      location: 'İstanbul, Şişli',
      rating: 4.7
    }
  ]);
  
  const [nearbyRides, setNearbyRides] = useState([
    {
      id: '1',
      from: 'Kadıköy',
      to: 'Beşiktaş',
      time: '14:30',
      date: 'Bugün',
      price: '60',
      seats: 3,
      driver: {
        name: 'Ahmet Y.',
        rating: 4.9
      }
    },
    {
      id: '2',
      from: 'Üsküdar',
      to: 'Taksim',
      time: '15:45',
      date: 'Bugün',
      price: '65',
      seats: 2,
      driver: {
        name: 'Meral K.',
        rating: 4.7
      }
    },
    {
      id: '3',
      from: 'Ataşehir',
      to: 'Levent',
      time: '16:30',
      date: 'Yarın',
      price: '85',
      seats: 4,
      driver: {
        name: 'Emre T.',
        rating: 4.8
      }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Üst Bar */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <AvatarPlaceholder size={40} name={user?.firstName || 'Kullanıcı'} />
            <View>
              <Text style={styles.welcomeText}>Hoş geldiniz,</Text>
              <Text style={styles.userName}>{user?.firstName || 'Kullanıcı'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Icon name="notifications" size={24} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>2</Text>
            </View>
          </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>Hizmetler</Text>
            <View style={styles.services}>
              <TouchableOpacity style={styles.serviceItem}>
                <View style={[styles.serviceIcon, { backgroundColor: '#E8F0FF' }]}>
                  <Icon name="directions-car" size={24} color="#4982F3" />
                </View>
                <Text style={styles.serviceText}>Araba Kirala</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.serviceItem}>
                <View style={[styles.serviceIcon, { backgroundColor: '#FFECE8' }]}>
                  <Icon name="emoji-people" size={24} color="#FF5733" />
                </View>
                <Text style={styles.serviceText}>Yolculuk Bul</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.serviceItem}>
                <View style={[styles.serviceIcon, { backgroundColor: '#E8FFF0' }]}>
                  <Icon name="add-circle" size={24} color="#28C76F" />
                </View>
                <Text style={styles.serviceText}>Yolculuk Oluştur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.serviceItem}>
                <View style={[styles.serviceIcon, { backgroundColor: '#F0E8FF' }]}>
                  <Icon name="settings" size={24} color="#7367F0" />
                </View>
                <Text style={styles.serviceText}>Ayarlar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Öne Çıkan Araçlar */}
          <View style={styles.featuredContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Öne Çıkan Araçlar</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={featuredVehicles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.featuredList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.carCard}>
                  <CarPlaceholder width={240} height={120} />
                  <View style={styles.carInfo}>
                    <Text style={styles.carTitle}>{item.brand} {item.model}</Text>
                    <Text style={styles.carYear}>{item.year} Model</Text>
                    <View style={styles.carLocation}>
                      <Icon name="location-on" size={14} color="#888" />
                      <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.carPrice}>{item.price} ₺/gün</Text>
                      <View style={styles.ratingContainer}>
                        <Icon name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Yakındaki Yolculuklar */}
          <View style={styles.nearbyContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yakındaki Yolculuklar</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            
            {nearbyRides.map((ride) => (
              <TouchableOpacity key={ride.id} style={styles.rideCard}>
                <View style={styles.rideInfo}>
                  <View style={styles.routeContainer}>
                    <View style={styles.routePoints}>
                      <View style={styles.routePoint} />
                      <View style={styles.routeLine} />
                      <View style={[styles.routePoint, styles.destinationPoint]} />
                    </View>
                    <View style={styles.routeTexts}>
                      <Text style={styles.routeText}>{ride.from}</Text>
                      <Text style={styles.routeText}>{ride.to}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.rideDetails}>
                    <View style={styles.rideDetailItem}>
                      <Icon name="schedule" size={16} color="#888" />
                      <Text style={styles.rideDetailText}>{ride.time}, {ride.date}</Text>
                    </View>
                    <View style={styles.rideDetailItem}>
                      <Icon name="airline-seat-recline-normal" size={16} color="#888" />
                      <Text style={styles.rideDetailText}>{ride.seats} Koltuk</Text>
                    </View>
                    <Text style={styles.ridePrice}>{ride.price} ₺</Text>
                  </View>
                </View>
                
                <View style={styles.driverInfo}>
                  <AvatarPlaceholder size={30} name={ride.driver.name} />
                  <View>
                    <Text style={styles.driverName}>{ride.driver.name}</Text>
                    <View style={styles.driverRating}>
                      <Icon name="star" size={14} color="#FFB800" />
                      <Text style={styles.ratingText}>{ride.driver.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Çıkış Butonu */}
          <View style={styles.logoutContainer}>
            <CustomButton
              title="Çıkış Yap"
              onPress={logout}
              type="secondary"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#E74C3C',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  servicesContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  featuredContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#4982F3',
    fontSize: 14,
    fontWeight: '500',
  },
  featuredList: {
    paddingRight: 20,
  },
  carCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  carImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  carInfo: {
    padding: 12,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  carLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4982F3',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  nearbyContainer: {
    marginBottom: 25,
  },
  rideCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rideInfo: {
    flex: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routePoints: {
    alignItems: 'center',
    marginRight: 10,
  },
  routePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4982F3',
  },
  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: '#4982F3',
    marginVertical: 4,
  },
  destinationPoint: {
    backgroundColor: '#E74C3C',
  },
  routeTexts: {
    justifyContent: 'space-between',
  },
  routeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rideDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rideDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  rideDetailText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  ridePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4982F3',
    marginLeft: 'auto',
  },
  driverInfo: {
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
    paddingLeft: 15,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 5,
  },
  driverName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutContainer: {
    marginBottom: 20,
  },
});

export default HomeScreen; 