import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import reservationService from '../api/services/reservationService';

const ReservationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId } = route.params;
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Tema renkleri
  const backgroundColor = darkMode ? '#121212' : '#F7F7F7';
  const cardColor = darkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = darkMode ? '#BBBBBB' : '#666666';
  const borderColor = darkMode ? '#333333' : '#E0E0E0';
  
  // Rezervasyon detaylarını yükle
  const loadReservationDetails = async () => {
    try {
      setLoading(true);
      // Gerçek API'den veri çekilecek
      const response = await reservationService.getReservationById(reservationId);
      setReservation(response.reservation);
    } catch (error) {
      console.error('Rezervasyon detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyon detayları yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    loadReservationDetails();
  }, [reservationId]);
  
  // Rezervasyonu iptal etme
  const handleCancelReservation = async () => {
    try {
      setLoading(true);
      // Gerçek API çağrısı
      await reservationService.cancelReservation(reservationId, { reason: cancelReason });
      
      Alert.alert(
        'Başarılı',
        'Rezervasyonunuz iptal edildi',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Rezervasyon iptal edilirken hata:', error);
      Alert.alert('Hata', 'Rezervasyon iptal edilirken bir sorun oluştu');
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };
  
  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Tarihler arası gün sayısı hesaplama
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Rezervasyon durumuna göre stil ve text belirleme
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Onay Bekliyor', color: '#FFA500', icon: 'clock' };
      case 'confirmed':
        return { text: 'Onaylandı', color: '#4CAF50', icon: 'check-circle' };
      case 'ongoing':
        return { text: 'Devam Ediyor', color: '#2196F3', icon: 'car' };
      case 'completed':
        return { text: 'Tamamlandı', color: '#4CAF50', icon: 'check-double' };
      case 'cancelled':
        return { text: 'İptal Edildi', color: '#F44336', icon: 'times-circle' };
      default:
        return { text: 'Bilinmiyor', color: '#9E9E9E', icon: 'question-circle' };
    }
  };
  
  // Ödeme durumuna göre stil ve text belirleme
  const getPaymentInfo = (paymentStatus) => {
    switch (paymentStatus) {
      case 'unpaid':
        return { text: 'Ödenmedi', color: '#F44336', icon: 'times-circle' };
      case 'partial':
        return { text: 'Kısmi Ödeme', color: '#FFA500', icon: 'hand-holding-usd' };
      case 'paid':
        return { text: 'Ödendi', color: '#4CAF50', icon: 'check-circle' };
      default:
        return { text: 'Bilinmiyor', color: '#9E9E9E', icon: 'question-circle' };
    }
  };
  
  // İptal modalı
  const renderCancelModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>Rezervasyonu İptal Et</Text>
          
          <Text style={[styles.modalText, { color: secondaryTextColor }]}>
            Rezervasyonu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCancelReservation}
            >
              <Text style={styles.confirmButtonText}>İptal Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // Yükleme durumu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Rezervasyon detayları yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Rezervasyon yoksa
  if (!reservation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.notFoundContainer}>
          <Icon name="exclamation-circle" size={50} color={secondaryTextColor} />
          <Text style={[styles.notFoundText, { color: textColor }]}>
            Rezervasyon bulunamadı
          </Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListButtonText}>Listeye Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Rezervasyon bulunduğunda
  const { vehicle, startDate, endDate, totalPrice, status, paymentStatus } = reservation;
  const statusInfo = getStatusInfo(status);
  const paymentInfo = getPaymentInfo(paymentStatus);
  const days = calculateDays(startDate, endDate);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Rezervasyon Detayı</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Durum Kartı */}
        <View style={[styles.statusCard, { backgroundColor: cardColor }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Icon name={statusInfo.icon} size={12} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${paymentInfo.color}20` }]}>
              <Icon name={paymentInfo.icon} size={12} color={paymentInfo.color} />
              <Text style={[styles.statusText, { color: paymentInfo.color }]}>
                {paymentInfo.text}
              </Text>
            </View>
          </View>
          
          <View style={styles.reservationInfoRow}>
            <Text style={[styles.reservationInfoLabel, { color: secondaryTextColor }]}>
              Rezervasyon No:
            </Text>
            <Text style={[styles.reservationInfoValue, { color: textColor }]}>
              #{reservationId.substring(0, 8).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.reservationInfoRow}>
            <Text style={[styles.reservationInfoLabel, { color: secondaryTextColor }]}>
              Rezervasyon Tarihi:
            </Text>
            <Text style={[styles.reservationInfoValue, { color: textColor }]}>
              {formatDate(reservation.createdAt)}
            </Text>
          </View>
        </View>
        
        {/* Araç Detayları */}
        <View style={[styles.sectionCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Araç Bilgileri</Text>
          
          <View style={styles.vehicleDetails}>
            <Image
              source={{ uri: vehicle?.photos?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.vehicleImage}
            />
            
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, { color: textColor }]}>
                {vehicle?.brand} {vehicle?.model}
              </Text>
              <Text style={[styles.vehicleYear, { color: secondaryTextColor }]}>
                {vehicle?.year} - {vehicle?.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
              </Text>
              <Text style={[styles.vehiclePlate, { color: secondaryTextColor }]}>
                {vehicle?.licensePlate}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.viewVehicleButton}
            onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle?._id })}
          >
            <Text style={styles.viewVehicleButtonText}>Araç Detaylarını Görüntüle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tarih Bilgileri */}
        <View style={[styles.sectionCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Tarih Bilgileri</Text>
          
          <View style={[styles.dateCard, { borderColor }]}>
            <View style={styles.dateRow}>
              <Icon name="calendar-plus" size={18} color="#4CAF50" />
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: secondaryTextColor }]}>Başlangıç</Text>
                <Text style={[styles.dateValue, { color: textColor }]}>{formatDate(startDate)}</Text>
              </View>
            </View>
            
            <View style={[styles.dateDivider, { backgroundColor: borderColor }]} />
            
            <View style={styles.dateRow}>
              <Icon name="calendar-minus" size={18} color="#F44336" />
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: secondaryTextColor }]}>Bitiş</Text>
                <Text style={[styles.dateValue, { color: textColor }]}>{formatDate(endDate)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.durationContainer}>
            <Text style={[styles.durationText, { color: secondaryTextColor }]}>
              Toplam Süre:
            </Text>
            <Text style={[styles.durationValue, { color: textColor }]}>
              {days} Gün
            </Text>
          </View>
        </View>
        
        {/* Fiyat Bilgileri */}
        <View style={[styles.sectionCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Ödeme Detayları</Text>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>Günlük Ücret</Text>
            <Text style={[styles.priceValue, { color: textColor }]}>
              {(totalPrice / days).toFixed(2)} ₺
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>Gün Sayısı</Text>
            <Text style={[styles.priceValue, { color: textColor }]}>{days} Gün</Text>
          </View>
          
          {reservation.extraOptions && Object.keys(reservation.extraOptions).some(key => reservation.extraOptions[key]) && (
            <View style={styles.extrasContainer}>
              <Text style={[styles.extrasTitle, { color: secondaryTextColor }]}>Ek Hizmetler</Text>
              
              {reservation.extraOptions.childSeat && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>Çocuk Koltuğu</Text>
                  <Text style={[styles.priceValue, { color: textColor }]}>50.00 ₺</Text>
                </View>
              )}
              
              {reservation.extraOptions.gps && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>GPS</Text>
                  <Text style={[styles.priceValue, { color: textColor }]}>30.00 ₺</Text>
                </View>
              )}
              
              {reservation.extraOptions.additionalDriver && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>Ek Sürücü</Text>
                  <Text style={[styles.priceValue, { color: textColor }]}>100.00 ₺</Text>
                </View>
              )}
              
              {reservation.extraOptions.fullInsurance && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>Tam Sigorta</Text>
                  <Text style={[styles.priceValue, { color: textColor }]}>150.00 ₺</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Toplam Tutar</Text>
            <Text style={styles.totalValue}>{totalPrice.toFixed(2)} ₺</Text>
          </View>
        </View>
        
        {/* Aksiyon Butonları */}
        {status === 'pending' || status === 'confirmed' ? (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelReservationButton]}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="times-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Rezervasyonu İptal Et</Text>
            </TouchableOpacity>
            
            {paymentStatus === 'unpaid' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.payNowButton]}
                onPress={() => navigation.navigate('Payment', { reservationId })}
              >
                <Icon name="credit-card" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Şimdi Öde</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
        
        {status === 'completed' && !reservation.isReviewed && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => navigation.navigate('AddReview', { reservationId })}
          >
            <Icon name="star" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Değerlendirme Yap</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {renderCancelModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  reservationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reservationInfoLabel: {
    fontSize: 14,
  },
  reservationInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vehicleDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  vehicleYear: {
    fontSize: 14,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  viewVehicleButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewVehicleButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateCard: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dateInfo: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateDivider: {
    height: 1,
    width: '100%',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    marginRight: 6,
  },
  durationValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
  },
  extrasContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  extrasTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  cancelReservationButton: {
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  payNowButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  reviewButton: {
    backgroundColor: '#FFC107',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  backToListButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToListButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#2196F3',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});

export default ReservationDetailScreen; 