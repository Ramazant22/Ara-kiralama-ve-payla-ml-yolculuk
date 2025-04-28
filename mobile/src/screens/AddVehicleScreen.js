import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';

const AddVehicleScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const editingVehicle = route.params?.vehicle;

  // Form state
  const [formData, setFormData] = useState({
    brand: editingVehicle?.brand || '',
    model: editingVehicle?.model || '',
    year: editingVehicle?.year || '',
    plate: editingVehicle?.plate || '',
    color: editingVehicle?.color || '',
    seats: editingVehicle?.seats || '',
    pricePerDay: editingVehicle?.price || '',
    description: editingVehicle?.description || '',
    location: editingVehicle?.location || '',
    fuelType: editingVehicle?.fuelType || '',
    transmission: editingVehicle?.transmission || '',
    images: editingVehicle?.image ? [editingVehicle.image] : []
  });

  // Error state
  const [errors, setErrors] = useState({});

  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const pickImage = async () => {
    if (formData.images.length >= 5) {
      Alert.alert('Uyarı', 'En fazla 5 fotoğraf ekleyebilirsiniz.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Galeri erişim izni gerekiyor!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        updateFormField('images', [...formData.images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateFormField('images', newImages);
  };

  const validateForm = () => {
    const newErrors = {};

    // Zorunlu alanları kontrol et
    if (!formData.brand.trim()) newErrors.brand = 'Marka giriniz';
    if (!formData.model.trim()) newErrors.model = 'Model giriniz';
    if (!formData.year.trim()) newErrors.year = 'Yıl giriniz';
    if (!formData.plate.trim()) newErrors.plate = 'Plaka giriniz';
    if (!formData.pricePerDay.trim()) newErrors.pricePerDay = 'Fiyat giriniz';
    if (formData.images.length === 0) newErrors.images = 'En az bir fotoğraf ekleyin';

    // Yıl kontrolü
    const yearNum = parseInt(formData.year);
    if (formData.year && (isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear())) {
      newErrors.year = 'Geçerli bir yıl giriniz';
    }

    // Fiyat kontrolü
    const price = parseFloat(formData.pricePerDay);
    if (formData.pricePerDay && (isNaN(price) || price <= 0)) {
      newErrors.pricePerDay = 'Geçerli bir fiyat giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Başarılı',
        'Aracınız başarıyla eklendi. Onaylandıktan sonra listelenecek.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Araç eklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme?.text?.primary || '#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
            {editingVehicle ? 'Aracı Düzenle' : 'Araç Ekle'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Araç Bilgileri */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
                Araç Bilgileri
              </Text>

              <CustomInput
                label="Marka"
                value={formData.brand}
                onChangeText={(text) => updateFormField('brand', text)}
                placeholder="Örn: Toyota"
                error={errors.brand}
                icon="car"
              />

              <CustomInput
                label="Model"
                value={formData.model}
                onChangeText={(text) => updateFormField('model', text)}
                placeholder="Örn: Corolla"
                error={errors.model}
                icon="information-circle"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="Yıl"
                    value={formData.year}
                    onChangeText={(text) => updateFormField('year', text)}
                    placeholder="Örn: 2020"
                    keyboardType="numeric"
                    error={errors.year}
                    icon="calendar"
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="Plaka"
                    value={formData.plate}
                    onChangeText={(text) => updateFormField('plate', text)}
                    placeholder="Örn: 34ABC123"
                    error={errors.plate}
                    icon="document-text"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="Renk"
                    value={formData.color}
                    onChangeText={(text) => updateFormField('color', text)}
                    placeholder="Örn: Beyaz"
                    icon="color-palette"
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="Koltuk"
                    value={formData.seats}
                    onChangeText={(text) => updateFormField('seats', text)}
                    placeholder="Örn: 5"
                    keyboardType="numeric"
                    icon="people"
                  />
                </View>
              </View>

              <CustomInput
                label="Günlük Fiyat (₺)"
                value={formData.pricePerDay}
                onChangeText={(text) => updateFormField('pricePerDay', text)}
                placeholder="Örn: 500"
                keyboardType="numeric"
                error={errors.pricePerDay}
                icon="cash"
              />

              <CustomInput
                label="Konum"
                value={formData.location}
                onChangeText={(text) => updateFormField('location', text)}
                placeholder="Örn: İstanbul, Kadıköy"
                icon="location"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="Yakıt Tipi"
                    value={formData.fuelType}
                    onChangeText={(text) => updateFormField('fuelType', text)}
                    placeholder="Örn: Dizel"
                    icon="flash"
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="Vites"
                    value={formData.transmission}
                    onChangeText={(text) => updateFormField('transmission', text)}
                    placeholder="Örn: Otomatik"
                    icon="git-network"
                  />
                </View>
              </View>

              <CustomInput
                label="Açıklama"
                value={formData.description}
                onChangeText={(text) => updateFormField('description', text)}
                placeholder="Aracınız hakkında bilgi verin..."
                multiline
                numberOfLines={4}
                icon="create"
                style={styles.textArea}
              />
            </View>

            {/* Fotoğraflar */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
                Araç Fotoğrafları
              </Text>
              
              {errors.images && (
                <Text style={styles.errorText}>{errors.images}</Text>
              )}

              <View style={styles.imageGrid}>
                {formData.images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={theme?.danger || '#FF4040'} />
                    </TouchableOpacity>
                  </View>
                ))}

                {formData.images.length < 5 && (
                  <TouchableOpacity
                    style={[styles.addImageButton, { borderColor: theme?.border || '#333333' }]}
                    onPress={pickImage}
                  >
                    <Ionicons name="add" size={40} color={theme?.text?.secondary || '#999999'} />
                    <Text style={[styles.addImageText, { color: theme?.text?.secondary || '#999999' }]}>
                      Fotoğraf Ekle
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <CustomButton
              title={isLoading ? "Kaydediliyor..." : (editingVehicle ? "Değişiklikleri Kaydet" : "Aracı Ekle")}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
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
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    margin: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#FF4040',
    fontSize: 12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default AddVehicleScreen; 