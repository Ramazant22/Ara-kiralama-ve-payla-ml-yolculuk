import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title,
  HelperText,
  ActivityIndicator,
  Avatar,
  IconButton,
  Chip
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [licenseDocument, setLicenseDocument] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Türkiye'
    },
    drivingLicense: {
      number: '',
      expiryDate: '',
      verified: false
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          district: user.address?.district || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'Türkiye'
        },
        drivingLicense: {
          number: user.drivingLicense?.number || '',
          expiryDate: user.drivingLicense?.expiryDate || '',
          verified: user.drivingLicense?.verified || false
        }
      });
      setProfileImage(user.avatar);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    } else if (!/^(\+90|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin';
    }

    // Ehliyet validasyonu
    if (formData.drivingLicense.number && formData.drivingLicense.number.length < 6) {
      newErrors.licenseNumber = 'Ehliyet numarası en az 6 karakter olmalıdır';
    }

    if (formData.drivingLicense.expiryDate) {
      const expiryDate = new Date(formData.drivingLicense.expiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.licenseExpiry = 'Ehliyet son kullanma tarihi geçmiş olamaz';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için medya kütüphanesine erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Nasıl bir fotoğraf eklemek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeriden Seç', onPress: pickImage },
        { text: 'Fotoğraf Çek', onPress: takePhoto },
      ]
    );
  };

  const pickLicenseDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setLicenseDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Belge seçilirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const handleDateChange = (text) => {
    // Basit tarih formatı: DD/MM/YYYY
    let formatted = text.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    
    updateFormData('drivingLicense.expiryDate', formatted);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      };

      // Eğer yeni fotoğraf seçildiyse ekle
      if (profileImage && profileImage !== user.avatar) {
        updateData.avatar = profileImage;
      }

      // Ehliyet bilgileri varsa ekle
      if (formData.drivingLicense.number || formData.drivingLicense.expiryDate) {
        updateData.drivingLicense = formData.drivingLicense;
      }

      const response = await authService.updateProfile(updateData);
      
      // Auth context'teki user bilgilerini güncelle
      if (updateUserData) {
        updateUserData(response.user);
      }
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      Alert.alert(
        'Hata', 
        error.response?.data?.message || 'Profil güncellenirken hata oluştu'
      );
    }
    
    setIsLoading(false);
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const inputTheme = {
    colors: {
      primary: colors.primary,
      outline: colors.text.secondary,
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profil Fotoğrafı */}
        <Card style={styles.photoCard}>
          <Card.Content style={styles.photoContent}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Avatar.Text 
                  size={120} 
                  label={user?.firstName?.charAt(0) || 'U'} 
                  style={styles.avatar}
                />
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={showImagePicker}>
                <MaterialIcons name="camera-alt" size={24} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHint}>Profil fotoğrafınızı değiştirmek için tıklayın</Text>
          </Card.Content>
        </Card>

        {/* Kişisel Bilgiler */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Kişisel Bilgiler</Title>
            
            <TextInput
              label="Ad"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.firstName}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.firstName}>
              {errors.firstName}
            </HelperText>
            
            <TextInput
              label="Soyad"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.lastName}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.lastName}>
              {errors.lastName}
            </HelperText>
            
            <TextInput
              label="Telefon"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.phone}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone}
            </HelperText>
            
            <TextInput
              label="E-posta"
              value={user?.email || ''}
              mode="outlined"
              style={styles.input}
              disabled
              theme={inputTheme}
            />
            <HelperText type="info">
              E-posta adresi değiştirilemez
            </HelperText>
          </Card.Content>
        </Card>

        {/* Ehliyet Bilgileri */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Ehliyet Bilgileri</Title>
              {formData.drivingLicense.verified && (
                <Chip 
                  icon="check-circle" 
                  style={styles.verifiedChip}
                  textStyle={styles.verifiedChipText}
                >
                  Onaylandı
                </Chip>
              )}
            </View>
            
            <TextInput
              label="Ehliyet Numarası"
              value={formData.drivingLicense.number}
              onChangeText={(value) => updateFormData('drivingLicense.number', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.licenseNumber}
              theme={inputTheme}
              maxLength={20}
            />
            <HelperText type="error" visible={!!errors.licenseNumber}>
              {errors.licenseNumber}
            </HelperText>
            
            <TextInput
              label="Son Kullanma Tarihi (GG/AA/YYYY)"
              value={formData.drivingLicense.expiryDate}
              onChangeText={handleDateChange}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.licenseExpiry}
              theme={inputTheme}
              placeholder="15/12/2030"
              maxLength={10}
            />
            <HelperText type="error" visible={!!errors.licenseExpiry}>
              {errors.licenseExpiry}
            </HelperText>
            
            {/* Ehliyet Belgesi Yükleme */}
            <TouchableOpacity 
              style={styles.documentUploadButton} 
              onPress={pickLicenseDocument}
            >
              <MaterialIcons name="upload-file" size={24} color={colors.primary} />
              <Text style={styles.documentUploadText}>
                {licenseDocument ? licenseDocument.name : 'Ehliyet Belgesi Yükle'}
              </Text>
            </TouchableOpacity>
            
            {licenseDocument && (
              <View style={styles.documentInfo}>
                <MaterialIcons name="description" size={16} color={colors.primary} />
                <Text style={styles.documentName}>{licenseDocument.name}</Text>
                <TouchableOpacity onPress={() => setLicenseDocument(null)}>
                  <MaterialIcons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
            
            <HelperText type="info">
              Ehliyet bilgileriniz doğrulama için yöneticiler tarafından incelenecektir.
            </HelperText>
          </Card.Content>
        </Card>

        {/* Adres Bilgileri */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Adres Bilgileri</Title>
            
            <TextInput
              label="Şehir"
              value={formData.address.city}
              onChangeText={(value) => updateFormData('address.city', value)}
              mode="outlined"
              style={styles.input}
              theme={inputTheme}
            />
            
            <TextInput
              label="İlçe"
              value={formData.address.district}
              onChangeText={(value) => updateFormData('address.district', value)}
              mode="outlined"
              style={styles.input}
              theme={inputTheme}
            />
            
            <TextInput
              label="Adres"
              value={formData.address.street}
              onChangeText={(value) => updateFormData('address.street', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              theme={inputTheme}
            />
            
            <TextInput
              label="Posta Kodu"
              value={formData.address.postalCode}
              onChangeText={(value) => updateFormData('address.postalCode', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              theme={inputTheme}
            />
          </Card.Content>
        </Card>

        {/* Kaydet Butonu */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isLoading}
          buttonColor={colors.primary}
          textColor={colors.onPrimary}
        >
          {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : 'Kaydet'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  photoCard: {
    marginBottom: spacing.md,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  photoContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: elevation.medium,
  },
  photoHint: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
  },
  verifiedChip: {
    backgroundColor: colors.success,
  },
  verifiedChipText: {
    color: colors.onPrimary,
    fontSize: 12,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  documentUploadText: {
    marginLeft: spacing.sm,
    color: colors.primary,
    fontSize: 16,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    marginBottom: spacing.sm,
  },
  documentName: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text.primary,
    fontSize: 14,
  },
  saveButton: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.sm,
  },
}); 