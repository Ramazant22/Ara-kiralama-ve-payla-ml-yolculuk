import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { LogoPlaceholder } from '../components/PlaceholderImages';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, globalStyles } from '../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const { login, isLoading, error, userToken } = useContext(AuthContext);

  // Hata mesajını izleyen useEffect
  useEffect(() => {
    if (error && loginAttempted) {
      Alert.alert(
        "Giriş Hatası",
        error,
        [{ text: "Tamam", onPress: () => setLoginAttempted(false) }]
      );
    }
  }, [error, loginAttempted]);
  
  // Giriş başarılı olduğunda anasayfaya yönlendir
  useEffect(() => {
    if (userToken) {
      // Kullanıcı giriş yaptı, anasayfaya yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [userToken, navigation]);

  const validate = () => {
    let isValid = true;
    
    // E-posta doğrulama
    if (!email) {
      setEmailError('E-posta adresinizi giriniz');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      isValid = false;
    } else {
      setEmailError(null);
    }
    
    // Şifre doğrulama
    if (!password) {
      setPasswordError('Şifrenizi giriniz');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    console.log('Giriş butonuna tıklandı');
    
    if (validate()) {
      setLoginAttempted(true);
      
      // Debug için bilgi yazdır
      console.log(`Giriş yapılıyor - Email: ${email}, Password: ${password.substring(0, 1)}****`);
      
      try {
        // Giriş işlemini başlat ve tamamlanmasını bekle
        const result = await login(email, password);
        
        // Giriş başarılı olduysa ana sayfaya yönlendir
        if (result && result.success) {
          console.log('Giriş başarılı, ana sayfaya yönlendiriliyor');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert(
          "Giriş Hatası",
          "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.",
          [{ text: "Tamam" }]
        );
      }
    } else {
      Alert.alert(
        "Form Hatası",
        "Lütfen e-posta ve şifrenizi doğru girdiğinizden emin olun.",
        [{ text: "Tamam" }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.BACKGROUND }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={80} color={theme?.primary || "#FFFFFF"} />
            </View>
            <Text style={[styles.title, { color: theme?.text?.primary || '#FFFFFF' }]}>TakDrive'a Hoş Geldiniz</Text>
            <Text style={[styles.subtitle, { color: theme?.text?.secondary || '#CCCCCC' }]}>
              Araç paylaşım ve kiralama platformuna giriş yapın
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <CustomInput
              label="E-posta"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={emailError}
              icon="email"
            />

            <CustomInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              error={passwordError}
              icon="lock"
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {
                // Şifremi unuttum sayfasına yönlendirme
              }}
            >
              <Text style={[styles.forgotPasswordText, { color: theme?.primary || '#FFFFFF' }]}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={() => {
                console.log('Giriş Yap butonuna tıklandı');
                handleLogin();
              }}
              loading={isLoading}
              disabled={isLoading}
              color={theme?.primary || '#FFFFFF'}
            />

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: theme?.text?.secondary || '#CCCCCC' }]}>Hesabınız yok mu?</Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Kayıt Ol linkine tıklandı');
                  try {
                    navigation.navigate('Register');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    Alert.alert('Hata', 'Navigasyon hatası: ' + error.message);
                  }
                }}
              >
                <Text style={[styles.signupLink, { color: theme?.primary || '#FFFFFF' }]}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginScreen;