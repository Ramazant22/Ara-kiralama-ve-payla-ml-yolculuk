import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from './_layout';

export default function CreateRideScreen() {
  const router = useRouter();
  
  // Form state
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('3');
  const [description, setDescription] = useState('');
  const [carId, setCarId] = useState('1'); // In a real app, this would be selected from user's cars
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    noSmoking: true,
    noPets: false,
    music: true
  });
  
  // Date & Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  // Add a new stop
  const addStop = () => {
    if (newStop.trim() !== '') {
      setStops([...stops, newStop.trim()]);
      setNewStop('');
    }
  };

  // Remove a stop
  const removeStop = (index: number) => {
    const updatedStops = [...stops];
    updatedStops.splice(index, 1);
    setStops(updatedStops);
  };

  // Toggle preference
  const togglePreference = (key: 'noSmoking' | 'noPets' | 'music') => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  // Submit form
  const handleSubmit = () => {
    // Validation
    if (!startLocation) {
      Alert.alert('Hata', 'Lütfen kalkış noktasını girin');
      return;
    }
    if (!endLocation) {
      Alert.alert('Hata', 'Lütfen varış noktasını girin');
      return;
    }
    if (!price) {
      Alert.alert('Hata', 'Lütfen fiyat girin');
      return;
    }
    
    // Success - in a real app, this would send data to the server
    Alert.alert(
      'Başarılı',
      'Yolculuk başarıyla oluşturuldu!',
      [
        { 
          text: 'Tamam', 
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Yolculuk Oluştur',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Route Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Güzergah</Text>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kalkış Noktası"
                placeholderTextColor="#AAAAAA"
                value={startLocation}
                onChangeText={setStartLocation}
              />
            </View>
            
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopContainer}>
                <View style={styles.stopDot} />
                <Text style={styles.stopText}>{stop}</Text>
                <TouchableOpacity 
                  style={styles.removeStopButton}
                  onPress={() => removeStop(index)}
                >
                  <FontAwesome5 name="times" size={14} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.addStopContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.stopDot} />
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="Durak Ekle"
                  placeholderTextColor="#AAAAAA"
                  value={newStop}
                  onChangeText={setNewStop}
                />
              </View>
              <TouchableOpacity 
                style={styles.addStopButton} 
                onPress={addStop}
              >
                <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="flag-checkered" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Varış Noktası"
                placeholderTextColor="#AAAAAA"
                value={endLocation}
                onChangeText={setEndLocation}
              />
            </View>
          </View>
          
          {/* Date & Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarih ve Saat</Text>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Tarih</Text>
                  <Text style={styles.dateTimeValue}>
                    {date.toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <FontAwesome5 name="clock" size={16} color={colors.primary} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Saat</Text>
                  <Text style={styles.dateTimeValue}>
                    {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Ride Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yolculuk Detayları</Text>
            
            <View style={styles.detailsRow}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <FontAwesome5 name="money-bill-wave" size={16} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Kişi Başı Fiyat (TL)"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfInput]}>
                <FontAwesome5 name="chair" size={16} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Koltuk Sayısı"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                  value={seats}
                  onChangeText={setSeats}
                />
              </View>
            </View>
            
            {/* Araç seçimi bölümü */}
            <Text style={styles.fieldLabel}>Araç Seçimi</Text>
            <View style={styles.carSelectionContainer}>
              {/* Araçlar - normalde API'den alınacak */}
              <TouchableOpacity 
                style={[styles.carCard, carId === '1' && styles.carCardSelected]}
                onPress={() => setCarId('1')}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&fm=jpg' }} 
                  style={styles.carImage}
                />
                <View style={styles.carDetails}>
                  <Text style={styles.carName}>Honda Civic</Text>
                  <Text style={styles.carInfo}>2020 • Otomatik • Benzin</Text>
                  <View style={styles.carPlate}>
                    <Text style={styles.carPlateText}>34 ABC 123</Text>
                  </View>
                </View>
                {carId === '1' && (
                  <View style={styles.carSelectedIndicator}>
                    <FontAwesome5 name="check-circle" size={20} color={colors.primary} solid />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.carCard, carId === '2' && styles.carCardSelected]}
                onPress={() => setCarId('2')}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&fm=jpg' }} 
                  style={styles.carImage}
                />
                <View style={styles.carDetails}>
                  <Text style={styles.carName}>Toyota Corolla</Text>
                  <Text style={styles.carInfo}>2021 • Manuel • Dizel</Text>
                  <View style={styles.carPlate}>
                    <Text style={styles.carPlateText}>34 XYZ 456</Text>
                  </View>
                </View>
                {carId === '2' && (
                  <View style={styles.carSelectedIndicator}>
                    <FontAwesome5 name="check-circle" size={20} color={colors.primary} solid />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yolculuk Tercihleri</Text>
            
            <View style={styles.preferencesContainer}>
              <TouchableOpacity 
                style={[
                  styles.preferenceButton, 
                  preferences.noSmoking && styles.preferenceActive
                ]}
                onPress={() => togglePreference('noSmoking')}
              >
                <FontAwesome5 
                  name="smoking-ban" 
                  size={16} 
                  color={preferences.noSmoking ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
                />
                <Text style={[
                  styles.preferenceText,
                  preferences.noSmoking && styles.preferenceTextActive
                ]}>Sigara İçilmez</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.preferenceButton, 
                  preferences.noPets && styles.preferenceActive
                ]}
                onPress={() => togglePreference('noPets')}
              >
                <FontAwesome5 
                  name="paw" 
                  size={16} 
                  color={preferences.noPets ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
                />
                <Text style={[
                  styles.preferenceText,
                  preferences.noPets && styles.preferenceTextActive
                ]}>Evcil Hayvan Yok</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.preferenceButton, 
                  preferences.music && styles.preferenceActive
                ]}
                onPress={() => togglePreference('music')}
              >
                <FontAwesome5 
                  name="music" 
                  size={16} 
                  color={preferences.music ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
                />
                <Text style={[
                  styles.preferenceText,
                  preferences.music && styles.preferenceTextActive
                ]}>Müzik Dinlenir</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Yolculuk hakkında detaylar yazın..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <FontAwesome5 name="check" size={16} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Yolculuk Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  stopText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  removeStopButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addStopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '48%',
  },
  dateTimeTextContainer: {
    marginLeft: 8,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  dateTimeValue: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  preferenceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  preferenceText: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  preferenceTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textAreaContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 8,
  },
  textArea: {
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    marginBottom: 8,
  },
  carSelectionContainer: {
    marginBottom: 16,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  carCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,69,0,0.1)',
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  carDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  carName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  carInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
  },
  carPlate: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  carPlateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  carSelectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
}); 