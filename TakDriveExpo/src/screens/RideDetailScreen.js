import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../context/ThemeContext';

const RideDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { ride } = route.params || {
    ride: {
      id: 1,
      from: "İstanbul",
      to: "Ankara",
      date: "24 Kasım 2023",
      time: "09:30",
      price: 250,
      seats: 3,
      availableSeats: 2,
      vehicle: {
        name: "Honda Civic",
        model: "2022",
        image: require('../assets/vehicle1.jpg'),
      },
      driver: {
        id: 1,
        name: "Ali Yılmaz",
        image: require('../assets/user1.jpg'),
        rating: 4.9,
        tripCount: 156,
        memberSince: "Haziran 2021",
        verified: true,
      },
      stops: [
        { location: "Bolu", time: "11:30" },
        { location: "Kırıkkale", time: "13:45" }
      ],
      preferences: ["Sigara içilmez", "Küçük bagaj", "Müzik açık"],
      notes: "Ankara'da AŞTİ'de son bulacak yolculuk. Yolda kısa molalar vereceğiz. Bagaj konusunda sınırlı alan olduğunu lütfen dikkate alın."
    }
  };

  const [selectedSeats, setSelectedSeats] = useState(0);

  const handleIncreaseSeats = () => {
    if (selectedSeats < ride.availableSeats) {
      setSelectedSeats(selectedSeats + 1);
    }
  };

  const handleDecreaseSeats = () => {
    if (selectedSeats > 0) {
      setSelectedSeats(selectedSeats - 1);
    }
  };

  const handleBookRide = () => {
    if (selectedSeats === 0) {
      Alert.alert("Hata", "Lütfen en az bir koltuk seçin.");
      return;
    }
    
    Alert.alert(
      "Rezervasyon Onayı",
      `${ride.from} - ${ride.to} yolculuğu için ${selectedSeats} koltuk rezerve etmek istiyor musunuz? Toplam ücret: ₺${ride.price * selectedSeats}`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Onayla", 
          onPress: () => {
            Alert.alert("Başarılı", "Rezervasyonunuz oluşturuldu. Sürücü tarafından onaylandığında bilgilendirileceksiniz.");
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <View style={styles.locationContainer}>
            <View style={styles.locationDot} />
            <Text style={[styles.locationText, { color: theme.textColor }]}>{ride.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationContainer}>
            <View style={[styles.locationDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.locationText, { color: theme.textColor }]}>{ride.to}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Icon name="calendar-alt" size={16} color="#4A90E2" />
            <Text style={[styles.dateTimeText, { color: theme.textColor }]}>{ride.date}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Icon name="clock" size={16} color="#4A90E2" />
            <Text style={[styles.dateTimeText, { color: theme.textColor }]}>{ride.time}</Text>
          </View>
          <View style={[styles.priceTag, { backgroundColor: theme.primaryColor }]}>
            <Text style={styles.priceText}>₺{ride.price}</Text>
            <Text style={styles.priceUnit}>/kişi</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.driverContainer}>
          <View style={styles.driverHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Sürücü</Text>
            <TouchableOpacity 
              style={styles.viewProfileButton} 
              onPress={() => navigation.navigate('UserProfile', { userId: ride.driver.id })}
            >
              <Text style={[styles.viewProfileText, { color: theme.primaryColor }]}>Profili Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.driverCard}>
            <Image source={ride.driver.image} style={styles.driverImage} />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: theme.textColor }]}>{ride.driver.name}</Text>
              <View style={styles.driverRating}>
                <Icon name="star" solid size={14} color="#FFD700" />
                <Text style={[styles.driverRatingText, { color: theme.textColor }]}>
                  {ride.driver.rating} ({ride.driver.tripCount} yolculuk)
                </Text>
              </View>
              <Text style={[styles.memberSinceText, { color: theme.textSecondaryColor }]}>
                {ride.driver.memberSince} tarihinden beri üye
              </Text>
            </View>
            {ride.driver.verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-circle" solid size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Doğrulanmış</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Araç</Text>
        <View style={styles.vehicleContainer}>
          <Image source={ride.vehicle.image} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleName, { color: theme.textColor }]}>
              {ride.vehicle.name}
            </Text>
            <Text style={[styles.vehicleModel, { color: theme.textSecondaryColor }]}>
              {ride.vehicle.model}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Duraklar</Text>
        <View style={styles.stopsContainer}>
          {ride.stops.map((stop, index) => (
            <View key={index} style={styles.stopItem}>
              <View style={styles.stopDot} />
              <Text style={[styles.stopLocation, { color: theme.textColor }]}>{stop.location}</Text>
              <Text style={[styles.stopTime, { color: theme.textSecondaryColor }]}>{stop.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Tercihler</Text>
        <View style={styles.preferencesContainer}>
          {ride.preferences.map((preference, index) => (
            <View key={index} style={styles.preferenceItem}>
              <Icon 
                name={getPreferenceIcon(preference)} 
                size={16} 
                color="#4A90E2" 
              />
              <Text style={[styles.preferenceText, { color: theme.textSecondaryColor }]}>
                {preference}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Notlar</Text>
        <Text style={[styles.notesText, { color: theme.textSecondaryColor }]}>
          {ride.notes}
        </Text>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Koltuk Seçimi</Text>
        <View style={styles.seatsContainer}>
          <Text style={[styles.seatsText, { color: theme.textSecondaryColor }]}>
            {ride.availableSeats} koltuk mevcut
          </Text>
          <View style={styles.seatSelector}>
            <TouchableOpacity
              style={[styles.seatButton, { borderColor: theme.borderColor }]}
              onPress={handleDecreaseSeats}
              disabled={selectedSeats === 0}
            >
              <Icon name="minus" size={16} color={selectedSeats === 0 ? '#CCCCCC' : '#FF5A5F'} />
            </TouchableOpacity>
            <Text style={[styles.seatCount, { color: theme.textColor }]}>{selectedSeats}</Text>
            <TouchableOpacity
              style={[styles.seatButton, { borderColor: theme.borderColor }]}
              onPress={handleIncreaseSeats}
              disabled={selectedSeats === ride.availableSeats}
            >
              <Icon 
                name="plus" 
                size={16} 
                color={selectedSeats === ride.availableSeats ? '#CCCCCC' : '#FF5A5F'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {selectedSeats > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: theme.textSecondaryColor }]}>
                Kişi başı ücret
              </Text>
              <Text style={[styles.summaryValue, { color: theme.textColor }]}>
                ₺{ride.price}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: theme.textSecondaryColor }]}>
                Koltuk sayısı
              </Text>
              <Text style={[styles.summaryValue, { color: theme.textColor }]}>
                {selectedSeats}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalText, { color: theme.textColor }]}>
                Toplam
              </Text>
              <Text style={[styles.totalValue, { color: theme.primaryColor }]}>
                ₺{ride.price * selectedSeats}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.bookButton, { opacity: selectedSeats > 0 ? 1 : 0.6 }]} 
          onPress={handleBookRide}
          disabled={selectedSeats === 0}
        >
          <Text style={styles.bookButtonText}>Rezervasyon Yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getPreferenceIcon = (preference) => {
  const preferenceIcons = {
    'Sigara içilmez': 'smoking-ban',
    'Evcil hayvan': 'paw',
    'Müzik açık': 'music',
    'Küçük bagaj': 'luggage-cart',
    'Sessiz yolculuk': 'volume-mute',
  };

  return preferenceIcons[preference] || 'check-circle';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  routeContainer: {
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5A5F',
    marginRight: 10,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#FFFFFF',
    marginLeft: 5,
  },
  contentContainer: {
    padding: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 6,
  },
  priceTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  driverContainer: {
    marginBottom: 8,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewProfileButton: {
    padding: 4,
  },
  viewProfileText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  driverInfo: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  driverRatingText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#888888',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 80,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#888888',
  },
  stopsContainer: {
    marginBottom: 8,
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
    backgroundColor: '#4A90E2',
    marginRight: 10,
  },
  stopLocation: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  stopTime: {
    fontSize: 14,
    color: '#888888',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  preferenceText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 6,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
  },
  seatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatsText: {
    fontSize: 14,
    color: '#666666',
  },
  seatSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  seatCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  bookButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideDetailScreen; 