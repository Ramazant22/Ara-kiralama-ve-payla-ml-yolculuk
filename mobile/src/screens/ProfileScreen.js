import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { AvatarPlaceholder } from '../components/PlaceholderImages';
import { COLORS, globalStyles } from '../styles/globalStyles';
import axios from 'axios';
import { API_URL } from '../config/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const { user, userToken, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Profil verilerini çek
  useEffect(() => {
    if (userToken) {
      fetchUserProfile();
    }
  }, [userToken]);

  // Kullanıcı profilini yükleme
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // API endpoint bilgisini logla
      console.log('Profil verileri çekiliyor...', `${API_URL}/mobile/users/profile`);
      console.log('Token:', userToken ? 'Token mevcut' : 'Token yok');
      
      // Backend'den profil verilerini çek
      const response = await axios.get(`${API_URL}/mobile/users/profile`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      // Yanıtı logla
      console.log('API yanıtı:', response.status);
      console.log('API veri durumu:', response.data.status);
      
      if (response.data.status === 'success') {
        console.log('Profil verileri başarıyla yüklendi');
        setUserProfile(response.data.data.user);
      } else {
        throw new Error('API başarılı yanıt vermedi');
      }
    } catch (error) {
      console.error('Profil bilgileri yüklenirken hata:', error.message);
      if (error.response) {
        console.error('Hata durumu:', error.response.status);
        console.error('Hata verileri:', JSON.stringify(error.response.data));
      }
      
      // Test verisi kullanarak kullanıcıya arayüzü göstermeye devam et
      console.log('Auth Context verilerini kullanarak yükleniyor...');
      
      setUserProfile({ 
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone || '',
        // API başarısız olduğunda varsayılan değerleri kullan
        rating: 0,
        ratingCount: 0,
        identityVerified: false,
        drivingLicenseVerified: false,
        addressVerified: false,
        emailVerified: user?.email ? true : false,
        phoneVerified: user?.phone ? true : false,
        twoFactorEnabled: false,
        trustLevel: 10 // Yeni kullanıcılar için başlangıç değeri
      });
    } finally {
      setLoading(false);
    }
  };

  // Doğrulama sayfasına git
  const navigateToVerification = (type) => {
    navigation.navigate('Verification', { type });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4982F3" />
      </View>
    );
  }

  // Eğer kullanıcı yoksa login ekranına yönlendir
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Oturum açmanız gerekiyor</Text>
        <CustomButton
          title="Giriş Yap"
          onPress={() => navigation.navigate('Login')}
          type="primary"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        {/* Üst Bar */}
        <View style={[styles.header, { backgroundColor: COLORS.CARD }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.TEXT_PRIMARY }]}>Profilim</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Profil Bilgileri */}
          <View style={[styles.profileHeader, { backgroundColor: COLORS.CARD }]}>
            {user.profilePicture ? (
              <Image 
                source={{ uri: user.profilePicture }} 
                style={styles.profileImage} 
              />
            ) : (
              <AvatarPlaceholder size={100} name={user.firstName} />
            )}
            <Text style={[styles.userName, { color: COLORS.TEXT_PRIMARY }]}>{user.firstName} {user.lastName}</Text>
            <Text style={[styles.userEmail, { color: COLORS.TEXT_SECONDARY }]}>{user.email}</Text>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>
                {user.rating ? user.rating.toFixed(1) : '0.0'} 
                <Text style={styles.ratingCount}>({user.ratingCount || 0} değerlendirme)</Text>
              </Text>
            </View>
          </View>

          {/* Hesap Güvenliği Bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap Güvenliği</Text>
            
            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Icon 
                  name={user.identityVerified ? "check-circle" : "cancel"} 
                  size={24} 
                  color={user.identityVerified ? "#28C76F" : "#ccc"} 
                />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Kimlik Doğrulama</Text>
                  <Text style={styles.verificationDescription}>
                    {user.identityVerified 
                      ? "Kimliğiniz doğrulandı" 
                      : "Kimliğinizi doğrulayarak güvenilirliğinizi arttırın"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.verificationButton,
                  user.identityVerified && styles.verifiedButton
                ]}
                onPress={() => navigateToVerification('identity')}
              >
                <Text style={styles.verificationButtonText}>
                  {user.identityVerified ? "Görüntüle" : "Doğrula"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Icon 
                  name={user.drivingLicenseVerified ? "check-circle" : "cancel"} 
                  size={24} 
                  color={user.drivingLicenseVerified ? "#28C76F" : "#ccc"} 
                />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Ehliyet Doğrulama</Text>
                  <Text style={styles.verificationDescription}>
                    {user.drivingLicenseVerified 
                      ? "Ehliyetiniz doğrulandı" 
                      : "Ehliyetinizi doğrulayarak araç kiralayabilirsiniz"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.verificationButton,
                  user.drivingLicenseVerified && styles.verifiedButton
                ]}
                onPress={() => navigateToVerification('drivingLicense')}
              >
                <Text style={styles.verificationButtonText}>
                  {user.drivingLicenseVerified ? "Görüntüle" : "Doğrula"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Icon 
                  name={user.addressVerified ? "check-circle" : "cancel"} 
                  size={24} 
                  color={user.addressVerified ? "#28C76F" : "#ccc"} 
                />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Adres Doğrulama</Text>
                  <Text style={styles.verificationDescription}>
                    {user.addressVerified 
                      ? "Adresiniz doğrulandı" 
                      : "Adresinizi doğrulayarak işlemleri hızlandırın"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.verificationButton,
                  user.addressVerified && styles.verifiedButton
                ]}
                onPress={() => navigateToVerification('address')}
              >
                <Text style={styles.verificationButtonText}>
                  {user.addressVerified ? "Görüntüle" : "Doğrula"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Icon 
                  name={user.isPhoneVerified ? "check-circle" : "cancel"} 
                  size={24} 
                  color={user.isPhoneVerified ? "#28C76F" : "#ccc"} 
                />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Telefon Doğrulama</Text>
                  <Text style={styles.verificationDescription}>
                    {user.isPhoneVerified 
                      ? "Telefonunuz doğrulandı" 
                      : "Telefonunuzu doğrulayarak güvenliğinizi arttırın"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.verificationButton,
                  user.isPhoneVerified && styles.verifiedButton
                ]}
                onPress={() => navigateToVerification('phone')}
              >
                <Text style={styles.verificationButtonText}>
                  {user.isPhoneVerified ? "Görüntüle" : "Doğrula"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Icon 
                  name={user.isEmailVerified ? "check-circle" : "cancel"} 
                  size={24} 
                  color={user.isEmailVerified ? "#28C76F" : "#ccc"} 
                />
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>E-posta Doğrulama</Text>
                  <Text style={styles.verificationDescription}>
                    {user.isEmailVerified 
                      ? "E-postanız doğrulandı" 
                      : "E-postanızı doğrulayarak bildirimleri alın"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.verificationButton,
                  user.isEmailVerified && styles.verifiedButton
                ]}
                onPress={() => navigateToVerification('email')}
              >
                <Text style={styles.verificationButtonText}>
                  {user.isEmailVerified ? "Görüntüle" : "Doğrula"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* İki Faktörlü Kimlik Doğrulama */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İki Faktörlü Kimlik Doğrulama</Text>
            <View style={styles.twoFactorContainer}>
              <View style={styles.twoFactorInfo}>
                <Icon 
                  name={user.twoFactorEnabled ? "security" : "security"} 
                  size={24} 
                  color={user.twoFactorEnabled ? "#28C76F" : "#ccc"} 
                />
                <View>
                  <Text style={styles.twoFactorTitle}>İki Faktörlü Doğrulama</Text>
                  <Text style={styles.twoFactorDescription}>
                    {user.twoFactorEnabled 
                      ? "İki faktörlü doğrulama etkin" 
                      : "Hesabınızı korumak için etkinleştirin"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.twoFactorSwitch}
                onPress={() => navigation.navigate('TwoFactorAuth')}
              >
                <Text style={styles.twoFactorSwitchText}>
                  {user.twoFactorEnabled ? "Devre Dışı Bırak" : "Etkinleştir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Güven Seviyesi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Güven Seviyesi</Text>
            <View style={styles.trustLevelContainer}>
              <View style={styles.trustLevelBar}>
                <View 
                  style={[
                    styles.trustLevelFill, 
                    {width: `${(user.trustLevel || 1) * 20}%`}
                  ]}
                />
              </View>
              <Text style={styles.trustLevelText}>
                Seviye {user.trustLevel || 1}/5
              </Text>
              <Text style={styles.trustLevelDescription}>
                Doğrulamalarınızı tamamlayarak güven seviyenizi artırın.
                Daha yüksek güven seviyesi, daha fazla kişiden yolculuk ve araç teklifi almanızı sağlar.
              </Text>
            </View>
          </View>

          {/* Hesap Ayarları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="edit" size={24} color="#4982F3" />
              <Text style={styles.settingsText}>Profili Düzenle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <Icon name="lock" size={24} color="#4982F3" />
              <Text style={styles.settingsText}>Şifre Değiştir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications" size={24} color="#4982F3" />
              <Text style={styles.settingsText}>Bildirim Ayarları</Text>
            </TouchableOpacity>
          </View>

          {/* Çıkış Yap */}
          <View style={styles.logoutContainer}>
            <CustomButton
              title="Çıkış Yap"
              onPress={async () => {
                try {
                  await logout();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }]
                  });
                } catch (error) {
                  console.error('Çıkış hatası:', error);
                  Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
                }
              }}
              type="secondary"
            />
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  ratingCount: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'normal',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verificationText: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  verificationDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  verificationButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  verifiedButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  verificationButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: '600',
    fontSize: 14,
  },
  twoFactorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  twoFactorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  twoFactorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  twoFactorDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
    marginLeft: 12,
  },
  twoFactorSwitch: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  twoFactorSwitchText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: '600',
    fontSize: 14,
  },
  trustLevelContainer: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
  },
  trustLevelBar: {
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trustLevelFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  trustLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  trustLevelDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  settingsText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 20,
  },
});

export default ProfileScreen;
