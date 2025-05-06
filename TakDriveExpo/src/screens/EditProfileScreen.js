import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import userService from '../api/services/userService';

const EditProfileScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const { user, refreshUserData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state'leri
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  useEffect(() => {
    if (user) {
      // Kullanıcı bilgilerini form alanlarına doldur
      setFullName(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '');
      setPhone(user.phoneNumber || '');
      setBio(user.bio || '');
    }
  }, [user]);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Ad ve soyad ayrıştırma
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const userData = {
        firstName,
        lastName,
        phoneNumber: phone,
        bio
      };
      
      // API'ye gönder
      await userService.updateUserProfile(userData);
      
      // Kullanıcı verilerini yenile
      await refreshUserData();
      
      Alert.alert(
        'Başarılı',
        'Profil bilgileriniz güncellendi.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePhoto = async () => {
    try {
      // İzin iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Bu özelliği kullanmak için galeri erişim izni gerekiyor.');
        return;
      }
      
      // Resim seçiciyi aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        
        const selectedImage = result.assets[0];
        
        // FormData oluştur
        const formData = new FormData();
        formData.append('profilePicture', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'profile-picture.jpg',
        });
        
        // API'ye gönder
        try {
          await userService.updateProfilePicture(formData);
          await refreshUserData();
          Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
        } catch (error) {
          console.error('Profil fotoğrafı yükleme hatası:', error);
          Alert.alert('Hata', 'Profil fotoğrafı yüklenirken bir sorun oluştu.');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      setUploading(false);
    }
  };
  
  const goToIdentityVerification = () => {
    navigation.navigate('IdentityVerification');
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#FFFFFF' }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView}>
          {/* Profil Fotoğrafı */}
          <View style={styles.photoContainer}>
            {uploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
              </View>
            ) : user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initialsText}>{getInitials(fullName)}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
              disabled={uploading}
            >
              <Icon name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
            </TouchableOpacity>
          </View>
          
          {/* Form Alanları */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Ad Soyad</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: darkMode ? '#333333' : '#F5F5F5',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#444444' : '#E0E0E0'
                }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ad Soyad"
                placeholderTextColor={darkMode ? '#AAAAAA' : '#757575'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>E-posta</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput, { 
                  backgroundColor: darkMode ? '#222222' : '#EEEEEE',
                  color: darkMode ? '#AAAAAA' : '#757575',
                  borderColor: darkMode ? '#444444' : '#E0E0E0'
                }]}
                value={user?.email}
                editable={false}
                placeholder="E-posta"
                placeholderTextColor={darkMode ? '#AAAAAA' : '#757575'}
              />
              <Text style={[styles.helperText, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
                E-posta adresinizi değiştirmek için müşteri hizmetleriyle iletişime geçin.
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Telefon</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: darkMode ? '#333333' : '#F5F5F5',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#444444' : '#E0E0E0'
                }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefon"
                placeholderTextColor={darkMode ? '#AAAAAA' : '#757575'}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Hakkımda</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput, { 
                  backgroundColor: darkMode ? '#333333' : '#F5F5F5',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#444444' : '#E0E0E0'
                }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Kendiniz hakkında kısa bir bilgi girin"
                placeholderTextColor={darkMode ? '#AAAAAA' : '#757575'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Kimlik Doğrulama Butonu */}
          <TouchableOpacity 
            style={styles.verificationButton}
            onPress={goToIdentityVerification}
          >
            <Icon name="id-card" size={18} color="#FFFFFF" />
            <Text style={styles.verificationButtonText}>
              Kimlik Bilgilerimi Düzenle
            </Text>
          </TouchableOpacity>
          
          {/* Kaydetme Butonu */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF4500',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF4500',
  },
  initialsText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF4500',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  changePhotoText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  disabledInput: {
    opacity: 0.7,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen; 