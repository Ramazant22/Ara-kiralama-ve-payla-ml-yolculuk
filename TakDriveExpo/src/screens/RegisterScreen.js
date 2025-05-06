import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { register } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [skipVerification, setSkipVerification] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!name) newErrors.name = 'İsim gerekli';
    if (!email) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta adresi girin';
    
    if (!password) newErrors.password = 'Şifre gerekli';
    else if (password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalı';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    
    if (!phone) newErrors.phone = 'Telefon numarası gerekli';
    
    if (!acceptedTerms) newErrors.terms = 'Koşulları kabul etmelisiniz';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      setLoading(true);
      try {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        await register(firstName, lastName, email, password, phone, skipVerification);
        Alert.alert(
          "Kayıt Başarılı", 
          "Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.",
          [{ text: "Tamam", onPress: () => navigation.navigate('Login') }]
        );
      } catch (error) {
        Alert.alert("Kayıt Hatası", error.message || "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.textColor }]}>Hesap Oluştur</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondaryColor }]}>
            TakDrive ailesine katılın ve araç kiralama ve yolculuk paylaşımı deneyiminin tadını çıkarın
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="user" size={18} color="#888888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, 
                { borderColor: errors.name ? '#FF5A5F' : theme.borderColor, 
                  color: theme.textColor }]}
              placeholder="Ad Soyad"
              placeholderTextColor="#888888"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="envelope" size={18} color="#888888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, 
                { borderColor: errors.email ? '#FF5A5F' : theme.borderColor, 
                  color: theme.textColor }]}
              placeholder="E-posta Adresi"
              placeholderTextColor="#888888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="phone" size={18} color="#888888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, 
                { borderColor: errors.phone ? '#FF5A5F' : theme.borderColor, 
                  color: theme.textColor }]}
              placeholder="Telefon Numarası"
              placeholderTextColor="#888888"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={18} color="#888888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, 
                { borderColor: errors.password ? '#FF5A5F' : theme.borderColor, 
                  color: theme.textColor }]}
              placeholder="Şifre"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-slash" : "eye"} size={18} color="#888888" />
            </TouchableOpacity>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={18} color="#888888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, 
                { borderColor: errors.confirmPassword ? '#FF5A5F' : theme.borderColor, 
                  color: theme.textColor }]}
              placeholder="Şifre Tekrarı"
              placeholderTextColor="#888888"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={18} color="#888888" />
            </TouchableOpacity>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
          
          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Icon name="check" size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.termsText, { color: theme.textSecondaryColor }]}>
              <Text>Kullanım Koşulları</Text> ve <Text>Gizlilik Politikası</Text>'nı kabul ediyorum
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.terms}</Text>}
          
          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setSkipVerification(!skipVerification)}
          >
            <View style={[styles.checkbox, skipVerification && styles.checkboxChecked]}>
              {skipVerification && <Icon name="check" size={12} color="#FFFFFF" />}
            </View>
            <Text style={[styles.termsText, { color: theme.textSecondaryColor }]}>
              Daha sonra doğrula (E-posta ve telefon doğrulamasını atla)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.textSecondaryColor }]}>
              Zaten hesabınız var mı?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#333333',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#888888',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 