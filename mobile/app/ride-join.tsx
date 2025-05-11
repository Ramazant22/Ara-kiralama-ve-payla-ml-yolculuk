import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function RideJoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rideId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  
  // Demo ride data - normalde API'den gelecek
  const ride = {
    id: rideId,
    from: 'İstanbul, Kadıköy',
    to: 'Ankara, Kızılay',
    date: '15 Haziran 2023',
    time: '09:30',
    availableSeats: 3,
    pricePerSeat: 250,
    driver: {
      name: 'Ahmet Yılmaz',
      rating: 4.8,
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    vehicle: {
      brand: 'Volkswagen',
      model: 'Passat',
      year: 2020,
      color: 'Siyah'
    },
    meetingPoint: 'Kadıköy İskelesi önü, İETT durakları',
    duration: '5 saat 30 dakika',
    stops: ['İzmit', 'Bolu', 'Ankara']
  };
  
  const incrementPassengers = () => {
    if (passengerCount < ride.availableSeats) {
      setPassengerCount(passengerCount + 1);
    }
  };
  
  const decrementPassengers = () => {
    if (passengerCount > 1) {
      setPassengerCount(passengerCount - 1);
    }
  };
  
  const getTotalPrice = () => {
    return ride.pricePerSeat * passengerCount;
  };
  
  const handleJoinRide = () => {
    if (!contactNumber.trim()) {
      Alert.alert('Hata', 'Lütfen iletişim numaranızı girin.');
      return;
    }
    
    setIsLoading(true);
    
    // API isteği simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        'Katılım Talebi Gönderildi',
        'Yolculuğa katılım talebiniz sürücüye iletildi. Sürücünün onayı sonrasında rezervasyonunuz tamamlanacaktır.',
        [
          {
            text: 'Tamam',
            onPress: () => router.push('/reservations')
          }
        ]
      );
    }, 1500);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Yolculuğa Katılım',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Rota ve Tarih Bilgisi */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View style={styles.routeInfo}>
              <View style={styles.locationContainer}>
                <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} solid />
                <Text style={styles.locationText}>{ride.from}</Text>
              </View>
              
              <View style={styles.routeArrow}>
                <View style={styles.arrowLine} />
                <FontAwesome5 name="chevron-down" size={14} color={colors.primary} solid />
              </View>
              
              <View style={styles.locationContainer}>
                <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} solid />
                <Text style={styles.locationText}>{ride.to}</Text>
              </View>
            </View>
            
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>{ride.date}</Text>
              <Text style={styles.timeText}>{ride.time}</Text>
            </View>
          </View>
          
          <View style={styles.rideDetails}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="user" size={14} color={colors.primary} solid />
              <Text style={styles.detailText}>{ride.driver.name}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="car" size={14} color={colors.primary} solid />
              <Text style={styles.detailText}>{ride.vehicle.brand} {ride.vehicle.model}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="clock" size={14} color={colors.primary} solid />
              <Text style={styles.detailText}>{ride.duration}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="map-pin" size={14} color={colors.primary} solid />
              <Text style={styles.detailText}>Buluşma: {ride.meetingPoint}</Text>
            </View>
          </View>
        </View>
        
        {/* Yolcu ve Ödeme Bilgileri */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Yolcu Bilgileri</Text>
          
          <View style={styles.passengerSelector}>
            <Text style={styles.selectorLabel}>Yolcu Sayısı</Text>
            
            <View style={styles.selectorControls}>
              <TouchableOpacity 
                style={[styles.selectorButton, passengerCount <= 1 && styles.selectorButtonDisabled]} 
                onPress={decrementPassengers}
                disabled={passengerCount <= 1}
              >
                <FontAwesome5 name="minus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.passengerCount}>{passengerCount}</Text>
              
              <TouchableOpacity 
                style={[styles.selectorButton, passengerCount >= ride.availableSeats && styles.selectorButtonDisabled]} 
                onPress={incrementPassengers}
                disabled={passengerCount >= ride.availableSeats}
              >
                <FontAwesome5 name="plus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>İletişim Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefon Numarası"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Özel İstekler (İsteğe bağlı)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Yolculukla ilgili belirtmek istediğiniz özel istekler..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Ödeme Bilgileri */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <FontAwesome5 
                name="money-bill-wave" 
                size={20} 
                color={paymentMethod === 'cash' ? colors.primary : colors.secondary} 
              />
              <Text 
                style={[
                  styles.paymentOptionText,
                  paymentMethod === 'cash' && styles.paymentOptionTextSelected
                ]}
              >
                Nakit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <FontAwesome5 
                name="credit-card" 
                size={20} 
                color={paymentMethod === 'card' ? colors.primary : colors.secondary} 
              />
              <Text 
                style={[
                  styles.paymentOptionText,
                  paymentMethod === 'card' && styles.paymentOptionTextSelected
                ]}
              >
                Kredi Kartı
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Kişi Başı</Text>
              <Text style={styles.priceValue}>{ride.pricePerSeat} TL</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Yolcu Sayısı</Text>
              <Text style={styles.priceValue}>{passengerCount}</Text>
            </View>
            
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceLabel}>Toplam Tutar</Text>
              <Text style={styles.totalPriceValue}>{getTotalPrice()} TL</Text>
            </View>
          </View>
        </View>
        
        {/* Katılım İptal Politikası */}
        <View style={styles.infoCard}>
          <FontAwesome5 name="info-circle" size={18} color={colors.primary} solid />
          <Text style={styles.infoText}>
            Yolculuk başlama saatinden 24 saat öncesine kadar olan iptallerde tam iade yapılmaktadır. 24 saat içerisindeki iptallerde %50 kesinti uygulanır.
          </Text>
        </View>
        
        {/* Katılım Butonu */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinRide}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="check-circle" size={16} color="#FFFFFF" solid />
              <Text style={styles.joinButtonText}>Yolculuğa Katıl</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
    paddingBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  routeArrow: {
    marginLeft: 18,
    alignItems: 'center',
    height: 24,
    marginVertical: 2,
  },
  arrowLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.primary,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  rideDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 16,
  },
  passengerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    color: colors.text,
  },
  selectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  passengerCount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textarea: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    height: 100,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    marginHorizontal: 5,
  },
  paymentOptionSelected: {
    backgroundColor: `${colors.primary}20`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paymentOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  paymentOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  priceDetails: {
    marginTop: 16,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.2)',
    marginTop: 8,
    paddingTop: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  totalPriceValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});