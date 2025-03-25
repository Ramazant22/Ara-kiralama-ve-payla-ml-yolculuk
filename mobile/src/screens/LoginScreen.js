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
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { LogoPlaceholder } from '../components/PlaceholderImages';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const { login, isLoading, error } = useContext(AuthContext);

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

  const handleLogin = () => {
    if (validate()) {
      setLoginAttempted(true);
      Alert.alert("Bilgi", "Giriş yapılıyor. Lütfen bekleyin...");
      login(email, password);
    } else {
      Alert.alert(
        "Form Hatası",
        "Lütfen e-posta ve şifrenizi doğru girdiğinizden emin olun.",
        [{ text: "Tamam" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <LogoPlaceholder size={120} />
            <Text style={styles.title}>TakDrive'a Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
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
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupLink}>Kayıt Ol</Text>
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
    backgroundColor: '#FFFFFF',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    color: '#4982F3',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#333',
    fontSize: 14,
  },
  signupLink: {
    color: '#4982F3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#fde0dc',
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginScreen; 