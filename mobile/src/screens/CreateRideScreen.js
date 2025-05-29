import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput,
  Title,
  ActivityIndicator,
  Chip,
  Surface,
  IconButton,
  RadioButton,
  Switch
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { rideService } from '../services/rideService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

const turkishCities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
  'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
  'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export default function CreateRideScreen({ navigation }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [rideData, setRideData] = useState({
    // Rota
    fromCity: '',
    fromDistrict: '',
    fromAddress: '',
    toCity: '',
    toDistrict: '',
    toAddress: '',
    
    // Tarih ve saat
    departureDate: new Date(),
    departureTime: '09:00',
    
    // Kapasite ve fiyat
    availableSeats: 3,
    pricePerSeat: '',
    
    // Araç bilgileri
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear().toString(),
    vehicleColor: '',
    licensePlate: '',
    
    // Tercihler
    smokingAllowed: false,
    petsAllowed: false,
    musicAllowed: true,
    conversationLevel: 'moderate',
    
    // Açıklama
    description: '',
    notes: ''
  });

  const conversationLevels = [
    { value: 'quiet', label: 'Sessiz', description: 'Sessiz yolculuk' },
    { value: 'moderate', label: 'Orta', description: 'Ara sıra sohbet' },
    { value: 'chatty', label: 'Sohbet', description: 'Bol sohbet' }
  ];

  const handleInputChange = (field, value) => {
    setRideData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validateForm = () => {
    const required = ['fromCity', 'toCity', 'pricePerSeat', 'vehicleMake', 'vehicleModel', 'licensePlate'];
    
    for (let field of required) {
      if (!rideData[field]) {
        Alert.alert('Hata', `${getFieldLabel(field)} alanı gereklidir`);
        return false;
      }
    }

    if (rideData.fromCity === rideData.toCity) {
      Alert.alert('Hata', 'Başlangıç ve varış şehri aynı olamaz');
      return false;
    }

    if (parseInt(rideData.pricePerSeat) < 0) {
      Alert.alert('Hata', 'Fiyat negatif olamaz');
      return false;
    }

    if (rideData.departureDate <= new Date()) {
      Alert.alert('Hata', 'Kalkış tarihi gelecekte olmalıdır');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      fromCity: 'Başlangıç Şehri',
      toCity: 'Varış Şehri',
      pricePerSeat: 'Koltuk Başına Fiyat',
      vehicleMake: 'Araç Markası',
      vehicleModel: 'Araç Modeli',
      licensePlate: 'Plaka'
    };
    return labels[field] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const submitData = {
        from: {
          city: rideData.fromCity,
          district: rideData.fromDistrict || undefined,
          address: rideData.fromAddress || undefined
        },
        to: {
          city: rideData.toCity,
          district: rideData.toDistrict || undefined,
          address: rideData.toAddress || undefined
        },
        departureDate: rideData.departureDate.toISOString().split('T')[0],
        departureTime: rideData.departureTime,
        availableSeats: parseInt(rideData.availableSeats),
        pricePerSeat: parseFloat(rideData.pricePerSeat),
        vehicle: {
          make: rideData.vehicleMake,
          model: rideData.vehicleModel,
          year: parseInt(rideData.vehicleYear),
          color: rideData.vehicleColor || undefined,
          licensePlate: rideData.licensePlate
        },
        preferences: {
          smokingAllowed: rideData.smokingAllowed,
          petsAllowed: rideData.petsAllowed,
          musicAllowed: rideData.musicAllowed,
          conversationLevel: rideData.conversationLevel
        },
        description: rideData.description || undefined,
        notes: rideData.notes || undefined
      };

      await rideService.createRide(submitData);
      
      Alert.alert(
        'Başarılı', 
        'Yolculuğunuz başarıyla oluşturuldu!',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Rides')
          }
        ]
      );

    } catch (error) {
      console.error('Yolculuk oluşturulurken hata:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Yolculuk oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    section: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: spacing.md,
      color: colors.text.primary,
    },
    input: {
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    halfInput: {
      flex: 1,
    },
    dateTimeButton: {
      marginBottom: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.text.disabled,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surface,
    },
    dateTimeLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    dateTimeValue: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    seatsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    seatsButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.xs,
    },
    seatsButtonSelected: {
      backgroundColor: colors.primary,
    },
    seatsButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    seatsButtonTextSelected: {
      color: colors.onPrimary,
      fontWeight: 'bold',
    },
    preferencesContainer: {
      gap: spacing.md,
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    preferenceLabel: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    conversationContainer: {
      gap: spacing.sm,
    },
    conversationOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    conversationText: {
      marginLeft: spacing.sm,
      flex: 1,
    },
    conversationLabel: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    conversationDesc: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    submitContainer: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    submitButton: {
      borderRadius: borderRadius.md,
    },
    submitButtonContent: {
      height: 48,
    },
    bottomSpace: {
      height: spacing.lg,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>Yolculuk Oluştur</Title>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Rota Bilgileri */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Rota Bilgileri</Title>
            
            <View style={styles.row}>
              <TextInput
                label="Başlangıç Şehri"
                value={rideData.fromCity}
                onChangeText={(text) => handleInputChange('fromCity', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Varış Şehri"
                value={rideData.toCity}
                onChangeText={(text) => handleInputChange('toCity', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Başlangıç İlçe (İsteğe bağlı)"
                value={rideData.fromDistrict}
                onChangeText={(text) => handleInputChange('fromDistrict', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Varış İlçe (İsteğe bağlı)"
                value={rideData.toDistrict}
                onChangeText={(text) => handleInputChange('toDistrict', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <TextInput
              label="Başlangıç Adresi (İsteğe bağlı)"
              value={rideData.fromAddress}
              onChangeText={(text) => handleInputChange('fromAddress', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Varış Adresi (İsteğe bağlı)"
              value={rideData.toAddress}
              onChangeText={(text) => handleInputChange('toAddress', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Tarih ve Saat */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Tarih ve Saat</Title>
            
            <Surface style={styles.dateTimeButton} onTouchEnd={() => setShowDatePicker(true)}>
              <Text style={styles.dateTimeLabel}>Kalkış Tarihi</Text>
              <Text style={styles.dateTimeValue}>{formatDate(rideData.departureDate)}</Text>
            </Surface>

            <TextInput
              label="Kalkış Saati (HH:MM)"
              value={rideData.departureTime}
              onChangeText={(text) => handleInputChange('departureTime', text)}
              style={styles.input}
              mode="outlined"
              placeholder="09:00"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Kapasite ve Fiyat */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Kapasite ve Fiyat</Title>
            
            <Text style={styles.dateTimeLabel}>Müsait Koltuk Sayısı</Text>
            <View style={styles.seatsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Surface
                  key={num}
                  style={[
                    styles.seatsButton,
                    rideData.availableSeats === num && styles.seatsButtonSelected
                  ]}
                  onTouchEnd={() => handleInputChange('availableSeats', num)}
                >
                  <Text style={[
                    styles.seatsButtonText,
                    rideData.availableSeats === num && styles.seatsButtonTextSelected
                  ]}>
                    {num}
                  </Text>
                </Surface>
              ))}
            </View>

            <TextInput
              label="Koltuk Başına Fiyat (₺)"
              value={rideData.pricePerSeat}
              onChangeText={(text) => handleInputChange('pricePerSeat', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Araç Bilgileri */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Araç Bilgileri</Title>
            
            <View style={styles.row}>
              <TextInput
                label="Marka"
                value={rideData.vehicleMake}
                onChangeText={(text) => handleInputChange('vehicleMake', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Model"
                value={rideData.vehicleModel}
                onChangeText={(text) => handleInputChange('vehicleModel', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Yıl"
                value={rideData.vehicleYear}
                onChangeText={(text) => handleInputChange('vehicleYear', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="numeric"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Renk (İsteğe bağlı)"
                value={rideData.vehicleColor}
                onChangeText={(text) => handleInputChange('vehicleColor', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <TextInput
              label="Plaka"
              value={rideData.licensePlate}
              onChangeText={(text) => handleInputChange('licensePlate', text.toUpperCase())}
              style={styles.input}
              mode="outlined"
              placeholder="34 ABC 123"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Tercihler */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Yolculuk Tercihleri</Title>
            
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Sigara İçilebilir</Text>
                <Switch
                  value={rideData.smokingAllowed}
                  onValueChange={(value) => handleInputChange('smokingAllowed', value)}
                  color={colors.primary}
                />
              </View>

              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Evcil Hayvan Kabul</Text>
                <Switch
                  value={rideData.petsAllowed}
                  onValueChange={(value) => handleInputChange('petsAllowed', value)}
                  color={colors.primary}
                />
              </View>

              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Müzik Dinlenebilir</Text>
                <Switch
                  value={rideData.musicAllowed}
                  onValueChange={(value) => handleInputChange('musicAllowed', value)}
                  color={colors.primary}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
              Sohbet Seviyesi
            </Text>
            <View style={styles.conversationContainer}>
              {conversationLevels.map((level) => (
                <Surface key={level.value} style={styles.conversationOption} onTouchEnd={() => handleInputChange('conversationLevel', level.value)}>
                  <RadioButton
                    value={level.value}
                    status={rideData.conversationLevel === level.value ? 'checked' : 'unchecked'}
                    color={colors.primary}
                  />
                  <View style={styles.conversationText}>
                    <Text style={styles.conversationLabel}>{level.label}</Text>
                    <Text style={styles.conversationDesc}>{level.description}</Text>
                  </View>
                </Surface>
              ))}
            </View>
          </Surface>

          {/* Açıklama */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Ek Bilgiler</Title>
            
            <TextInput
              label="Açıklama (İsteğe bağlı)"
              value={rideData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Yolculuk hakkında bilgi verebilirsiniz..."
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Notlar (İsteğe bağlı)"
              value={rideData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder="Özel istekler, toplanma noktası vb..."
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={rideData.departureDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              handleInputChange('departureDate', selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          buttonColor={colors.primary}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? 'Oluşturuluyor...' : 'Yolculuk Oluştur'}
        </Button>
      </View>
    </SafeAreaView>
  );
} 