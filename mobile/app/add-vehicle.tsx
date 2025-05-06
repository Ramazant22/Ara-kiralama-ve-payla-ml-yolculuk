import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from './_layout';

export default function AddVehiclePage() {
  const router = useRouter();
  
  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Vehicle features
  const [features, setFeatures] = useState({
    airConditioner: false,
    automatic: false,
    bluetooth: false,
    parkSensor: false,
    cruiseControl: false,
    babyChair: false
  });
  
  // Image Selection
  const pickImage = async () => {
    // Cihaz için izin alma
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni vermeniz gerekmektedir.');
      return;
    }
    
    // Görsel seçme
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Toggle a feature
  const toggleFeature = (key: keyof typeof features) => {
    setFeatures({
      ...features,
      [key]: !features[key]
    });
  };
  
  // Submit the form
  const handleSubmit = () => {
    // Basic validation
    if (!brand) {
      Alert.alert('Hata', 'Lütfen marka bilgisi girin');
      return;
    }
    if (!model) {
      Alert.alert('Hata', 'Lütfen model bilgisi girin');
      return;
    }
    if (!year) {
      Alert.alert('Hata', 'Lütfen yıl bilgisi girin');
      return;
    }
    if (!licensePlate) {
      Alert.alert('Hata', 'Lütfen plaka bilgisi girin');
      return;
    }
    if (!pricePerDay) {
      Alert.alert('Hata', 'Lütfen günlük kiralama ücreti girin');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir adet araç görseli ekleyin');
      return;
    }
    
    // Gerçek uygulamada burada API çağrısı yapılır
    Alert.alert(
      'Başarılı',
      'Aracınız başarıyla eklendi! Onay sürecinden sonra listelenecektir.',
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
            title: 'Araç Ekle',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Araç Bilgileri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Araç Bilgileri</Text>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="car" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Marka"
                placeholderTextColor="#AAAAAA"
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="car-side" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Model"
                placeholderTextColor="#AAAAAA"
                value={model}
                onChangeText={setModel}
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <FontAwesome5 name="calendar-alt" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Yıl"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="number-pad"
                  value={year}
                  onChangeText={setYear}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <FontAwesome5 name="id-card" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Plaka"
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="characters"
                  value={licensePlate}
                  onChangeText={setLicensePlate}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="money-bill-wave" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Günlük Kiralama Ücreti (₺)"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                value={pricePerDay}
                onChangeText={setPricePerDay}
              />
            </View>
            
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder="Araç Açıklaması"
                placeholderTextColor="#AAAAAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
          
          {/* Araç Özellikleri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Araç Özellikleri</Text>
            
            <View style={styles.featuresContainer}>
              <TouchableOpacity 
                style={[styles.featureItem, features.airConditioner && styles.featureItemActive]} 
                onPress={() => toggleFeature('airConditioner')}
              >
                <FontAwesome5 
                  name="snowflake" 
                  size={18} 
                  color={features.airConditioner ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.airConditioner && styles.featureTextActive]}>
                  Klima
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureItem, features.automatic && styles.featureItemActive]} 
                onPress={() => toggleFeature('automatic')}
              >
                <FontAwesome5 
                  name="cogs" 
                  size={18} 
                  color={features.automatic ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.automatic && styles.featureTextActive]}>
                  Otomatik
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureItem, features.bluetooth && styles.featureItemActive]} 
                onPress={() => toggleFeature('bluetooth')}
              >
                <FontAwesome5 
                  name="bluetooth" 
                  size={18} 
                  color={features.bluetooth ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.bluetooth && styles.featureTextActive]}>
                  Bluetooth
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureItem, features.parkSensor && styles.featureItemActive]} 
                onPress={() => toggleFeature('parkSensor')}
              >
                <FontAwesome5 
                  name="parking" 
                  size={18} 
                  color={features.parkSensor ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.parkSensor && styles.featureTextActive]}>
                  Park Sensörü
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureItem, features.cruiseControl && styles.featureItemActive]} 
                onPress={() => toggleFeature('cruiseControl')}
              >
                <FontAwesome5 
                  name="tachometer-alt" 
                  size={18} 
                  color={features.cruiseControl ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.cruiseControl && styles.featureTextActive]}>
                  Cruise Control
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureItem, features.babyChair && styles.featureItemActive]} 
                onPress={() => toggleFeature('babyChair')}
              >
                <FontAwesome5 
                  name="baby" 
                  size={18} 
                  color={features.babyChair ? colors.textDark : colors.text} 
                />
                <Text style={[styles.featureText, features.babyChair && styles.featureTextActive]}>
                  Bebek Koltuğu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Araç Görselleri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Araç Görselleri</Text>
            <Text style={styles.sectionSubtitle}>En az bir adet araç görseli ekleyin</Text>
            
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <FontAwesome5 name="times-circle" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <FontAwesome5 name="plus" size={24} color={colors.primary} />
                <Text style={styles.addImageText}>Görsel Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Aracı Ekle</Text>
          </TouchableOpacity>
        </ScrollView>
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
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textareaContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textarea: {
    height: 100,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  featureItemActive: {
    backgroundColor: colors.primary,
  },
  featureText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  featureTextActive: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: 5,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  addImageText: {
    color: colors.primary,
    marginTop: 8,
    fontSize: 12,
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
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 