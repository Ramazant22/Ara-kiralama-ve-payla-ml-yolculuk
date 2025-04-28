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
import { COLORS, globalStyles } from '../styles/globalStyles';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const { register, isLoading, error } = useContext(AuthContext);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);

  // Hata mesajını izleyen useEffect
  useEffect(() => {
    if (error && registrationAttempted) {
      Alert.alert(
        "Kayıt Hatası",
        error,
        [{ text: "Tamam", onPress: () => setRegistrationAttempted(false) }]
      );
    }
  }, [error, registrationAttempted]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Değer değiştiğinde o alana ait hatayı temizle
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // İsim doğrulama
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'İsim alanı zorunludur';
    }
    
    // Soyisim doğrulama
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyisim alanı zorunludur';
    }
    
    // E-posta doğrulama
    if (!formData.email) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    // Telefon doğrulama
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Telefon alanı zorunludur';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz';
    }
    
    // Şifre doğrulama
    if (!formData.password) {
      newErrors.password = 'Şifre alanı zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    // Şifre onay doğrulama
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı zorunludur';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Success state'ini kaldırdık

  const handleRegister = async () => {
    console.log('Kayıt butonuna tıklandı');
    
    if (validate()) {
      // Backend'in beklediği formata uygun veri hazırlama
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullname: `${formData.firstName} ${formData.lastName}`, // Backend için fullname alanı da ekleyelim
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      };
      
      setRegistrationAttempted(true);
      
      // Debug için detaylı bilgi yazdır
      console.log('Gönderilecek kayıt verileri:', JSON.stringify(userData));
      
      try {
        // Kayıt işlemini başlat ve sonuç bekle
        const result = await register(userData);
        
        // Eğer kayıt başarılıysa direkt giriş sayfasına yönlendir
        if (result && result.success) {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Register error:', error);
        Alert.alert(
          "Kayıt Hatası",
          "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.",
          [{ text: "Tamam" }]
        );
      }
    } else {
      Alert.alert(
        "Form Hatası",
        "Lütfen formdaki hataları düzeltin ve tekrar deneyin.",
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Geri</Text>
            </TouchableOpacity>
            
            <LogoPlaceholder size={80} />
            
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Araç paylaşım ve kiralama platformuna kayıt olun
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <CustomInput
              label="İsim"
              placeholder="İsminizi girin"
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              error={errors.firstName}
              icon="person"
              autoCapitalize="words"
            />

            <CustomInput
              label="Soyisim"
              placeholder="Soyisminizi girin"
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              error={errors.lastName}
              icon="person"
              autoCapitalize="words"
            />

            <CustomInput
              label="E-posta"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              error={errors.email}
              icon="email"
            />

            <CustomInput
              label="Telefon"
              placeholder="Telefon numaranızı girin"
              value={formData.phoneNumber}
              onChangeText={(value) => handleChange('phoneNumber', value)}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              icon="phone"
            />

            <CustomInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              isPassword={true}
              error={errors.password}
              icon="lock"
            />

            <CustomInput
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              isPassword={true}
              error={errors.confirmPassword}
              icon="lock"
            />

            <CustomButton
              title={isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
              onPress={() => {
                console.log('Kayıt Ol butonuna tıklandı');
                handleRegister();
              }}
              loading={isLoading}
              disabled={isLoading}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Giriş Yap linkine tıklandı');
                  try {
                    navigation.navigate('Login');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    Alert.alert('Hata', 'Navigasyon hatası: ' + error.message);
                  }
                }}
              >
                <Text style={styles.loginLink}>Giriş Yap</Text>
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
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  backButtonText: {
    color: '#4982F3',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
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

export default RegisterScreen; 