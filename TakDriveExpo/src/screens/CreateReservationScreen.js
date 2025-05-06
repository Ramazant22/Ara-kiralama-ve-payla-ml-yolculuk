import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import vehicleService from '../api/services/vehicleService';
import reservationService from '../api/services/reservationService';

const CreateReservationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId } = route.params;
  const { user, isVerified } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // tomorrow
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [dailyPrice, setDailyPrice] = useState(0);
  const [extras, setExtras] = useState({
    childSeat: false,
    gps: false,
    additionalDriver: false,
    fullInsurance: false
  });
  const [extrasPrices, setExtrasPrices] = useState({
    childSeat: 50,
    gps: 30,
    additionalDriver: 100,
    fullInsurance: 150
  });
  
  // Tema renkleri
  const backgroundColor = darkMode ? '#121212' : '#F7F7F7';
  const cardColor = darkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = darkMode ? '#BBBBBB' : '#666666';
  const borderColor = darkMode ? '#333333' : '#E0E0E0';
  
  // Araç detaylarını yükle
  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleById(vehicleId);
      setVehicle(response.vehicle);
      setDailyPrice(response.vehicle.dailyPrice);
      calculateTotalPrice(response.vehicle.dailyPrice, startDate, endDate, extras);
    } catch (error) {
      console.error('Araç detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'Araç detayları yüklenirken bir sorun oluştu');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);
  
  // Toplam fiyatı hesaplama
  const calculateTotalPrice = (price, start, end, selectedExtras) => {
    // Gün sayısını hesapla
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Temel fiyat
    let total = price * diffDays;
    
    // Ek hizmetlerin fiyatını ekle
    if (selectedExtras.childSeat) total += extrasPrices.childSeat;
    if (selectedExtras.gps) total += extrasPrices.gps;
    if (selectedExtras.additionalDriver) total += extrasPrices.additionalDriver;
    if (selectedExtras.fullInsurance) total += extrasPrices.fullInsurance;
    
    setTotalPrice(total);
  };
  
  // Tarih değişikliği
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Eğer bitiş tarihi başlangıç tarihinden önceyse, bitiş tarihini güncelle
      if (endDate < selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(selectedDate.getDate() + 1);
        setEndDate(newEndDate);
        calculateTotalPrice(dailyPrice, selectedDate, newEndDate, extras);
      } else {
        calculateTotalPrice(dailyPrice, selectedDate, endDate, extras);
      }
    }
  };
  
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      calculateTotalPrice(dailyPrice, startDate, selectedDate, extras);
    }
  };
  
  // Extra'ların değişimi
  const toggleExtra = (key) => {
    const newExtras = { ...extras, [key]: !extras[key] };
    setExtras(newExtras);
    calculateTotalPrice(dailyPrice, startDate, endDate, newExtras);
  };
  
  // Tarih formatı
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Rezervasyon oluştur
  const handleCreateReservation = async () => {
    if (!isVerified) {
      Alert.alert(
        "Doğrulama Gerekli",
        "Rezervasyon yapabilmek için kimlik doğrulaması gereklidir.",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Doğrulamaya Git", 
            onPress: () => navigation.navigate('IdentityVerification')
          }
        ]
      );
      return;
    }
    
    // Tarih kontrolü
    if (startDate >= endDate) {
      Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Tarih formatlarını ayarla
      const reservationData = {
        vehicle: vehicleId,
        user: user._id,
        startDate,
        endDate,
        totalPrice,
        extraOptions: extras,
        status: 'pending',
        paymentStatus: 'unpaid'
      };
      
      const response = await reservationService.createReservation(reservationData);
      
      Alert.alert(
        'Başarılı',
        'Rezervasyon talebiniz alındı. Onay durumunu rezervasyonlarım bölümünden takip edebilirsiniz.',
        [
          {
            text: 'Ödeme Yap',
            onPress: () => navigation.navigate('Payment', { reservationId: response.reservation._id })
          },
          {
            text: 'Rezervasyonlarım',
            onPress: () => navigation.navigate('Reservations')
          }
        ]
      );
    } catch (error) {
      console.error('Rezervasyon oluşturulurken hata:', error);
      Alert.alert('Hata', 'Rezervasyon oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Yükleme durumu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Araç bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Rezervasyon Oluştur</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Araç Bilgileri */}
        <View style={[styles.vehicleCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Araç Bilgileri</Text>
          
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleName, { color: textColor }]}>
              {vehicle?.brand} {vehicle?.model}
            </Text>
            <Text style={[styles.vehicleDetails, { color: secondaryTextColor }]}>
              {vehicle?.year} - {vehicle?.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
            </Text>
            <Text style={[styles.vehiclePrice, { color: textColor }]}>
              {dailyPrice} ₺ <Text style={{ fontSize: 14, color: secondaryTextColor }}>/ günlük</Text>
            </Text>
          </View>
        </View>
        
        {/* Tarih Seçimi */}
        <View style={[styles.dateCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Tarih Seçimi</Text>
          
          <TouchableOpacity
            style={[styles.dateSelector, { borderColor }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.dateLabelContainer}>
              <Icon name="calendar-plus" size={16} color="#4CAF50" />
              <Text style={[styles.dateLabel, { color: secondaryTextColor }]}>Başlangıç Tarihi</Text>
            </View>
            <Text style={[styles.dateValue, { color: textColor }]}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dateSelector, { borderColor }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <View style={styles.dateLabelContainer}>
              <Icon name="calendar-minus" size={16} color="#F44336" />
              <Text style={[styles.dateLabel, { color: secondaryTextColor }]}>Bitiş Tarihi</Text>
            </View>
            <Text style={[styles.dateValue, { color: textColor }]}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
          
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onEndDateChange}
              minimumDate={new Date(startDate.getTime() + 86400000)} // start date + 1 day
            />
          )}
          
          <View style={styles.durationContainer}>
            <Text style={[styles.durationLabel, { color: secondaryTextColor }]}>Toplam Kiralama Süresi:</Text>
            <Text style={[styles.durationValue, { color: textColor }]}>
              {Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))} Gün
            </Text>
          </View>
        </View>
        
        {/* Ek Hizmetler */}
        <View style={[styles.extrasCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Ek Hizmetler</Text>
          
          <View style={[styles.extraItem, { borderBottomColor: borderColor }]}>
            <View style={styles.extraInfo}>
              <Text style={[styles.extraTitle, { color: textColor }]}>Çocuk Koltuğu</Text>
              <Text style={[styles.extraPrice, { color: secondaryTextColor }]}>+{extrasPrices.childSeat} ₺</Text>
            </View>
            <Switch
              value={extras.childSeat}
              onValueChange={() => toggleExtra('childSeat')}
              trackColor={{ false: '#767577', true: '#4CAF5020' }}
              thumbColor={extras.childSeat ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.extraItem, { borderBottomColor: borderColor }]}>
            <View style={styles.extraInfo}>
              <Text style={[styles.extraTitle, { color: textColor }]}>GPS</Text>
              <Text style={[styles.extraPrice, { color: secondaryTextColor }]}>+{extrasPrices.gps} ₺</Text>
            </View>
            <Switch
              value={extras.gps}
              onValueChange={() => toggleExtra('gps')}
              trackColor={{ false: '#767577', true: '#4CAF5020' }}
              thumbColor={extras.gps ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.extraItem, { borderBottomColor: borderColor }]}>
            <View style={styles.extraInfo}>
              <Text style={[styles.extraTitle, { color: textColor }]}>Ek Sürücü</Text>
              <Text style={[styles.extraPrice, { color: secondaryTextColor }]}>+{extrasPrices.additionalDriver} ₺</Text>
            </View>
            <Switch
              value={extras.additionalDriver}
              onValueChange={() => toggleExtra('additionalDriver')}
              trackColor={{ false: '#767577', true: '#4CAF5020' }}
              thumbColor={extras.additionalDriver ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.extraItem}>
            <View style={styles.extraInfo}>
              <Text style={[styles.extraTitle, { color: textColor }]}>Tam Sigorta</Text>
              <Text style={[styles.extraPrice, { color: secondaryTextColor }]}>+{extrasPrices.fullInsurance} ₺</Text>
            </View>
            <Switch
              value={extras.fullInsurance}
              onValueChange={() => toggleExtra('fullInsurance')}
              trackColor={{ false: '#767577', true: '#4CAF5020' }}
              thumbColor={extras.fullInsurance ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Fiyat Özeti */}
        <View style={[styles.summaryCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Fiyat Özeti</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>Günlük Ücret</Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>{dailyPrice} ₺</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>Gün Sayısı</Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))} Gün
            </Text>
          </View>
          
          {Object.keys(extras).map(key => extras[key] && (
            <View key={key} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>
                {key === 'childSeat' ? 'Çocuk Koltuğu' :
                 key === 'gps' ? 'GPS' :
                 key === 'additionalDriver' ? 'Ek Sürücü' : 'Tam Sigorta'}
              </Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>+{extrasPrices[key]} ₺</Text>
            </View>
          ))}
          
          <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Toplam Tutar</Text>
            <Text style={styles.totalValue}>{totalPrice.toFixed(2)} ₺</Text>
          </View>
        </View>
        
        {/* Rezervasyon Butonu */}
        <TouchableOpacity
          style={[
            styles.reserveButton,
            submitting && styles.reserveButtonDisabled
          ]}
          onPress={handleCreateReservation}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="calendar-check" size={18} color="#FFFFFF" style={styles.reserveButtonIcon} />
              <Text style={styles.reserveButtonText}>Rezervasyon Yap</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.disclaimer, { color: secondaryTextColor }]}>
          * Rezervasyon onaylandıktan sonra ödeme yapmanız gerekecektir.
        </Text>
        
        {!isVerified && (
          <View style={[styles.warningCard, { backgroundColor: '#FFF3CD' }]}>
            <Icon name="exclamation-triangle" size={20} color="#856404" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              Rezervasyon yapabilmek için kimlik doğrulaması gereklidir.
            </Text>
          </View>
        )}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vehicleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleInfo: {
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  vehiclePrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  dateCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 14,
  },
  durationValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  extrasCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  extraInfo: {
    flex: 1,
  },
  extraTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  extraPrice: {
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
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
  reserveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reserveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  reserveButtonIcon: {
    marginRight: 8,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
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
});

export default CreateReservationScreen; 