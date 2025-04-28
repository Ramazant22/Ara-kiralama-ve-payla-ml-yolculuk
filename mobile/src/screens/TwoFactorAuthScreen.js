import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import { API_URL } from '../config/api';

const TwoFactorAuthScreen = ({ navigation }) => {
  const { user, userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(user?.twoFactorEnabled || false);
  const [method, setMethod] = useState('sms'); // 'sms' veya 'email'

  // 2FA'yı etkinleştir/devre dışı bırak
  const toggleTwoFactor = async () => {
    if (!user.isPhoneVerified && method === 'sms') {
      Alert.alert(
        'Doğrulama Gerekli',
        'SMS ile iki faktörlü doğrulamayı kullanabilmek için önce telefonunuzu doğrulamanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Telefon Doğrula', 
            onPress: () => navigation.navigate('Verification', { type: 'phone' }) 
          }
        ]
      );
      return;
    }

    if (!user.isEmailVerified && method === 'email') {
      Alert.alert(
        'Doğrulama Gerekli',
        'E-posta ile iki faktörlü doğrulamayı kullanabilmek için önce e-postanızı doğrulamanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'E-posta Doğrula', 
            onPress: () => navigation.navigate('Verification', { type: 'email' }) 
          }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // 2FA etkinleştiriliyorsa, bir doğrulama kodu gönder
      if (!enabled) {
        const response = await axios.post(
          `${API_URL}/mobile/users/2fa/setup`, 
          { method },
          {
            headers: {
              'Authorization': `Bearer ${userToken}`
            }
          }
        );

        if (response.data.status === 'success') {
          navigation.navigate('VerificationCode', { 
            type: '2fa', 
            method,
            action: 'enable'
          });
        }
      } else {
        // 2FA devre dışı bırakılıyorsa, onay ekranına yönlendir
        Alert.alert(
          'İki Faktörlü Doğrulamayı Devre Dışı Bırak',
          'İki faktörlü doğrulamayı devre dışı bırakmak hesabınızın güvenliğini azaltacaktır. Devam etmek istediğinizden emin misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Devam Et', 
              onPress: async () => {
                try {
                  const disableResponse = await axios.post(
                    `${API_URL}/mobile/users/2fa/disable`,
                    {},
                    {
                      headers: {
                        'Authorization': `Bearer ${userToken}`
                      }
                    }
                  );

                  if (disableResponse.data.status === 'success') {
                    setEnabled(false);
                    Alert.alert(
                      'Başarılı',
                      'İki faktörlü doğrulama başarıyla devre dışı bırakıldı.',
                      [{ text: 'Tamam' }]
                    );
                  }
                } catch (error) {
                  console.error('2FA devre dışı bırakma hatası:', error);
                  Alert.alert('Hata', 'İki faktörlü doğrulama devre dışı bırakılırken bir sorun oluştu.');
                } finally {
                  setLoading(false);
                }
              } 
            }
          ]
        );
      }
    } catch (error) {
      console.error('2FA ayarlama hatası:', error);
      Alert.alert('Hata', 'İki faktörlü doğrulama ayarlanırken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>İki Faktörlü Kimlik Doğrulama</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="security" size={60} color="#4982F3" />
            </View>
            
            <Text style={styles.title}>İki Faktörlü Kimlik Doğrulama</Text>
            <Text style={styles.description}>
              İki faktörlü kimlik doğrulama, hesabınıza giriş yaparken şifrenizin yanında ikinci bir doğrulama adımı ekleyerek güvenliği artırır.
            </Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>İki Faktörlü Doğrulama</Text>
                <Text style={styles.statusDescription}>
                  {enabled 
                    ? 'Etkin - Giriş yaparken ikinci doğrulama adımı istenir' 
                    : 'Devre dışı - Sadece kullanıcı adı ve şifre ile giriş yapabilirsiniz'}
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#ccc", true: "#a3c9ff" }}
                thumbColor={enabled ? "#4982F3" : "#f4f3f4"}
                ios_backgroundColor="#ccc"
                onValueChange={toggleTwoFactor}
                value={enabled}
                disabled={loading}
              />
            </View>

            {!enabled && (
              <View style={styles.methodContainer}>
                <Text style={styles.methodTitle}>Doğrulama Yöntemi</Text>
                <Text style={styles.methodDescription}>
                  İki faktörlü doğrulama için tercih ettiğiniz yöntemi seçin.
                </Text>

                <TouchableOpacity 
                  style={[
                    styles.methodItem, 
                    method === 'sms' && styles.methodItemSelected
                  ]}
                  onPress={() => setMethod('sms')}
                >
                  <Icon 
                    name="sms" 
                    size={24} 
                    color={method === 'sms' ? "#4982F3" : "#666"} 
                  />
                  <View style={styles.methodText}>
                    <Text style={[
                      styles.methodName,
                      method === 'sms' && styles.methodNameSelected
                    ]}>
                      SMS ile Doğrulama
                    </Text>
                    <Text style={styles.methodInfo}>
                      Giriş yaparken telefonunuza SMS ile kod gönderilir
                    </Text>
                  </View>
                  {method === 'sms' && (
                    <Icon name="check-circle" size={24} color="#4982F3" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.methodItem,
                    method === 'email' && styles.methodItemSelected
                  ]}
                  onPress={() => setMethod('email')}
                >
                  <Icon 
                    name="email" 
                    size={24} 
                    color={method === 'email' ? "#4982F3" : "#666"} 
                  />
                  <View style={styles.methodText}>
                    <Text style={[
                      styles.methodName,
                      method === 'email' && styles.methodNameSelected
                    ]}>
                      E-posta ile Doğrulama
                    </Text>
                    <Text style={styles.methodInfo}>
                      Giriş yaparken e-posta adresinize doğrulama kodu gönderilir
                    </Text>
                  </View>
                  {method === 'email' && (
                    <Icon name="check-circle" size={24} color="#4982F3" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoBox}>
              <Icon name="info" size={24} color="#4982F3" />
              <Text style={styles.infoText}>
                İki faktörlü kimlik doğrulama etkinleştirildiğinde, farklı bir cihazdan veya tarayıcıdan giriş yapmaya çalıştığınızda her zaman doğrulama kodu gerekir.
              </Text>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4982F3" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 24,
  },
  statusContent: {
    flex: 1,
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666666',
  },
  methodContainer: {
    marginBottom: 24,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  methodItemSelected: {
    borderColor: '#4982F3',
    backgroundColor: '#F0F7FF',
  },
  methodText: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  methodNameSelected: {
    color: '#4982F3',
  },
  methodInfo: {
    fontSize: 14,
    color: '#666666',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4982F3',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#4982F3',
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default TwoFactorAuthScreen;
