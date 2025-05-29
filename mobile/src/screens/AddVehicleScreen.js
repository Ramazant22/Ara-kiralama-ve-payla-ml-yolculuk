import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
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
  IconButton
} from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { vehicleService } from '../services/vehicleService';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function AddVehicleScreen({ navigation }) {
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    fuelType: 'benzin',
    transmission: 'manuel',
    seats: '5',
    category: 'ekonomi',
    pricePerDay: '',
    pricePerHour: '',
    city: '',
    district: '',
    address: '',
  });

  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fuelTypes = [
    { key: 'benzin', label: 'Benzin' },
    { key: 'dizel', label: 'Dizel' },
    { key: 'elektrik', label: 'Elektrik' },
    { key: 'hibrit', label: 'Hibrit' },
    { key: 'lpg', label: 'LPG' }
  ];

  const transmissionTypes = [
    { key: 'manuel', label: 'Manuel' },
    { key: 'otomatik', label: 'Otomatik' }
  ];

  const categories = [
    { key: 'ekonomi', label: 'Ekonomi' },
    { key: 'kompakt', label: 'Kompakt' },
    { key: 'orta', label: 'Orta' },
    { key: 'büyük', label: 'Büyük' },
    { key: 'lüks', label: 'Lüks' },
    { key: 'suv', label: 'SUV' },
    { key: 'minivan', label: 'Minivan' }
  ];

  const availableFeatures = [
    'klima', 'gps', 'bluetooth', 'usb', 'wifi',
    'geri_vites_kamerasi', 'park_sensoru', 'sunroof',
    'deri_koltuk', 'elektrikli_cam', 'merkezi_kilit'
  ];

  const handleInputChange = (field, value) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFeature = (feature) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Galeri erişim hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken hata oluştu');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken hata oluştu');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Fotoğraf Ekle',
      'Nereden fotoğraf eklemek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: pickImageFromGallery },
        { text: 'Kamera', onPress: takePhoto }
      ]
    );
  };

  const validateForm = () => {
    const required = ['make', 'model', 'year', 'licensePlate', 'color', 'pricePerDay', 'city', 'district', 'address'];
    
    for (let field of required) {
      if (!vehicleData[field]) {
        Alert.alert('Hata', `${getFieldLabel(field)} alanı gereklidir`);
        return false;
      }
    }

    if (parseInt(vehicleData.year) < 1990 || parseInt(vehicleData.year) > new Date().getFullYear() + 1) {
      Alert.alert('Hata', 'Geçerli bir yıl giriniz');
      return false;
    }

    if (parseInt(vehicleData.pricePerDay) < 100) {
      Alert.alert('Hata', 'Günlük fiyat minimum 100 TL olmalıdır');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      make: 'Marka',
      model: 'Model',
      year: 'Yıl',
      licensePlate: 'Plaka',
      color: 'Renk',
      pricePerDay: 'Günlük Fiyat',
      city: 'İl',
      district: 'İlçe',
      address: 'Adres'
    };
    return labels[field] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      
      // Araç verilerini ekle
      formData.append('make', vehicleData.make);
      formData.append('model', vehicleData.model);
      formData.append('year', vehicleData.year);
      formData.append('licensePlate', vehicleData.licensePlate);
      formData.append('color', vehicleData.color);
      formData.append('fuelType', vehicleData.fuelType);
      formData.append('transmission', vehicleData.transmission);
      formData.append('seats', vehicleData.seats);
      formData.append('category', vehicleData.category);
      formData.append('pricePerDay', vehicleData.pricePerDay);
      
      if (vehicleData.pricePerHour) {
        formData.append('pricePerHour', vehicleData.pricePerHour);
      }
      
      // Konum bilgilerini ekle
      formData.append('city', vehicleData.city);
      formData.append('district', vehicleData.district);
      formData.append('address', vehicleData.address);
      
      // Özellikleri ekle
      features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });

      // Fotoğrafları ekle
      images.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('vehicleImages', {
          uri: image.uri,
          name: `vehicle_${Date.now()}_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });

      await vehicleService.createVehicle(formData);
      
      Alert.alert(
        'Başarılı', 
        'Aracınız başarıyla eklendi!',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.goBack() 
          }
        ]
      );

    } catch (error) {
      console.error('Araç eklenirken hata:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Araç eklenirken hata oluştu');
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
    subTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      color: colors.text.secondary,
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
    chipContainer: {
      marginBottom: spacing.md,
    },
    chip: {
      marginRight: spacing.sm,
      marginBottom: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.text.primary,
      fontSize: 12,
    },
    selectedChipText: {
      color: colors.onPrimary,
      fontSize: 12,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    featureChip: {
      marginBottom: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedFeatureChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    featureChipText: {
      color: colors.text.primary,
      fontSize: 11,
      textTransform: 'capitalize',
    },
    selectedFeatureChipText: {
      color: colors.onPrimary,
      fontSize: 11,
      textTransform: 'capitalize',
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
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    imageContainer: {
      position: 'relative',
      width: 100,
      height: 100,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    vehicleImage: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.sm,
    },
    removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageButton: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.text.disabled,
      borderStyle: 'dashed',
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surface,
    },
    addImageText: {
      marginTop: spacing.xs,
      color: colors.text.disabled,
      fontSize: 11,
      textAlign: 'center',
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
        <Title style={styles.headerTitle}>Araç Ekle</Title>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Temel Bilgiler */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Temel Bilgiler</Title>
            
            <TextInput
              label="Marka"
              value={vehicleData.make}
              onChangeText={(text) => handleInputChange('make', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Model"
              value={vehicleData.model}
              onChangeText={(text) => handleInputChange('model', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <View style={styles.row}>
              <TextInput
                label="Yıl"
                value={vehicleData.year}
                onChangeText={(text) => handleInputChange('year', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="numeric"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Koltuk Sayısı"
                value={vehicleData.seats}
                onChangeText={(text) => handleInputChange('seats', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="numeric"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <TextInput
              label="Plaka"
              value={vehicleData.licensePlate}
              onChangeText={(text) => handleInputChange('licensePlate', text.toUpperCase())}
              style={styles.input}
              mode="outlined"
              placeholder="34 ABC 123"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Renk"
              value={vehicleData.color}
              onChangeText={(text) => handleInputChange('color', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Araç Türü */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Araç Türü</Title>
            
            <Text style={styles.subTitle}>Yakıt Türü</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {fuelTypes.map((type) => (
                <Chip
                  key={type.key}
                  selected={vehicleData.fuelType === type.key}
                  onPress={() => handleInputChange('fuelType', type.key)}
                  style={[
                    styles.chip,
                    vehicleData.fuelType === type.key && styles.selectedChip
                  ]}
                  textStyle={vehicleData.fuelType === type.key ? styles.selectedChipText : styles.chipText}
                >
                  {type.label}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.subTitle}>Şanzıman</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {transmissionTypes.map((type) => (
                <Chip
                  key={type.key}
                  selected={vehicleData.transmission === type.key}
                  onPress={() => handleInputChange('transmission', type.key)}
                  style={[
                    styles.chip,
                    vehicleData.transmission === type.key && styles.selectedChip
                  ]}
                  textStyle={vehicleData.transmission === type.key ? styles.selectedChipText : styles.chipText}
                >
                  {type.label}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.subTitle}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {categories.map((cat) => (
                <Chip
                  key={cat.key}
                  selected={vehicleData.category === cat.key}
                  onPress={() => handleInputChange('category', cat.key)}
                  style={[
                    styles.chip,
                    vehicleData.category === cat.key && styles.selectedChip
                  ]}
                  textStyle={vehicleData.category === cat.key ? styles.selectedChipText : styles.chipText}
                >
                  {cat.label}
                </Chip>
              ))}
            </ScrollView>
          </Surface>

          {/* Fiyatlandırma */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Fiyatlandırma</Title>
            
            <TextInput
              label="Günlük Fiyat (₺)"
              value={vehicleData.pricePerDay}
              onChangeText={(text) => handleInputChange('pricePerDay', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            <TextInput
              label="Saatlik Fiyat (₺) - Opsiyonel"
              value={vehicleData.pricePerHour}
              onChangeText={(text) => handleInputChange('pricePerHour', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Konum */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Konum</Title>
            
            <View style={styles.row}>
              <TextInput
                label="İl"
                value={vehicleData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="İlçe"
                value={vehicleData.district}
                onChangeText={(text) => handleInputChange('district', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={colors.text.disabled}
                activeOutlineColor={colors.primary}
              />
            </View>

            <TextInput
              label="Adres"
              value={vehicleData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />
          </Surface>

          {/* Fotoğraflar */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Araç Fotoğrafları</Title>
            <Text style={styles.subTitle}>Aracınızın fotoğraflarını ekleyin (maksimum 10 adet)</Text>
            
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.vehicleImage}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <MaterialIcons name="close" size={16} color={colors.onError} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 10 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={showImagePickerOptions}
                >
                  <MaterialIcons name="add-a-photo" size={32} color={colors.text.disabled} />
                  <Text style={styles.addImageText}>Fotoğraf Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          </Surface>

          {/* Özellikler */}
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Özellikler</Title>
            <Text style={styles.subTitle}>Aracınızda bulunan özellikleri seçin</Text>
            
            <View style={styles.featuresGrid}>
              {availableFeatures.map((feature) => (
                <Chip
                  key={feature}
                  selected={features.includes(feature)}
                  onPress={() => toggleFeature(feature)}
                  style={[
                    styles.featureChip,
                    features.includes(feature) && styles.selectedFeatureChip
                  ]}
                  textStyle={features.includes(feature) ? styles.selectedFeatureChipText : styles.featureChipText}
                >
                  {feature.replace('_', ' ')}
                </Chip>
              ))}
            </View>
          </Surface>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

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
          {isLoading ? 'Ekleniyor...' : 'Aracı Ekle'}
        </Button>
      </View>
    </SafeAreaView>
  );
} 