import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../_layout';

export default function HomeScreen() {
  const router = useRouter();

  // Tip güvenli navigasyon fonksiyonu
  const navigateToService = (route: any) => {
    router.push(route);
  };

  // Örnek önerilen araçlar verisi
  const recommendedVehicles = [
    {
      id: '1',
      brand: 'BMW',
      model: '3.20i',
      year: 2021,
      price: 750,
      location: 'İstanbul, Kadıköy',
      image: 'https://via.placeholder.com/300x200',
      rating: 4.8
    },
    {
      id: '2',
      brand: 'Mercedes',
      model: 'C180',
      year: 2020,
      price: 800,
      location: 'İstanbul, Beşiktaş',
      image: 'https://via.placeholder.com/300x200',
      rating: 4.6
    },
    {
      id: '3',
      brand: 'Audi',
      model: 'A3',
      year: 2022,
      price: 650,
      location: 'İzmir, Karşıyaka',
      image: 'https://via.placeholder.com/300x200',
      rating: 4.9
    }
  ];

  // Örnek önerilen yolculuklar verisi
  const recommendedTrips = [
    {
      id: '1',
      from: 'İstanbul',
      to: 'Ankara',
      date: '24 Haz 2023',
      price: 250,
      driverName: 'Ahmet Yılmaz',
      driverPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
      seatsAvailable: 3
    },
    {
      id: '2',
      from: 'İzmir',
      to: 'Antalya',
      date: '25 Haz 2023',
      price: 300,
      driverName: 'Zeynep Demir',
      driverPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
      seatsAvailable: 2
    },
    {
      id: '3',
      from: 'Ankara',
      to: 'İstanbul',
      date: '26 Haz 2023',
      price: 280,
      driverName: 'Mehmet Kaya',
      driverPhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
      seatsAvailable: 1
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TakDrive</Text>
        <Text style={styles.subtitle}>Araç Kiralama ve Yolculuk Paylaşımı</Text>
      </View>
      
      {/* Hero Slider (web'deki gibi) */}
      <View style={styles.heroSlider}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3' }}
          style={styles.slideBackground}
          imageStyle={{ opacity: 0.15 }}
        >
          <View style={styles.slideContent}>
            <Text style={styles.slideTitle}>Kaliteli Araçlar</Text>
            <Text style={styles.slideText}>
              TakDrive ile dilediğiniz aracı kiralayın, lüks, ekonomik veya özel araçlarla yolculuğunuzu planlayın.
            </Text>
          </View>
        </ImageBackground>
      </View>
      
      {/* Hizmetlerimiz */}
      <Text style={styles.sectionTitle}>Hizmetlerimiz</Text>
      <View style={styles.servicesGrid}>
        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/(tabs)/vehicles')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="car" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Araç Kirala</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/add-vehicle')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="key" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Aracını Kiraya Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/(tabs)/rides')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="users" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Yolculuk Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/createRide')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="route" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Yolculuk Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/(tabs)/profile')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="user-circle" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.serviceIcon}
          onPress={() => navigateToService('/help')}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="user-tie" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.serviceLabel}>Şoförlü Hizmet</Text>
        </TouchableOpacity>
      </View>
      
      {/* Önerilen Araçlar Bölümü */}
      <View style={styles.recommendedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Önerilen Araçlar</Text>
          <TouchableOpacity onPress={() => navigateToService('/(tabs)/vehicles')}>
            <Text style={styles.seeAllButton}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          {recommendedVehicles.map(vehicle => (
            <TouchableOpacity 
              key={vehicle.id} 
              style={styles.vehicleCard}
              onPress={() => navigateToService(`/vehicle/${vehicle.id}`)}
            >
              <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
                <Text style={styles.vehicleYear}>{vehicle.year}</Text>
                <View style={styles.vehicleDetails}>
                  <View style={styles.locationContainer}>
                    <FontAwesome5 name="map-marker-alt" size={12} color={colors.primary} />
                    <Text style={styles.locationText}>{vehicle.location}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <FontAwesome5 name="star" size={12} color="#FFD700" solid />
                    <Text style={styles.ratingText}>{vehicle.rating}</Text>
                  </View>
                </View>
                <Text style={styles.vehiclePrice}>{vehicle.price} ₺<Text style={styles.perDay}>/gün</Text></Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Önerilen Yolculuklar Bölümü */}
      <View style={styles.recommendedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Önerilen Yolculuklar</Text>
          <TouchableOpacity onPress={() => navigateToService('/(tabs)/rides')}>
            <Text style={styles.seeAllButton}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          {recommendedTrips.map(trip => (
            <TouchableOpacity 
              key={trip.id} 
              style={styles.tripCard}
              onPress={() => navigateToService(`/ride/${trip.id}`)}
            >
              <View style={styles.tripRoute}>
                <Text style={styles.cityText}>{trip.from}</Text>
                <View style={styles.routeLine}>
                  <FontAwesome5 name="circle" size={8} color={colors.primary} solid />
                  <View style={styles.routeDash}></View>
                  <FontAwesome5 name="circle" size={8} color={colors.primary} solid />
                </View>
                <Text style={styles.cityText}>{trip.to}</Text>
              </View>
              
              <View style={styles.tripDetails}>
                <View style={styles.tripDate}>
                  <FontAwesome5 name="calendar-alt" size={12} color={colors.primary} />
                  <Text style={styles.tripDateText}>{trip.date}</Text>
                </View>
                
                <View style={styles.tripSeats}>
                  <FontAwesome5 name="users" size={12} color={colors.primary} />
                  <Text style={styles.tripSeatsText}>{trip.seatsAvailable} koltuk</Text>
                </View>
              </View>
              
              <View style={styles.tripFooter}>
                <View style={styles.driverInfo}>
                  <Image source={{ uri: trip.driverPhoto }} style={styles.driverPhoto} />
                  <Text style={styles.driverName}>{trip.driverName}</Text>
                </View>
                <Text style={styles.tripPrice}>{trip.price} ₺</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    marginTop: 5,
  },
  heroSlider: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  slideBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    padding: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  slideText: {
    fontSize: 16,
    color: '#CCCCCC',
    maxWidth: 300,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  serviceIcon: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  // Yeni eklenen stiller
  recommendedSection: {
    marginTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  seeAllButton: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScrollView: {
    paddingLeft: 16,
  },
  vehicleCard: {
    width: 240,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  vehicleInfo: {
    padding: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  vehicleYear: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  perDay: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  tripCard: {
    width: 240,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  routeDash: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tripDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDateText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  tripSeats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripSeatsText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  driverName: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
