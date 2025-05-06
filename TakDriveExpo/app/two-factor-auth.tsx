import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Zamanlayıcı başlat
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);
  
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
        'İki faktörlü doğrulama başarılı!',
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
    // Yeni bir kod isteyemez ise uyarı
    if (!canResend) {
      Alert.alert('Uyarı', `Lütfen ${timer} saniye sonra tekrar deneyiniz.`);
      return;
    }
    
    // Gerçek uygulamada API çağrısı yapılacak
    Alert.alert('Bilgi', 'Yeni doğrulama kodu gönderildi');
    
    // Zamanlayıcıyı sıfırla
    setTimer(60);
    setCanResend(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'İki Faktörlü Doğrulama',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={styles.content}>
        <FontAwesome5 name="shield-alt" size={80} color={colors.primary} style={styles.icon} />
        
        <Text style={styles.title}>İki Faktörlü Doğrulama</Text>
        
        <Text style={styles.description}>
          Güvenliğiniz için telefonunuza 6 haneli bir doğrulama kodu gönderdik. Lütfen oturumunuzu doğrulamak için bu kodu girin.
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
          <TouchableOpacity 
            onPress={resendCode}
            disabled={!canResend}
          >
            <Text 
              style={[
                styles.resendLink,
                !canResend && styles.resendLinkDisabled
              ]}
            >
              {canResend ? 'Yeniden Gönder' : `${timer} saniye bekleyin`}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.otherMethodsContainer}>
          <Text style={styles.otherMethodsTitle}>Diğer Doğrulama Yöntemleri</Text>
          
          <TouchableOpacity style={styles.methodButton}>
            <FontAwesome5 name="envelope" size={18} color={colors.primary} style={styles.methodIcon} />
            <Text style={styles.methodText}>E-posta ile Doğrula</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.methodButton}>
            <FontAwesome5 name="key" size={18} color={colors.primary} style={styles.methodIcon} />
            <Text style={styles.methodText}>Yedek Kod Kullan</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.helpContainer}>
          <FontAwesome5 name="info-circle" size={16} color={colors.primary} style={styles.helpIcon} />
          <Text style={styles.helpText}>
            İki faktörlü doğrulama, hesabınızı yetkisiz erişimlere karşı korur. Sorun yaşıyorsanız lütfen destek ekibimizle iletişime geçin.
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
  resendLinkDisabled: {
    color: colors.secondary,
  },
  otherMethodsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  otherMethodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  methodIcon: {
    marginRight: 15,
  },
  methodText: {
    fontSize: 16,
    color: colors.text,
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