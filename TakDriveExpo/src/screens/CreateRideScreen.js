import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const CreateRideScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [stops, setStops] = useState([{ location: '', time: '' }]);
  const [preferences, setPreferences] = useState({
    noSmoking: true,
    smallLuggage: false,
    music: false,
    pets: false,
    silence: false,
  });

  const addStop = () => {
    setStops([...stops, { location: '', time: '' }]);
  };

  const updateStop = (index, key, value) => {
    const newStops = [...stops];
    newStops[index][key] = value;
    setStops(newStops);
  };

  const removeStop = (index) => {
    if (stops.length > 1) {
      const newStops = [...stops];
      newStops.splice(index, 1);
      setStops(newStops);
    }
  };

  const togglePreference = (preference) => {
    setPreferences({
      ...preferences,
      [preference]: !preferences[preference]
    });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const handleTimeConfirm = (selectedTime) => {
    setTime(selectedTime);
    hideTimePicker();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!from) newErrors.from = 'Başlangıç konumu gerekli';
    if (!to) newErrors.to = 'Varış konumu gerekli';
    if (!date) newErrors.date = 'Tarih gerekli';
    if (!time) newErrors.time = 'Saat gerekli';
    if (!seats || parseInt(seats) < 1) newErrors.seats = 'Geçerli koltuk sayısı girin';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Geçerli fiyat girin';
    
    // Stop validation
    const invalidStops = stops.some(stop => !stop.location || !stop.time);
    if (invalidStops) newErrors.stops = 'Tüm duraklar için konum ve saat girin';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRide = () => {
    if (validate()) {
      setLoading(true);
      
      // Ride object to be sent to API
      const ride = {
        driverId: user.id,
        from,
        to,
        date: date.toISOString(),
        time: time.toISOString(),
        availableSeats: parseInt(seats),
        price: parseFloat(price),
        description,
        stops: stops.filter(stop => stop.location && stop.time),
        preferences: Object.keys(preferences).filter(key => preferences[key]),
      };
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          "Yolculuk Oluşturuldu",
          "Yolculuğunuz başarıyla oluşturuldu. Yolcular rezervasyon yaptıkça bilgilendirileceksiniz.",
          [{ text: "Tamam", onPress: () => navigation.navigate('Home') }]
        );
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textColor }]}>Yolculuk Oluştur</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondaryColor }]}>
            Yolculuk detaylarını girerek boş koltuklarınızı değerlendirin
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Rota Bilgileri</Text>
            
            <View style={styles.inputContainer}>
              <Icon name="map-marker-alt" size={18} color="#888888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, 
                  { borderColor: errors.from ? '#FF5A5F' : theme.borderColor, 
                    color: theme.textColor }]}
                placeholder="Nereden (şehir, lokasyon)"
                placeholderTextColor="#888888"
                value={from}
                onChangeText={setFrom}
              />
              {errors.from && <Text style={styles.errorText}>{errors.from}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Icon name="map-marker-alt" size={18} color="#888888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, 
                  { borderColor: errors.to ? '#FF5A5F' : theme.borderColor, 
                    color: theme.textColor }]}
                placeholder="Nereye (şehir, lokasyon)"
                placeholderTextColor="#888888"
                value={to}
                onChangeText={setTo}
              />
              {errors.to && <Text style={styles.errorText}>{errors.to}</Text>}
            </View>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={[styles.dateTimePicker, 
                  { borderColor: errors.date ? '#FF5A5F' : theme.borderColor }]} 
                onPress={showDatePicker}
              >
                <Icon name="calendar-alt" size={18} color="#888888" />
                <Text style={[styles.dateTimeText, { color: theme.textColor }]}>
                  {date ? formatDate(date) : "Tarih Seçin"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dateTimePicker, 
                  { borderColor: errors.time ? '#FF5A5F' : theme.borderColor }]} 
                onPress={showTimePicker}
              >
                <Icon name="clock" size={18} color="#888888" />
                <Text style={[styles.dateTimeText, { color: theme.textColor }]}>
                  {time ? formatTime(time) : "Saat Seçin"}
                </Text>
              </TouchableOpacity>
            </View>
            {(errors.date || errors.time) && (
              <Text style={styles.errorText}>{errors.date || errors.time}</Text>
            )}
            
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              minimumDate={new Date()}
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
            />
            
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleTimeConfirm}
              onCancel={hideTimePicker}
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Duraklar</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondaryColor }]}>
              Yolculuk sırasında duracağınız noktaları ekleyin (opsiyonel)
            </Text>
            
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopContainer}>
                <View style={styles.stopInputs}>
                  <TextInput
                    style={[styles.stopInput, 
                      { borderColor: theme.borderColor, color: theme.textColor }]}
                    placeholder="Durak (şehir, lokasyon)"
                    placeholderTextColor="#888888"
                    value={stop.location}
                    onChangeText={(text) => updateStop(index, 'location', text)}
                  />
                  <TextInput
                    style={[styles.stopInput, 
                      { borderColor: theme.borderColor, color: theme.textColor, marginLeft: 10 }]}
                    placeholder="Tahmini Saat"
                    placeholderTextColor="#888888"
                    value={stop.time}
                    onChangeText={(text) => updateStop(index, 'time', text)}
                  />
                </View>
                {stops.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeStopButton} 
                    onPress={() => removeStop(index)}
                  >
                    <Icon name="trash-alt" size={16} color="#FF5A5F" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            {errors.stops && <Text style={styles.errorText}>{errors.stops}</Text>}
            
            <TouchableOpacity style={styles.addStopButton} onPress={addStop}>
              <Icon name="plus-circle" size={16} color="#4A90E2" />
              <Text style={styles.addStopText}>Durak Ekle</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Yolculuk Detayları</Text>
            
            <View style={styles.detailsRow}>
              <View style={[styles.detailInput, { marginRight: 10 }]}>
                <Text style={[styles.detailLabel, { color: theme.textSecondaryColor }]}>
                  Boş Koltuk
                </Text>
                <TextInput
                  style={[styles.numberInput, 
                    { borderColor: errors.seats ? '#FF5A5F' : theme.borderColor, 
                      color: theme.textColor }]}
                  placeholder="3"
                  placeholderTextColor="#888888"
                  keyboardType="number-pad"
                  value={seats}
                  onChangeText={setSeats}
                />
                {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}
              </View>
              
              <View style={styles.detailInput}>
                <Text style={[styles.detailLabel, { color: theme.textSecondaryColor }]}>
                  Kişi Başı Ücret (₺)
                </Text>
                <TextInput
                  style={[styles.numberInput, 
                    { borderColor: errors.price ? '#FF5A5F' : theme.borderColor, 
                      color: theme.textColor }]}
                  placeholder="150"
                  placeholderTextColor="#888888"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textArea, 
                  { borderColor: theme.borderColor, color: theme.textColor }]}
                placeholder="Yolculuk hakkında ek bilgiler (opsiyonel)"
                placeholderTextColor="#888888"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Tercihler</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondaryColor }]}>
              Yolculuk sırasındaki tercihlerinizi belirtin
            </Text>
            
            <View style={styles.preferencesContainer}>
              <TouchableOpacity 
                style={[styles.preferenceItem, preferences.noSmoking && styles.preferenceSelected]} 
                onPress={() => togglePreference('noSmoking')}
              >
                <Icon 
                  name="smoking-ban" 
                  size={18} 
                  color={preferences.noSmoking ? "#FFFFFF" : "#888888"} 
                />
                <Text style={[styles.preferenceText, 
                  { color: preferences.noSmoking ? "#FFFFFF" : theme.textColor }]}>
                  Sigara İçilmez
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.preferenceItem, preferences.smallLuggage && styles.preferenceSelected]} 
                onPress={() => togglePreference('smallLuggage')}
              >
                <Icon 
                  name="luggage-cart" 
                  size={18} 
                  color={preferences.smallLuggage ? "#FFFFFF" : "#888888"} 
                />
                <Text style={[styles.preferenceText, 
                  { color: preferences.smallLuggage ? "#FFFFFF" : theme.textColor }]}>
                  Küçük Bagaj
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.preferenceItem, preferences.music && styles.preferenceSelected]} 
                onPress={() => togglePreference('music')}
              >
                <Icon 
                  name="music" 
                  size={18} 
                  color={preferences.music ? "#FFFFFF" : "#888888"} 
                />
                <Text style={[styles.preferenceText, 
                  { color: preferences.music ? "#FFFFFF" : theme.textColor }]}>
                  Müzik Açık
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.preferenceItem, preferences.pets && styles.preferenceSelected]} 
                onPress={() => togglePreference('pets')}
              >
                <Icon 
                  name="paw" 
                  size={18} 
                  color={preferences.pets ? "#FFFFFF" : "#888888"} 
                />
                <Text style={[styles.preferenceText, 
                  { color: preferences.pets ? "#FFFFFF" : theme.textColor }]}>
                  Evcil Hayvan
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.preferenceItem, preferences.silence && styles.preferenceSelected]} 
                onPress={() => togglePreference('silence')}
              >
                <Icon 
                  name="volume-mute" 
                  size={18} 
                  color={preferences.silence ? "#FFFFFF" : "#888888"} 
                />
                <Text style={[styles.preferenceText, 
                  { color: preferences.silence ? "#FFFFFF" : theme.textColor }]}>
                  Sessiz Yolculuk
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.createButton, { opacity: loading ? 0.7 : 1 }]} 
            onPress={handleCreateRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Yolculuk Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#333333',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimePicker: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  stopInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  removeStopButton: {
    padding: 10,
    marginLeft: 8,
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addStopText: {
    color: '#4A90E2',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailInput: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    minHeight: 100,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  preferenceSelected: {
    backgroundColor: '#4A90E2',
  },
  preferenceText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CreateRideScreen; 