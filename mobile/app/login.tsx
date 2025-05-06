import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';
import authService from '../src/api/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleLogin = async () => {
    let isValid = true;
    
    // Email validation
    if (!email.trim()) {
      setEmailError('E-posta adresi gerekli');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Şifre gerekli');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (isValid) {
      setLoading(true);
      
      try {
        // API üzerinden giriş yap
        const response = await authService.login(email, password);
        
        setLoading(false);
        
        // Kullanıcı durumuna göre yönlendirme
        if (response.user) {
          // E-posta doğrulanmamışsa
          if (!response.user.isEmailVerified) {
            router.replace('/unverified-email');
            return;
          }
          
          // İki faktörlü doğrulama aktifse
          if (response.user.twoFactorEnabled && !response.user.twoFactorVerified) {
            router.replace('/two-factor-auth');
            return;
          }
          
          // Her şey tamamsa ana sayfaya yönlendir
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error: any) {
        setLoading(false);
        
        if (error.response?.status === 401) {
          Alert.alert('Giriş Başarısız', 'E-posta veya şifre yanlış');
        } else if (error.response?.data?.message) {
          Alert.alert('Hata', error.response.data.message);
        } else {
          Alert.alert('Hata', 'Giriş yaparken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        }
        
        console.error('Login hatası:', error);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>TD</Text>
              </View>
              <Text style={styles.appName}>TakDrive</Text>
              <Text style={styles.tagline}>Araç Kiralama ve Yolculuk Paylaşımı</Text>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Giriş Yap</Text>

              <View style={styles.inputContainer}>
                <FontAwesome5 name="envelope" size={18} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              
              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={18} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>veya</Text>
                <View style={styles.orLine} />
              </View>
              
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                  <FontAwesome5 name="google" size={18} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                  <FontAwesome5 name="facebook" size={18} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Hesabınız yok mu?</Text>
                <TouchableOpacity 
                  style={styles.registerButton}
                  onPress={() => router.push('/register' as any)}
                >
                  <Text style={styles.registerLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,69,0,0.5)',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orText: {
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  registerButton: {
    marginLeft: 5,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 