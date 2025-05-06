import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function EmailVerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Kullanıcının girdiği kodu değiştir
  const handleChangeCode = (text: string, index: number) => {
    if (text.length > 1) {
      // Kullanıcı birden fazla karakter yapıştırdıysa
      const characters = text.split('');
      const newCode = [...code];
      
      for (let i = 0; i < characters.length && index + i < code.length; i++) {
        newCode[index + i] = characters[i];
      }
      
      setCode(newCode);
      setFocusedIndex(Math.min(index + characters.length, code.length - 1));
    } else {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      if (text !== '' && index < code.length - 1) {
        setFocusedIndex(index + 1);
      }
    }
  };
  
  // Girilen kodu doğrula
  const verifyCode = () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli doğrulama kodunu giriniz');
      return;
    }
    
    // Gerçek uygulamada API çağrısı yapılacak
    // Burada test için demo kod
    const demoCode = '123456';
    
    if (enteredCode === demoCode) {
      Alert.alert(
        'Başarılı',
        'E-posta adresiniz doğrulandı!',
        [
          { 
            text: 'Tamam', 
            onPress: () => router.replace('/(tabs)') 
          }
        ]
      );
    } else {
      Alert.alert('Hata', 'Girdiğiniz kod yanlış. Lütfen tekrar deneyiniz.');
    }
  };
  
  // Yeni kod gönder
  const resendCode = () => {
    // Gerçek uygulamada API çağrısı yapılacak
    Alert.alert('Bilgi', 'Yeni doğrulama kodu e-posta adresinize gönderildi');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'E-posta Doğrulama',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={styles.content}>
        <FontAwesome5 name="envelope-open-text" size={80} color={colors.primary} style={styles.icon} />
        
        <Text style={styles.title}>E-posta Adresinizi Doğrulayın</Text>
        
        <Text style={styles.description}>
          E-posta adresinize 6 haneli bir doğrulama kodu gönderdik. Lütfen hesabınızı doğrulamak için bu kodu girin.
        </Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.codeInput,
                focusedIndex === index && styles.codeInputFocused
              ]}
              value={digit}
              onChangeText={(text) => handleChangeCode(text, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
          <Text style={styles.verifyButtonText}>Doğrula</Text>
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Kod gelmediyse</Text>
          <TouchableOpacity onPress={resendCode}>
            <Text style={styles.resendLink}>Yeniden Gönder</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.helpContainer}>
          <FontAwesome5 name="info-circle" size={16} color={colors.primary} style={styles.helpIcon} />
          <Text style={styles.helpText}>
            Hesabınızı doğrulamak için e-posta adresinize gönderilen kodu girmeniz gerekmektedir. Spam klasörünüzü kontrol etmeyi unutmayın.
          </Text>
        </View>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  codeInputFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,69,0,0.1)',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: colors.secondary,
    marginRight: 5,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,69,0,0.1)',
    borderRadius: 10,
    padding: 15,
    maxWidth: '100%',
  },
  helpIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  helpText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
    lineHeight: 20,
  },
}); 