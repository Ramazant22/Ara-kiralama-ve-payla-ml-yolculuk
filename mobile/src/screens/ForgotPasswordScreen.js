import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title,
  HelperText,
  ActivityIndicator 
} from 'react-native-paper';
import { authService } from '../services/authService';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
      Alert.alert(
        'Başarılı', 
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Hata', 
        error.response?.data?.message || 'Bir hata oluştu'
      );
    }
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>E-posta Gönderildi</Title>
              <Text style={styles.successText}>
                Şifre sıfırlama bağlantısı {email} adresine gönderildi. 
                E-posta kutunuzu kontrol edin.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}
                buttonColor={colors.primary}
                textColor={colors.onPrimary}
              >
                Giriş Sayfasına Dön
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Şifremi Unuttum</Title>
            <Text style={styles.subtitle}>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </Text>
            
            <TextInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.text.secondary,
                }
              }}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
            
            <Button
              mode="contained"
              onPress={handleForgotPassword}
              style={styles.button}
              disabled={isLoading}
              buttonColor={colors.primary}
              textColor={colors.onPrimary}
            >
              {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : 'Bağlantı Gönder'}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.textButton}
              textColor={colors.primary}
            >
              Giriş Sayfasına Dön
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
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
    justifyContent: 'center',
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
    lineHeight: 20,
  },
  successText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  textButton: {
    marginTop: spacing.sm,
  },
}); 