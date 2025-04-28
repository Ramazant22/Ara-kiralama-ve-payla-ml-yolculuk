import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateTripScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userToken } = useContext(AuthContext);
  
  // Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(new Date());
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Validation State
  const [originError, setOriginError] = useState(null);
  const [destinationError, setDestinationError] = useState(null);
  const [seatsError, setSeatsError] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [vehicleError, setVehicleError] = useState(null);
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form durumu
  const [isLoading, setIsLoading] = useState(false);
  
  // Örnek araç listesi
  const [vehicles, setVehicles] = useState([
    { id: 1, brand: 'Toyota', model: 'Corolla', year: '2020', plate: '34ABC123' },
    { id: 2, brand: 'Honda', model: 'Civic', year: '2019', plate: '34DEF456' },
    { id: 3, brand: 'BMW', model: '320i', year: '2021', plate: '34GHI789' },
  ]);
  
  // Araç seçim modalı
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  
  // Tarih formatı
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Saat formatı
  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Tarih değiştirme
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };
  
  // Saat değiştirme
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDepartureTime(selectedTime);
    }
  };
  
  // Araç seçim işlevi
  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(false);
    setVehicleError(null);
  };
  
  // Form doğrulama fonksiyonu
  const validateForm = () => {
    let isValid = true;
    
    // Kalkış yeri doğrulama
    if (!origin.trim()) {
      setOriginError('Kalkış yerini giriniz');
      isValid = false;
    } else {
      setOriginError(null);
    }
    
    // Varış yeri doğrulama
    if (!destination.trim()) {
      setDestinationError('Varış yerini giriniz');
      isValid = false;
    } else {
      setDestinationError(null);
    }
    
    // Koltuk sayısı doğrulama
    if (!seats.trim()) {
      setSeatsError('Koltuk sayısını giriniz');
      isValid = false;
    } else if (isNaN(parseInt(seats)) || parseInt(seats) <= 0) {
      setSeatsError('Geçerli bir koltuk sayısı giriniz');
      isValid = false;
    } else {
      setSeatsError(null);
    }
    
    // Fiyat doğrulama
    if (!price.trim()) {
      setPriceError('Kişi başı fiyat giriniz');
      isValid = false;
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setPriceError('Geçerli bir fiyat giriniz');
      isValid = false;
    } else {
      setPriceError(null);
    }
    
    // Araç doğrulama
    if (!selectedVehicle) {
      setVehicleError('Lütfen bir araç seçin');
      isValid = false;
    } else {
      setVehicleError(null);
    }
    
    // Tarih doğrulama
    const now = new Date();
    const departureDateWithTime = new Date(departureDate);
    departureDateWithTime.setHours(departureTime.getHours(), departureTime.getMinutes());
    
    if (departureDateWithTime <= now) {
      Alert.alert('Hata', 'Kalkış zamanı şu andan sonra olmalıdır.');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Yolculuk oluşturma fonksiyonu
  const handleCreateTrip = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen formu doğru şekilde doldurun.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: API entegrasyonu burada yapılacak
      // Şimdilik simüle ediyoruz
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Başarılı',
          'Yolculuğunuz başarıyla oluşturuldu.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }, 1500);
    } catch (error) {
      console.error('Yolculuk oluşturma hatası:', error);
      setIsLoading(false);
      Alert.alert('Hata', 'Yolculuk oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#000000' }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={[styles.header, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme?.text?.primary || '#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
            Yolculuk Oluştur
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
              Güzergah Bilgileri
            </Text>
            
            <CustomInput
              label="Kalkış Yeri"
              placeholder="Örn: İstanbul, Kadıköy"
              value={origin}
              onChangeText={setOrigin}
              error={originError}
              icon="navigate"
            />
            
            <CustomInput
              label="Varış Yeri"
              placeholder="Örn: Ankara, Kızılay"
              value={destination}
              onChangeText={setDestination}
              error={destinationError}
              icon="location"
            />
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  Kalkış Tarihi
                </Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme?.surface || '#333333' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={theme?.text?.secondary || '#999999'} style={styles.inputIcon} />
                  <Text style={[styles.dateText, { color: theme?.text?.primary || '#FFFFFF' }]}>
                    {formatDate(departureDate)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme?.text?.secondary || '#999999'} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  Kalkış Saati
                </Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme?.surface || '#333333' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color={theme?.text?.secondary || '#999999'} style={styles.inputIcon} />
                  <Text style={[styles.dateText, { color: theme?.text?.primary || '#FFFFFF' }]}>
                    {formatTime(departureTime)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme?.text?.secondary || '#999999'} />
                </TouchableOpacity>
              </View>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={departureDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={departureTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
            
            <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF', marginTop: 20 }]}>
              Araç Bilgileri
            </Text>
            
            {vehicleError && (
              <Text style={styles.errorText}>{vehicleError}</Text>
            )}
            
            <TouchableOpacity
              style={[styles.vehicleSelector, { backgroundColor: theme?.surface || '#333333' }]}
              onPress={() => setShowVehicleModal(true)}
            >
              <Ionicons name="car" size={20} color={theme?.text?.secondary || '#999999'} style={styles.inputIcon} />
              
              {selectedVehicle ? (
                <View style={styles.selectedVehicleContainer}>
                  <Text style={[styles.selectedVehicleText, { color: theme?.text?.primary || '#FFFFFF' }]}>
                    {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                  </Text>
                  <Text style={[styles.selectedVehiclePlate, { color: theme?.text?.secondary || '#999999' }]}>
                    {selectedVehicle.plate}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.vehiclePlaceholder, { color: theme?.text?.secondary || '#999999' }]}>
                  Yolculuk için araç seçin
                </Text>
              )}
              
              <Ionicons name="chevron-down" size={16} color={theme?.text?.secondary || '#999999'} />
            </TouchableOpacity>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <CustomInput
                  label="Yolcu Kapasitesi"
                  placeholder="Örn: 3"
                  value={seats}
                  onChangeText={setSeats}
                  keyboardType="numeric"
                  error={seatsError}
                  icon="people"
                />
              </View>
              
              <View style={styles.halfInput}>
                <CustomInput
                  label="Kişi Başı Fiyat (₺)"
                  placeholder="Örn: 150"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  error={priceError}
                  icon="cash"
                />
              </View>
            </View>
            
            <CustomInput
              label="Açıklama (İsteğe Bağlı)"
              placeholder="Yolculuk hakkında ek bilgi verin"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              icon="create"
              style={styles.textArea}
            />
            
            <CustomButton
              title={isLoading ? "Yolculuk Oluşturuluyor..." : "Yolculuğu Oluştur"}
              onPress={handleCreateTrip}
              color={theme?.primary || '#FFFFFF'}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
        
        {/* Araç Seçim Modalı */}
        <Modal
          visible={showVehicleModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowVehicleModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme?.card || '#1A1A1A' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  Araç Seçin
                </Text>
                <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                  <Ionicons name="close" size={24} color={theme?.text?.primary || '#FFFFFF'} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.vehicleList}>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={[
                        styles.vehicleItem,
                        selectedVehicle?.id === vehicle.id && 
                        { backgroundColor: `${theme?.primary}20` || 'rgba(255, 255, 255, 0.1)' }
                      ]}
                      onPress={() => selectVehicle(vehicle)}
                    >
                      <View style={styles.vehicleIcon}>
                        <Ionicons name="car" size={24} color={theme?.primary || '#FFFFFF'} />
                      </View>
                      <View style={styles.vehicleDetails}>
                        <Text style={[styles.vehicleName, { color: theme?.text?.primary || '#FFFFFF' }]}>
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </Text>
                        <Text style={[styles.vehiclePlate, { color: theme?.text?.secondary || '#999999' }]}>
                          {vehicle.plate}
                        </Text>
                      </View>
                      {selectedVehicle?.id === vehicle.id && (
                        <Ionicons name="checkmark-circle" size={24} color={theme?.primary || '#FFFFFF'} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noVehiclesContainer}>
                    <Ionicons name="car-outline" size={48} color={theme?.text?.secondary || '#999999'} />
                    <Text style={[styles.noVehiclesText, { color: theme?.text?.secondary || '#999999' }]}>
                      Henüz araç eklemediniz.
                    </Text>
                    <TouchableOpacity 
                      style={[styles.addVehicleButton, { backgroundColor: theme?.primary || '#FFFFFF' }]}
                      onPress={() => {
                        setShowVehicleModal(false);
                        navigation.navigate('AddVehicle');
                      }}
                    >
                      <Text style={[styles.addVehicleText, { color: theme?.text?.inverse || '#000000' }]}>
                        Araç Ekle
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
              
              {vehicles.length > 0 && (
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.addNewVehicleButton, { borderColor: theme?.border || '#333333' }]}
                    onPress={() => {
                      setShowVehicleModal(false);
                      navigation.navigate('AddVehicle');
                    }}
                  >
                    <Ionicons name="add" size={20} color={theme?.primary || '#FFFFFF'} />
                    <Text style={[styles.addNewVehicleText, { color: theme?.primary || '#FFFFFF' }]}>
                      Yeni Araç Ekle
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  vehicleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  selectedVehicleContainer: {
    flex: 1,
  },
  selectedVehicleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedVehiclePlate: {
    fontSize: 12,
    marginTop: 2,
  },
  vehiclePlaceholder: {
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 30,
  },
  errorText: {
    color: '#FF4040',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleList: {
    padding: 16,
    maxHeight: 400,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
  },
  vehiclePlate: {
    fontSize: 12,
    marginTop: 4,
  },
  noVehiclesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noVehiclesText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addVehicleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addVehicleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addNewVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  addNewVehicleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreateTripScreen; 