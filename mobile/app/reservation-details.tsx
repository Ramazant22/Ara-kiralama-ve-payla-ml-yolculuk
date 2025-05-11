import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Rezervasyon statüsü türleri
type ReservationStatus = 'pending' | 'approved' | 'cancelled' | 'completed';

// Rezervasyon detay arayüzü
interface ReservationDetail {
  id: string;
  status: ReservationStatus;
  ride: {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
    price: number;
  };
  driver: {
    id: string;
    name: string;
    photo: string;
    rating: number;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    photo: string;
  };
  passengers: number;
  totalPrice: number;
  createdAt: string;
  specialRequests?: string;
  cancellationReason?: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  meetingPoint?: string;
}

export default function ReservationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const reservationId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Mock reservation data - normalde API'den gelecek
  const reservation: ReservationDetail = {
    id: reservationId,
    status: 'approved',
    ride: {
      id: 'ride123',
      from: 'İstanbul, Kadıköy',
      to: 'Ankara, Kızılay',
      date: '15 Haziran 2023',
      time: '09:30',
      price: 250
    },
    driver: {
      id: 'driver456',
      name: 'Ahmet Yılmaz',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8
    },
    vehicle: {
      brand: 'Volkswagen',
      model: 'Passat',
      year: 2020,
      photo: 'https://images.unsplash.com/photo-1622005584112-9eda5ba364c7'
    },
    passengers: 2,
    totalPrice: 500,
    createdAt: '10 Haziran 2023',
    specialRequests: 'Evcil hayvanım var, 5kg küçük bir köpek. Yanımda taşıma çantasında olacak.',
    paymentStatus: 'completed',
    meetingPoint: 'Kadıköy İskelesi önü, İETT durakları'
  };
  
  // Renk ve ikon bilgisini döndüren yardımcı fonksiyon
  const getStatusInfo = (status: ReservationStatus) => {
    switch (status) {
      case 'pending':
        return { color: '#FF9800', icon: 'clock', text: 'Onay Bekliyor' };
      case 'approved':
        return { color: '#4CAF50', icon: 'check-circle', text: 'Onaylandı' };
      case 'cancelled':
        return { color: '#F44336', icon: 'times-circle', text: 'İptal Edildi' };
      case 'completed':
        return { color: '#2196F3', icon: 'flag-checkered', text: 'Tamamlandı' };
    }
  };
  
  // Ödeme durumu bilgisini döndüren yardımcı fonksiyon
  const getPaymentStatusInfo = (status: 'pending' | 'completed' | 'refunded') => {
    switch (status) {
      case 'pending':
        return { color: '#FF9800', icon: 'clock', text: 'Ödeme Bekleniyor' };
      case 'completed':
        return { color: '#4CAF50', icon: 'check-circle', text: 'Ödeme Tamamlandı' };
      case 'refunded':
        return { color: '#2196F3', icon: 'undo', text: 'Geri Ödeme Yapıldı' };
    }
  };
  
  // Rezervasyon iptal işlemi
  const handleCancelReservation = () => {
    if (!cancellationReason.trim()) {
      Alert.alert('Hata', 'Lütfen iptal nedeninizi belirtin.');
      return;
    }
    
    setIsLoading(true);
    
    // API isteği simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      setShowCancelModal(false);
      
      Alert.alert(
        'İptal Edildi',
        'Rezervasyonunuz başarıyla iptal edildi. İptal nedeniniz sürücüye iletildi.',
        [{ text: 'Tamam', onPress: () => router.replace('/reservations') }]
      );
    }, 1500);
  };
  
  // Sürücüye mesaj gönderme
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert('Hata', 'Lütfen bir mesaj girin.');
      return;
    }
    
    setIsLoading(true);
    
    // API isteği simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      setContactModalVisible(false);
      setMessageText('');
      
      Alert.alert(
        'Mesaj Gönderildi',
        'Mesajınız sürücüye iletildi. Sürücü size bildirim üzerinden yanıt verecektir.',
        [{ text: 'Tamam' }]
      );
    }, 1500);
  };
  
  const statusInfo = getStatusInfo(reservation.status);
  const paymentStatusInfo = getPaymentStatusInfo(reservation.paymentStatus);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Rezervasyon Detayları',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Durum Bilgisi */}
        <View style={[styles.statusBar, { backgroundColor: `${statusInfo.color}20` }]}>
          <FontAwesome5 name={statusInfo.icon} size={18} color={statusInfo.color} solid />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
        
        {/* Yolculuk Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Yolculuk Bilgileri</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} solid />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Kalkış</Text>
                <Text style={styles.locationName}>{reservation.ride.from}</Text>
              </View>
            </View>
            
            <View style={styles.routeLine}>
              <View style={styles.routeDot} />
              <View style={styles.routeDash} />
              <View style={styles.routeDot} />
            </View>
            
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} solid />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Varış</Text>
                <Text style={styles.locationName}>{reservation.ride.to}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} solid />
              <Text style={styles.detailText}>{reservation.ride.date}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="clock" size={16} color={colors.primary} solid />
              <Text style={styles.detailText}>{reservation.ride.time}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="users" size={16} color={colors.primary} solid />
              <Text style={styles.detailText}>{reservation.passengers} Kişi</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 name="tag" size={16} color={colors.primary} solid />
              <Text style={styles.detailText}>{reservation.totalPrice} TL</Text>
            </View>
          </View>
          
          {reservation.meetingPoint && (
            <View style={styles.meetingPointContainer}>
              <FontAwesome5 name="map-pin" size={16} color={colors.primary} solid />
              <View>
                <Text style={styles.meetingPointLabel}>Buluşma Noktası:</Text>
                <Text style={styles.meetingPointText}>{reservation.meetingPoint}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Sürücü Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sürücü</Text>
          <View style={styles.driverContainer}>
            <Image 
              source={{ uri: reservation.driver.photo }} 
              style={styles.driverPhoto}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{reservation.driver.name}</Text>
              <View style={styles.driverRating}>
                <FontAwesome5 name="star" size={14} color="#FFD700" solid />
                <Text style={styles.ratingText}>{reservation.driver.rating}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => setContactModalVisible(true)}
            >
              <FontAwesome5 name="comment" size={16} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>İletişim</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Araç Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Araç</Text>
          <View style={styles.vehicleContainer}>
            <Image 
              source={{ uri: reservation.vehicle.photo }} 
              style={styles.vehiclePhoto}
              resizeMode="cover"
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {reservation.vehicle.brand} {reservation.vehicle.model}
              </Text>
              <Text style={styles.vehicleYear}>{reservation.vehicle.year}</Text>
            </View>
          </View>
        </View>
        
        {/* Rezervasyon Detayları */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Rezervasyon Detayları</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rezervasyon ID</Text>
            <Text style={styles.detailValue}>{reservation.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Oluşturulma Tarihi</Text>
            <Text style={styles.detailValue}>{reservation.createdAt}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ödeme Durumu</Text>
            <View style={styles.paymentStatusContainer}>
              <FontAwesome5 
                name={paymentStatusInfo.icon} 
                size={14} 
                color={paymentStatusInfo.color} 
                solid 
              />
              <Text style={[styles.paymentStatusText, { color: paymentStatusInfo.color }]}>
                {paymentStatusInfo.text}
              </Text>
            </View>
          </View>
          
          {reservation.specialRequests && (
            <View style={styles.specialRequestsContainer}>
              <Text style={styles.specialRequestsLabel}>Özel İstekler</Text>
              <Text style={styles.specialRequestsText}>
                {reservation.specialRequests}
              </Text>
            </View>
          )}
          
          {reservation.status === 'cancelled' && reservation.cancellationReason && (
            <View style={styles.cancellationContainer}>
              <Text style={styles.cancellationLabel}>İptal Nedeni</Text>
              <Text style={styles.cancellationText}>
                {reservation.cancellationReason}
              </Text>
            </View>
          )}
        </View>
        
        {/* İşlem Butonları */}
        {reservation.status === 'pending' || reservation.status === 'approved' ? (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowCancelModal(true)}
            >
              <FontAwesome5 name="times" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Rezervasyonu İptal Et</Text>
            </TouchableOpacity>
            
            {reservation.status === 'approved' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.viewRideButton]}
                onPress={() => router.push(`/ride/${reservation.ride.id}` as any)}
              >
                <FontAwesome5 name="eye" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Yolculuk Detaylarını Gör</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : reservation.status === 'completed' ? (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rateButton]}
              onPress={() => router.push(`/rate-driver/${reservation.driver.id}` as any)}
            >
              <FontAwesome5 name="star" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Sürücüyü Değerlendir</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      
      {/* İptal Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rezervasyonu İptal Et</Text>
            <Text style={styles.modalDescription}>
              Rezervasyonunuzu iptal etmek üzeresiniz. Lütfen iptal nedeninizi belirtin.
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="İptal nedeniniz"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={cancellationReason}
              onChangeText={setCancellationReason}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowCancelModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelModalButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleCancelReservation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>İptal Et</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* İletişim Modal */}
      <Modal
        visible={contactModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sürücüyle İletişim</Text>
            
            <View style={styles.driverContactInfo}>
              <Image 
                source={{ uri: reservation.driver.photo }} 
                style={styles.driverContactPhoto} 
              />
              <Text style={styles.driverContactName}>{reservation.driver.name}</Text>
            </View>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Mesajınız"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={messageText}
              onChangeText={setMessageText}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setContactModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelModalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
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
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTextContainer: {
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 2,
  },
  locationName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 9,
    marginVertical: 4,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  routeDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  meetingPointContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  meetingPointLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  meetingPointText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    marginTop: 2,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.text,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehiclePhoto: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: colors.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.3)',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  specialRequestsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  specialRequestsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  specialRequestsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  cancellationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  cancellationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  cancellationText: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  viewRideButton: {
    backgroundColor: colors.primary,
  },
  rateButton: {
    backgroundColor: '#FF9800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  confirmModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  driverContactInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  driverContactPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  driverContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  messageInput: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
}); 