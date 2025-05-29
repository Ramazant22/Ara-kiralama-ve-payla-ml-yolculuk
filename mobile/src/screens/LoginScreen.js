import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title,
  HelperText,
  ActivityIndicator 
} from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (!result.success) {
      Alert.alert('Hata', result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Hoş Geldiniz</Title>
            <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
            
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
            
            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              error={!!errors.password}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.text.secondary,
                }
              }}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
            
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={isLoading}
              buttonColor={colors.primary}
              textColor={colors.onPrimary}
            >
              {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : 'Giriş Yap'}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.textButton}
              textColor={colors.primary}
            >
              Şifremi Unuttum
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.textButton}
              textColor={colors.primary}
            >
              Hesabınız yok mu? Kayıt olun
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