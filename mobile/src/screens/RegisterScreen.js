import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title,
  HelperText,
  ActivityIndicator,
  Checkbox
} from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    }
    
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Doğum tarihi gerekli';
    } else {
      // Basit tarih formatı kontrolü (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Tarih formatı: YYYY-MM-DD (örn: 1990-01-15)';
      } else {
        // Yaş kontrolü (18 yaş minimum)
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        let calculatedAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }

        if (calculatedAge < 18) {
          newErrors.dateOfBirth = 'En az 18 yaşında olmalısınız';
        }
      }
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Kullanım şartlarını kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      password: formData.password,
    });
    
    if (!result.success) {
      Alert.alert('Hata', result.message);
    }
    
    setIsLoading(false);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputTheme = {
    colors: {
      primary: colors.primary,
      outline: colors.text.secondary,
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Kayıt Ol</Title>
            <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
            
            <TextInput
              label="Ad"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.firstName}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.firstName}>
              {errors.firstName}
            </HelperText>
            
            <TextInput
              label="Soyad"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.lastName}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.lastName}>
              {errors.lastName}
            </HelperText>
            
            <TextInput
              label="E-posta"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
            
            <TextInput
              label="Telefon"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.phone}
              theme={inputTheme}
              placeholder="05551234567"
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone}
            </HelperText>
            
            <TextInput
              label="Doğum Tarihi"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateFormData('dateOfBirth', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.dateOfBirth}
              theme={inputTheme}
              placeholder="1990-01-15 (YYYY-MM-DD)"
            />
            <HelperText type="error" visible={!!errors.dateOfBirth}>
              {errors.dateOfBirth}
            </HelperText>
            
            <TextInput
              label="Şifre"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              error={!!errors.password}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
            
            <TextInput
              label="Şifre Tekrar"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              error={!!errors.confirmPassword}
              theme={inputTheme}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>
            
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptTerms(!acceptTerms)}
                uncheckedColor={colors.text.secondary}
                color={colors.primary}
              />
              <Text style={styles.checkboxText}>
                Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
              </Text>
            </View>
            <HelperText type="error" visible={!!errors.terms}>
              {errors.terms}
            </HelperText>
            
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              disabled={isLoading}
              buttonColor={colors.primary}
              textColor={colors.onPrimary}
            >
              {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : 'Kayıt Ol'}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.textButton}
              textColor={colors.primary}
            >
              Zaten hesabınız var mı? Giriş yapın
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  card: {
    elevation: elevation.medium,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text.secondary,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkboxText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  textButton: {
    marginTop: spacing.sm,
  },
}); 