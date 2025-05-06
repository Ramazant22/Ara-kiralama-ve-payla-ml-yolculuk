import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Components
import Carousel from '../components/Carousel';
import ServiceButton from '../components/ServiceButton';
import TripCard from '../components/TripCard';
import VehicleCard from '../components/VehicleCard';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [popularVehicles, setPopularVehicles] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  useEffect(() => {
    // Burada API'den veri çekilecek
    // Şimdilik mockup veri kullanıyoruz
    setPopularVehicles([
      {
        id: 1,
        title: 'Honda Civic',
        model: '2022',
        image: require('../assets/vehicle1.jpg'),
        price: 350,
        location: 'İstanbul',
        rating: 4.8,
      },
      {
        id: 2,
        title: 'Toyota Corolla',
        model: '2021',
        image: require('../assets/vehicle2.jpg'),
        price: 320,
        location: 'Ankara',
        rating: 4.6,
      },
      {
        id: 3,
        title: 'Renault Megane',
        model: '2020',
        image: require('../assets/vehicle3.jpg'),
        price: 280,
        location: 'İzmir',
        rating: 4.5,
      },
    ]);

    setUpcomingTrips([
      {
        id: 1,
        from: 'İstanbul',
        to: 'Ankara',
        date: '24 Kas',
        time: '09:30',
        price: '250₺',
        status: 'upcoming',
        driver: 'Ali Yılmaz',
      },
      {
        id: 2,
        from: 'Ankara',
        to: 'İzmir',
        date: '27 Kas',
        time: '10:15',
        price: '280₺',
        status: 'upcoming',
        driver: 'Ayşe Demir',
      },
    ]);
  }, []);

  const carouselData = [
    {
      id: 1,
      title: 'Araç Kirala',
      description: 'Binlerce araç arasından seçim yapın',
      image: require('../assets/slide1.jpg'),
      buttonText: 'Araçları Keşfet',
      onPress: () => navigation.navigate('Vehicles'),
    },
    {
      id: 2,
      title: 'Yolculuk Paylaş',
      description: 'Ekonomik ve çevre dostu seyahat edin',
      image: require('../assets/slide2.jpg'),
      buttonText: 'Yolculukları Keşfet',
      onPress: () => navigation.navigate('RideShare'),
    },
    {
      id: 3,
      title: 'Sürücü Ol',
      description: 'Kendi aracınızla kazanç sağlayın',
      image: require('../assets/slide3.jpg'),
      buttonText: 'Aracını Kirala',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const services = [
    {
      id: 1,
      icon: 'car',
      title: 'Araç Kirala',
      onPress: () => navigation.navigate('Vehicles'),
    },
    {
      id: 2,
      icon: 'route',
      title: 'Yolculuk Bul',
      onPress: () => navigation.navigate('RideShare'),
    },
    {
      id: 3,
      icon: 'car-side',
      title: 'Aracını Kirala',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 4,
      icon: 'map-marker-alt',
      title: 'Yakındakiler',
      onPress: () => {},
    },
    {
      id: 5,
      icon: 'calendar-alt',
      title: 'Rezervasyonlar',
      onPress: () => {},
    },
    {
      id: 6,
      icon: 'star',
      title: 'Favoriler',
      onPress: () => {},
    },
  ];

  const renderCarouselItem = ({ item }) => (
    <View style={styles.slideContainer}>
      <Image source={item.image} style={styles.slideImage} />
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
        <TouchableOpacity
          style={[styles.slideButton, { backgroundColor: theme.primary }]}
          onPress={item.onPress}
        >
          <Text style={styles.slideButtonText}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Merhaba, {user?.name?.split(' ')[0] || 'Misafir'}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondaryColor }]}>
            Bugün nereye gitmek istersin?
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="bell" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            data={carouselData}
            renderItem={renderCarouselItem}
          />
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hizmetler</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceButton
                key={service.id}
                icon={service.icon}
                title={service.title}
                onPress={service.onPress}
              />
            ))}
          </View>
        </View>

        {/* My Trips */}
        {upcomingTrips.length > 0 && (
          <View style={styles.tripsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Yaklaşan Yolculuklarım
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RideShare')}>
                <Text style={[styles.seeAllButton, { color: theme.primary }]}>
                  Tümünü Gör
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripsScroll}
            >
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={() => navigation.navigate('RideDetail', { rideId: trip.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Vehicles */}
        <View style={styles.vehiclesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Popüler Araçlar
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Vehicles')}>
              <Text style={[styles.seeAllButton, { color: theme.primary }]}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.vehiclesGrid}>
            {popularVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  carouselContainer: {
    height: 200,
    marginTop: 16,
  },
  slideContainer: {
    position: 'relative',
    height: 200,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  slideContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'flex-end',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  slideDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  slideButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  slideButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  servicesContainer: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tripsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#FF4500',
    fontWeight: '500',
  },
  tripsScroll: {
    paddingLeft: 0,
    paddingRight: 16,
  },
  vehiclesContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  vehiclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 