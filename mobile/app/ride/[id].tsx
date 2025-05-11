import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../_layout';

export default function RideDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const rideId = params.id as string;

  // Normally this would come from an API call
  const ride = {
    id: rideId,
    startLocation: 'İstanbul, Kadıköy',
    endLocation: 'Ankara, Kızılay',
    date: '10 Temmuz 2023',
    time: '08:00',
    availableSeats: 3,
    price: 250,
    driver: {
      name: 'Mehmet Yılmaz',
      rating: 4.7,
      photo: 'https://randomuser.me/api/portraits/men/43.jpg',
      totalRides: 128
    },
    car: {
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      color: 'Siyah',
      photo: 'https://images.unsplash.com/photo-1547245324-37b3e88543e7?q=80&w=2070&fm=jpg'
    },
    stops: [
      'İzmit',
      'Sakarya',
      'Bolu'
    ],
    preferences: [
      'Sigara içilmez',
      'Evcil hayvan kabul edilmez',
      'Müzik dinlenir'
    ],
    description: 'İstanbul Kadıköy\'den başlayıp Ankara Kızılay\'da son bulacak yolculuğumuza katılmak isteyenler için uygun fiyatlı bir yolculuk. Belirtilen duraklarda kısa molalar verilebilir. Lütfen zamanında buluşma noktasında olun.'
  };

  // Selected seat count
  const [selectedSeats, setSelectedSeats] = useState(1);

  // Handle increment and decrement of seats
  const incrementSeats = () => {
    if (selectedSeats < ride.availableSeats) {
      setSelectedSeats(selectedSeats + 1);
    }
  };

  const decrementSeats = () => {
    if (selectedSeats > 1) {
      setSelectedSeats(selectedSeats - 1);
    }
  };

  // Handle booking - now redirects to ride-join page
  const handleBooking = () => {
    router.push({
      pathname: '/ride-join',
      params: { id: ride.id, seats: selectedSeats }
    } as any);
  };

  // Alt olarak doğrudan sürücüye mesaj gönderme
  const handleContactDriver = () => {
    Alert.alert(
      "Sürücü İle İletişim",
      "Yolculuk hakkında soru sormak için sürücü ile iletişime geçebilirsiniz.",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Mesaj Gönder", 
          onPress: () => {
            // Chat ekranına yönlendirilecek
            Alert.alert("Bilgi", "Mesaj özelliği yakında eklenecektir.");
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${ride.startLocation} - ${ride.endLocation}`,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView>
        {/* Route Map/Image */}
        <View style={styles.routeImageContainer}>
          <View style={styles.routeInfo}>
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} solid />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Kalkış</Text>
                <Text style={styles.locationName}>{ride.startLocation}</Text>
              </View>
            </View>
            
            <View style={styles.routeLine}>
              <View style={styles.routeDot} />
              <View style={styles.routeDash} />
              <View style={styles.routeDot} />
            </View>
            
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} solid />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Varış</Text>
                <Text style={styles.locationName}>{ride.endLocation}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Ride Info */}
        <View style={styles.infoContainer}>
          <View style={styles.rideInfoItem}>
            <FontAwesome5 name="calendar-alt" size={18} color={colors.primary} solid />
            <Text style={styles.rideInfoText}>{ride.date}</Text>
          </View>
          
          <View style={styles.rideInfoItem}>
            <FontAwesome5 name="clock" size={18} color={colors.primary} solid />
            <Text style={styles.rideInfoText}>{ride.time}</Text>
          </View>
          
          <View style={styles.rideInfoItem}>
            <FontAwesome5 name="chair" size={18} color={colors.primary} solid />
            <Text style={styles.rideInfoText}>{ride.availableSeats} Koltuk</Text>
          </View>
          
          <View style={styles.rideInfoItem}>
            <FontAwesome5 name="money-bill-wave" size={18} color={colors.primary} solid />
            <Text style={styles.rideInfoText}>{ride.price} TL</Text>
          </View>
        </View>
          
        {/* Driver Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sürücü</Text>
          <View style={styles.driverContainer}>
            <Image 
              source={{ uri: ride.driver.photo }} 
              style={styles.driverPhoto}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <View style={styles.driverRating}>
                <FontAwesome5 name="star" size={14} color="#FFD700" solid />
                <Text style={styles.ratingText}>{ride.driver.rating}</Text>
                <Text style={styles.totalRides}>({ride.driver.totalRides} Yolculuk)</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactDriver}
            >
              <FontAwesome5 name="comment" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Car Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Araç</Text>
          <View style={styles.carContainer}>
            <Image 
              source={{ uri: ride.car.photo }} 
              style={styles.carPhoto}
              resizeMode="cover"
            />
            <View style={styles.carInfo}>
              <Text style={styles.carName}>{ride.car.brand} {ride.car.model}</Text>
              <Text style={styles.carDetail}>{ride.car.year} · {ride.car.color}</Text>
            </View>
          </View>
        </View>
        
        {/* Stops */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Duraklar</Text>
          <View style={styles.stopsContainer}>
            {ride.stops.map((stop, index) => (
              <View key={index} style={styles.stopItem}>
                <View style={styles.stopDot} />
                <Text style={styles.stopText}>{stop}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Yolculuk Tercihleri</Text>
          <View style={styles.preferencesContainer}>
            {ride.preferences.map((preference, index) => (
              <View key={index} style={styles.preferenceItem}>
                <FontAwesome5 
                  name={
                    preference.includes('Sigara') ? 'smoking-ban' : 
                    preference.includes('Evcil') ? 'paw' : 
                    preference.includes('Müzik') ? 'music' : 'check-circle'
                  } 
                  size={16} 
                  color={colors.primary} 
                  solid 
                />
                <Text style={styles.preferenceText}>{preference}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{ride.description}</Text>
        </View>
        
        {/* Booking Section */}
        <View style={styles.bookingContainer}>
          <View style={styles.seatsSelector}>
            <Text style={styles.seatsTitle}>Koltuk Sayısı</Text>
            <View style={styles.seatsSelectorControls}>
              <TouchableOpacity 
                style={[styles.seatButton, selectedSeats === 1 && styles.seatButtonDisabled]} 
                onPress={decrementSeats}
                disabled={selectedSeats === 1}
              >
                <FontAwesome5 name="minus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.seatCount}>{selectedSeats}</Text>
              
              <TouchableOpacity 
                style={[styles.seatButton, selectedSeats === ride.availableSeats && styles.seatButtonDisabled]} 
                onPress={incrementSeats}
                disabled={selectedSeats === ride.availableSeats}
              >
                <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.totalContainer}>
            <View>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalSeats}>{selectedSeats} kişi</Text>
            </View>
            <Text style={styles.totalPrice}>{selectedSeats * ride.price} TL</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={handleBooking}
          >
            <FontAwesome5 name="check-circle" size={16} color="#FFFFFF" solid style={styles.bookButtonIcon} />
            <Text style={styles.bookButtonText}>Yolculuğa Katıl</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={handleContactDriver}
          >
            <FontAwesome5 name="question-circle" size={16} color={colors.text} solid style={styles.infoButtonIcon} />
            <Text style={styles.infoButtonText}>Yolculuk Hakkında Soru Sor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  routeImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routeInfo: {
    width: '100%',
    paddingVertical: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationTextContainer: {
    marginLeft: 15,
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingLeft: 0,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  routeDash: {
    flex: 1,
    height: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rideInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  rideInfoText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.text,
    marginLeft: 4,
    fontSize: 14,
  },
  totalRides: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginLeft: 4,
  },
  contactButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  carContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carPhoto: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  carDetail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  stopsContainer: {
    marginTop: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  stopText: {
    fontSize: 15,
    color: colors.text,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  preferenceText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  bookingContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  seatsSelector: {
    marginBottom: 16,
  },
  seatsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  seatsSelectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 8,
  },
  seatButton: {
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatButtonDisabled: {
    backgroundColor: 'rgba(255,69,0,0.5)',
  },
  seatCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  totalSeats: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButtonIcon: {
    marginRight: 10,
  },
  infoButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  infoButtonIcon: {
    marginRight: 10,
  },
}); 