import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Keyboard
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import { API_URL } from '../config/api';

const VerificationCodeScreen = ({ route, navigation }) => {
  const { type, email, phone, code: testCode, method, action } = route.params;
  const { user, userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Test amaçlı otomatik kod doldurma - sadece geliştirme ortamında
  useEffect(() => {
    // Otomatik doldurma geçici olarak devre dışı bırakıldı
    console.log('Otomatik doldurma devre dışı bırakıldı. Kodu manuel olarak girebilirsiniz.');
    // if (testCode && testCode.length === 6) {
    //   const codeArray = testCode.split('');
    //   setCode(codeArray);
    //   console.log('Test kodu otomatik dolduruldu:', testCode);
    // }
  }, [testCode]);
  
  const inputRefs = useRef([]);

  // Zamanlayıcı
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Doğrulama türüne göre başlık ve açıklama
  const getVerificationInfo = () => {
    switch(type) {
      case 'phone':
        return {
          title: 'Telefon Doğrulama',
          description: `${user?.phoneNumber || ''} numaralı telefonunuza gönderilen 6 haneli doğrulama kodunu girin.`,
          icon: 'phone'
        };
      case 'email':
        return {
          title: 'E-posta Doğrulama',
          description: `${user?.email || ''} adresine gönderilen 6 haneli doğrulama kodunu girin.`,
          icon: 'email'
        };
      case '2fa':
        return {
          title: 'İki Faktörlü Doğrulama',
          description: `${method === 'sms' ? 'Telefonunuza' : 'E-postanıza'} gönderilen 6 haneli doğrulama kodunu girin.`,
          icon: 'security'
        };
      default:
        return {
          title: 'Doğrulama Kodu',
          description: 'Gönderilen 6 haneli doğrulama kodunu girin.',
          icon: 'verified-user'
        };
    }
  };

  const info = getVerificationInfo();

  // Doğrulama kodunu kontrol et
  const verifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu tam olarak girin.');
      return;
    }

    setLoading(true);
    try {
      console.log('Doğrulama yapılıyor...');
      
      // E-posta veya telefon değerini belirleme
      const contactInfo = email || user?.email || 'test@example.com';
      console.log('Doğrulama yapılacak bilgi:', contactInfo);
      
      // Yeni API endpoint'ini kullanarak doğrulama yap
      const response = await axios.post(`${API_URL}/mobile/verification/verify-code`, {
        email: contactInfo,
        code: fullCode
      });
      
      console.log('Doğrulama yanıtı:', response.data);

      if (response.data.status === 'success') {
        // Başarılı doğrulama
        setLoading(false);
        
        Alert.alert(
          'Doğrulama Başarılı',
          type === 'email' 
            ? 'E-posta adresiniz başarıyla doğrulandı.'
            : type === 'phone'
              ? 'Telefon numaranız başarıyla doğrulandı.'
              : 'Doğrulama işlemi başarıyla tamamlandı.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Profile') }]
        );
      } else {
        throw new Error('Doğrulama başarısız oldu');
      }
    } catch (error) {
      console.error('Doğrulama hatası:', error.message);
      if (error.response) {
        console.error('Hata durumu:', error.response.status);
        console.error('Hata verileri:', JSON.stringify(error.response.data));
      }
      setLoading(false);
      Alert.alert('Hata', 'Doğrulama kodu geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.');
    }
  };

  // Doğrulama kodunu yeniden gönder
  const resendCode = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      // Yeni API endpoint'ini kullanarak doğrulama kodunu yeniden iste
      const contactInfo = email || user?.email || 'test@example.com';
      
      const response = await axios.post(`${API_URL}/mobile/verification/send-code`, {
        email: contactInfo,
        type: type
      });

      if (response.data.status === 'success') {
        // Test amaçlı olarak kodu konsola yazdır
        console.log('Yeni doğrulama kodu:', response.data.data.verificationCode);
        
        setTimer(60);
        setCanResend(false);
        Alert.alert('Başarılı', 'Doğrulama kodu yeniden gönderildi.');
      }
    } catch (error) {
      console.error('Kod yeniden gönderme hatası:', error.message);
      if (error.response) {
        console.error('Hata durumu:', error.response.status);
        console.error('Hata verileri:', error.response.data);
      }
      Alert.alert('Hata', 'Doğrulama kodu gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Kod girildiğinde bir sonraki inputa geç
  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      text = text[0]; // Sadece tek karakter al
    }
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Eğer kod girildiyse ve sonuncu input değilse, bir sonraki inputa geç
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Tüm kodlar girildiyse klavyeyi kapat
    if (newCode.every(digit => digit !== '')) {
      Keyboard.dismiss();
    }
  };

  // Backspace ile inputlar arası geçiş
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1].focus();
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
          <Text style={styles.headerTitle}>Doğrulama Kodu</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name={info.icon} size={60} color="#4982F3" />
          </View>
          
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.description}>{info.description}</Text>

          <View style={styles.codeContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TextInput
                key={i}
                ref={el => inputRefs.current[i] = el}
                style={styles.codeInput}
                maxLength={1}
                keyboardType="number-pad"
                value={code[i]}
                onChangeText={(text) => handleCodeChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                autoFocus={i === 0}
              />
            ))}
          </View>

          <CustomButton
            title="Doğrula"
            onPress={verifyCode}
            loading={loading}
            disabled={code.some(c => c === '')}
            type="primary"
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Kodu almadınız mı?</Text>
            {canResend ? (
              <TouchableOpacity onPress={resendCode} disabled={loading}>
                <Text style={styles.resendButton}>Yeniden Gönder</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>{timer} saniye sonra tekrar gönderebilirsiniz</Text>
            )}
          </View>
        </View>
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
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
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
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  verifyButton: {
    width: '100%',
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4982F3',
  },
  timerText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default VerificationCodeScreen;
