import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config/api';
import { COLORS, globalStyles } from '../styles/globalStyles';

const VerificationScreen = ({ route, navigation }) => {
  const { type } = route.params;
  const { user, userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [document, setDocument] = useState(null);
  
  // Doğrulama türüne göre başlık ve açıklama belirle
  const getVerificationInfo = () => {
    switch(type) {
      case 'identity':
        return {
          title: 'Kimlik Doğrulama',
          description: 'Lütfen kimlik kartınızın veya pasaportunuzun ön yüzünün net bir fotoğrafını yükleyin.',
          verified: user?.identityVerified,
          icon: 'account-box'
        };
      case 'drivingLicense':
        return {
          title: 'Ehliyet Doğrulama',
          description: 'Lütfen ehliyetinizin ön yüzünün net bir fotoğrafını yükleyin.',
          verified: user?.drivingLicenseVerified,
          icon: 'directions-car'
        };
      case 'address':
        return {
          title: 'Adres Doğrulama',
          description: 'Lütfen adresinizi gösteren bir belgenin (fatura, banka ekstresi vb.) net bir fotoğrafını yükleyin.',
          verified: user?.addressVerified,
          icon: 'home'
        };
      case 'phone':
        return {
          title: 'Telefon Doğrulama',
          description: 'Telefonunuzu doğrulamak için, aşağıdaki butona tıklayarak SMS ile doğrulama kodu alabilirsiniz.',
          verified: user?.isPhoneVerified,
          icon: 'phone'
        };
      case 'email':
        return {
          title: 'E-posta Doğrulama',
          description: 'E-postanızı doğrulamak için, aşağıdaki butona tıklayarak e-posta ile doğrulama bağlantısı alabilirsiniz.',
          verified: user?.isEmailVerified,
          icon: 'email'
        };
      default:
        return {
          title: 'Doğrulama',
          description: 'Lütfen belge yükleyin.',
          verified: false,
          icon: 'verified-user'
        };
    }
  };

  const info = getVerificationInfo();

  useEffect(() => {
    // İzin iste
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Üzgünüz', 'Galeri erişim izni olmadan belge yükleyemezsiniz.');
        }
      }
    })();

    // Daha önce yüklenmiş dokümanı kontrol et
    fetchVerificationDocument();
  }, []);

  const fetchVerificationDocument = async () => {
    if (type === 'phone' || type === 'email') return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/mobile/users/verification/${type}`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      if (response.data.status === 'success' && response.data.data.document) {
        setDocument(response.data.data.document);
      }
    } catch (error) {
      console.error('Doğrulama belgesi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Üzgünüz', 'Kamera erişim izni olmadan fotoğraf çekemezsiniz.');
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Kamera açılırken hata:', error);
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu.');
    }
  };

  const uploadDocument = async () => {
    if (!uploadedImage) {
      Alert.alert('Uyarı', 'Lütfen önce bir belge yükleyin.');
      return;
    }

    setLoading(true);

    // Dosya adını ve MIME türünü belirle
    const imageUri = uploadedImage;
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    const formData = new FormData();
    formData.append('type', type);
    formData.append('document', {
      uri: imageUri,
      name: `${type}_${Date.now()}.${fileType}`,
      type: `image/${fileType}`
    });

    try {
      const response = await axios.post(`${API_URL}/mobile/users/verification/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.data.status === 'success') {
        Alert.alert(
          'Başarılı',
          'Belgeniz başarıyla yüklendi. İnceleme sonrası doğrulama işleminiz tamamlanacaktır.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Belge yükleme hatası:', error);
      Alert.alert('Hata', 'Belge yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      // API endpoint'ine doğrulama kodu isteği gönder
      const emailToVerify = user?.email || 'test@example.com';
      console.log('Doğrulama kodu isteniyor:', emailToVerify);
      
      const response = await axios.post(`${API_URL}/mobile/verification/send-code`, {
        email: emailToVerify,
        type: type
      });
      
      console.log('Doğrulama kodu yanıtı:', response.data);
      
      if (response.data.status === 'success') {
        setLoading(false);
        
        // Doğrulama kodu ekranına git
        if (type === 'email') {
          // Test amaçlı olarak kodu doğrudan gönderebiliriz
          navigation.navigate('VerificationCode', { 
            type, 
            email: emailToVerify,
            code: response.data.data.verificationCode // Sadece test/geliştirme için
          });
        } else if (type === 'phone') {
          navigation.navigate('VerificationCode', { 
            type, 
            phone: user?.phone || '+905551234567',
            code: response.data.data.verificationCode // Sadece test/geliştirme için
          });
        }
      } else {
        throw new Error('Doğrulama kodu gönderilemedi');
      }
    } catch (error) {
      console.error('Doğrulama kodu gönderme hatası:', error.message);
      setLoading(false);
      Alert.alert('Hata', 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Belge yükleme işlemi telefon ve email için farklı
  const renderVerificationContent = () => {
    if (type === 'phone' || type === 'email') {
      return (
        <View style={styles.codeContainer}>
          <Icon name={info.icon} size={60} color="#4982F3" style={styles.bigIcon} />
          <Text style={styles.codeDescription}>{info.description}</Text>
          
          <CustomButton
            title={`${type === 'phone' ? 'SMS' : 'E-posta'} Gönder`}
            onPress={sendVerificationCode}
            loading={loading}
            type="primary"
            style={styles.sendButton}
          />
        </View>
      );
    }

    // Belge zaten yüklenmişse ve doğrulanmışsa
    if (document && info.verified) {
      return (
        <View style={styles.verifiedContainer}>
          <Icon name="check-circle" size={60} color="#28C76F" style={styles.bigIcon} />
          <Text style={styles.verifiedText}>Belgeniz doğrulanmıştır!</Text>
          
          {document.documentUrl && (
            <Image 
              source={{ uri: document.documentUrl }} 
              style={styles.documentImage} 
              resizeMode="contain"
            />
          )}
          
          <Text style={styles.verificationDate}>
            Doğrulama Tarihi: {new Date(document.verifiedAt).toLocaleDateString()}
          </Text>
        </View>
      );
    }

    // Belge yüklenmişse ama henüz doğrulanmamışsa
    if (document && !info.verified) {
      return (
        <View style={styles.pendingContainer}>
          <Icon name="access-time" size={60} color="#FFC107" style={styles.bigIcon} />
          <Text style={styles.pendingText}>Belgeniz inceleniyor</Text>
          
          {document.documentUrl && (
            <Image 
              source={{ uri: document.documentUrl }} 
              style={styles.documentImage} 
              resizeMode="contain"
            />
          )}
          
          <Text style={styles.uploadDate}>
            Yükleme Tarihi: {new Date(document.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
      );
    }

    // Yeni belge yüklemesi
    return (
      <View>
        <View style={styles.uploadContainer}>
          {uploadedImage ? (
            <Image 
              source={{ uri: uploadedImage }} 
              style={styles.uploadedImage} 
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="cloud-upload" size={60} color="#4982F3" />
              <Text style={styles.placeholderText}>Belge yüklemek için tıklayın</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Galeriden Seç"
            onPress={pickImage}
            type="secondary"
            style={styles.uploadButton}
          />
          
          <CustomButton
            title="Fotoğraf Çek"
            onPress={launchCamera}
            type="secondary"
            style={styles.uploadButton}
          />
        </View>

        <CustomButton
          title="Belgeyi Yükle"
          onPress={uploadDocument}
          loading={loading}
          disabled={!uploadedImage}
          type="primary"
          style={styles.submitButton}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Üst Bar */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{info.title}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.infoContainer}>
            <Icon name={info.icon} size={32} color="#4982F3" />
            <Text style={styles.infoTitle}>{info.title}</Text>
            <Text style={styles.infoDescription}>{info.description}</Text>
          </View>
          
          {loading && !renderVerificationContent() ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4982F3" />
            </View>
          ) : (
            renderVerificationContent()
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 16,
    overflow: 'hidden',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888888',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  verifiedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  verifiedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28C76F',
    marginVertical: 16,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 16,
  },
  verificationDate: {
    fontSize: 14,
    color: '#666666',
  },
  pendingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  pendingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
    marginVertical: 16,
  },
  uploadDate: {
    fontSize: 14,
    color: '#666666',
  },
  bigIcon: {
    marginBottom: 16,
  },
  codeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  codeDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 16,
  },
  sendButton: {
    marginTop: 16,
  },
});

export default VerificationScreen;
