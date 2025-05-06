import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import userService from '../api/services/userService';

const IdentityVerificationScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const { user, refreshUserData } = useContext(AuthContext);
  
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);
  const [selfieWithId, setSelfieWithId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentLoading, setDocumentLoading] = useState({
    idCardFront: false,
    idCardBack: false,
    drivingLicense: false,
    selfieWithId: false
  });
  
  const pickImage = async (type) => {
    try {
      // İzin iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Bu özelliği kullanmak için galeri erişim izni gerekiyor.');
        return;
      }
      
      // Yükleme durumunu ayarla
      setDocumentLoading({
        ...documentLoading,
        [type]: true
      });
      
      // Resim seçiciyi aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // FormData oluştur
        const formData = new FormData();
        formData.append('document', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: `${type}.jpg`,
        });
        
        // API'ye gönder
        try {
          const response = await userService.uploadVerificationDocument(type, formData);
          
          // Başarılı yükleme sonrası resmi set et
          switch (type) {
            case 'idCardFront':
              setIdCardFront(selectedImage.uri);
              break;
            case 'idCardBack':
              setIdCardBack(selectedImage.uri);
              break;
            case 'drivingLicense':
              setDrivingLicense(selectedImage.uri);
              break;
            case 'selfieWithId':
              setSelfieWithId(selectedImage.uri);
              break;
          }
          
          Alert.alert('Başarılı', 'Belge başarıyla yüklendi.');
          
        } catch (error) {
          console.error('Belge yükleme hatası:', error);
          Alert.alert('Hata', 'Belge yüklenirken bir sorun oluştu.');
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      Alert.alert('Hata', 'Resim seçilirken bir sorun oluştu.');
    } finally {
      // Yükleme durumunu sıfırla
      setDocumentLoading({
        ...documentLoading,
        [type]: false
      });
    }
  };
  
  const handleSubmit = async () => {
    // Gerekli dokümanları kontrol et
    if (!idCardFront || !idCardBack) {
      Alert.alert('Eksik Belgeler', 'Lütfen kimlik kartınızın ön ve arka yüzünü yükleyin.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Doğrulama başvurusunu gönder
      await userService.submitVerification();
      
      // Kullanıcı verilerini yenile
      await refreshUserData();
      
      Alert.alert(
        'Başarılı',
        'Kimlik doğrulama başvurunuz alındı. İnceleme sonucu hakkında bilgilendirileceksiniz.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      Alert.alert('Hata', 'Kimlik doğrulama başvurusu gönderilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#FFFFFF' }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
            Kimlik Doğrulama
          </Text>
          <Text style={[styles.headerDescription, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
            Güvenli bir deneyim için kimliğinizi doğrulayın. Yüklediğiniz belgeler güvenli bir şekilde saklanır ve yalnızca doğrulama amacıyla kullanılır.
          </Text>
        </View>
        
        <View style={styles.documentsContainer}>
          {/* Kimlik Kartı Ön Yüz */}
          <TouchableOpacity 
            style={[styles.documentCard, { backgroundColor: darkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => pickImage('idCardFront')}
            disabled={documentLoading.idCardFront}
          >
            {documentLoading.idCardFront ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
              </View>
            ) : idCardFront ? (
              <View style={styles.documentPreviewContainer}>
                <Image source={{ uri: idCardFront }} style={styles.documentPreview} />
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => pickImage('idCardFront')}
                >
                  <Icon name="redo" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.documentIconContainer}>
                  <Icon name="id-card" size={24} color="#FF4500" />
                </View>
                <Text style={[styles.documentTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                  Kimlik Kartı (Ön)
                </Text>
                <Text style={[styles.documentDescription, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
                  Kimlik kartınızın ön yüzünün fotoğrafını yükleyin
                </Text>
                <View style={styles.uploadButton}>
                  <Icon name="upload" size={14} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Resim Yükle</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
          
          {/* Kimlik Kartı Arka Yüz */}
          <TouchableOpacity 
            style={[styles.documentCard, { backgroundColor: darkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => pickImage('idCardBack')}
            disabled={documentLoading.idCardBack}
          >
            {documentLoading.idCardBack ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
              </View>
            ) : idCardBack ? (
              <View style={styles.documentPreviewContainer}>
                <Image source={{ uri: idCardBack }} style={styles.documentPreview} />
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => pickImage('idCardBack')}
                >
                  <Icon name="redo" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.documentIconContainer}>
                  <Icon name="id-card" size={24} color="#FF4500" />
                </View>
                <Text style={[styles.documentTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                  Kimlik Kartı (Arka)
                </Text>
                <Text style={[styles.documentDescription, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
                  Kimlik kartınızın arka yüzünün fotoğrafını yükleyin
                </Text>
                <View style={styles.uploadButton}>
                  <Icon name="upload" size={14} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Resim Yükle</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
          
          {/* Ehliyet (İsteğe Bağlı) */}
          <TouchableOpacity 
            style={[styles.documentCard, { backgroundColor: darkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => pickImage('drivingLicense')}
            disabled={documentLoading.drivingLicense}
          >
            {documentLoading.drivingLicense ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
              </View>
            ) : drivingLicense ? (
              <View style={styles.documentPreviewContainer}>
                <Image source={{ uri: drivingLicense }} style={styles.documentPreview} />
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => pickImage('drivingLicense')}
                >
                  <Icon name="redo" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.documentIconContainer}>
                  <Icon name="id-badge" size={24} color="#FF4500" />
                </View>
                <Text style={[styles.documentTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                  Ehliyet (İsteğe Bağlı)
                </Text>
                <Text style={[styles.documentDescription, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
                  Ehliyetinizin fotoğrafını yükleyin (sürücü iseniz gerekli)
                </Text>
                <View style={styles.uploadButton}>
                  <Icon name="upload" size={14} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Resim Yükle</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
          
          {/* Kimlikle Selfie */}
          <TouchableOpacity 
            style={[styles.documentCard, { backgroundColor: darkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => pickImage('selfieWithId')}
            disabled={documentLoading.selfieWithId}
          >
            {documentLoading.selfieWithId ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4500" />
              </View>
            ) : selfieWithId ? (
              <View style={styles.documentPreviewContainer}>
                <Image source={{ uri: selfieWithId }} style={styles.documentPreview} />
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => pickImage('selfieWithId')}
                >
                  <Icon name="redo" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.documentIconContainer}>
                  <Icon name="user-check" size={24} color="#FF4500" />
                </View>
                <Text style={[styles.documentTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                  Kimlikle Selfie (İsteğe Bağlı)
                </Text>
                <Text style={[styles.documentDescription, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
                  Kimliğinizi tutarken çekilmiş bir selfie yükleyin
                </Text>
                <View style={styles.uploadButton}>
                  <Icon name="upload" size={14} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Resim Yükle</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Gönder Butonu */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting || !idCardFront || !idCardBack}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Doğrulama İçin Gönder</Text>
          )}
        </TouchableOpacity>
        
        {/* Notlar */}
        <View style={styles.notesContainer}>
          <Text style={[styles.notesTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
            Önemli Notlar:
          </Text>
          <View style={styles.noteItem}>
            <Icon name="info-circle" size={14} color="#FF4500" style={styles.noteIcon} />
            <Text style={[styles.noteText, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
              Kimlik bilgileriniz güvenli bir şekilde şifrelenir ve saklanır.
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Icon name="info-circle" size={14} color="#FF4500" style={styles.noteIcon} />
            <Text style={[styles.noteText, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
              Doğrulama süreci genellikle 24 saat içinde tamamlanır.
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Icon name="info-circle" size={14} color="#FF4500" style={styles.noteIcon} />
            <Text style={[styles.noteText, { color: darkMode ? '#AAAAAA' : '#757575' }]}>
              Net ve okunaklı resimler yüklemeniz doğrulama sürecini hızlandırır.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  documentPreviewContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  changeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FF4500',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesContainer: {
    marginBottom: 30,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  }
});

export default IdentityVerificationScreen; 