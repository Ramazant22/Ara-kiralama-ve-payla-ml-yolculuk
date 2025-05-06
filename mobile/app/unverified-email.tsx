import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function UnverifiedEmailPage() {
  const router = useRouter();
  const userEmail = 'kullanici@ornek.com'; // Gerçek uygulamada kullanıcı bilgilerinden alınır
  
  // E-posta doğrulama bağlantısını yeniden gönder
  const resendVerificationEmail = () => {
    // Gerçek uygulamada API çağrısı yapılacak
    alert('Doğrulama e-postası yeniden gönderildi. Lütfen gelen kutunuzu kontrol edin.');
  };
  
  // E-posta doğrulama sayfasına git
  const goToEmailVerification = () => {
    // Rota belirten string normalde router.push('email-verification') olurdu
    // Ancak şimdilik TypeScript hatasından kaçınmak için boş bırakıyoruz
    // Gerçek uygulamada doğru rota ile güncellenmelidir
    alert('E-posta doğrulama sayfasına yönlendirileceksiniz');
  };
  
  // E-posta adresini güncelle
  const updateEmail = () => {
    // Gerçek uygulamada e-posta güncelleme sayfasına yönlendirilir
    alert('E-posta adresinizi güncellemek için profil sayfasına yönlendirileceksiniz.');
    router.push('/(tabs)/profile');
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
        <View style={styles.warningIconContainer}>
          <FontAwesome5 name="exclamation-triangle" size={60} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>E-posta Adresiniz Doğrulanmadı</Text>
        
        <Text style={styles.description}>
          Hesabınızın tam erişim sağlayabilmesi ve tüm özellikleri kullanabilmesi için lütfen e-posta adresinizi doğrulayın.
        </Text>
        
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Doğrulanacak E-posta:</Text>
          <Text style={styles.emailValue}>{userEmail}</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={resendVerificationEmail}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Doğrulama E-postasını Yeniden Gönder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={goToEmailVerification}
          >
            <FontAwesome5 name="envelope-open-text" size={16} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Doğrulama Kodunu Gir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={updateEmail}
          >
            <FontAwesome5 name="edit" size={16} color={colors.text} style={styles.buttonIcon} />
            <Text style={styles.tertiaryButtonText}>E-posta Adresimi Güncelle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <FontAwesome5 name="info-circle" size={16} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            E-posta doğrulama, hesap güvenliğiniz için önemlidir. Doğrulama e-postasını alamadıysanız, spam klasörünüzü kontrol etmeyi unutmayın.
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
  warningIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,69,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 30,
  },
  emailLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,69,0,0.1)',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,69,0,0.1)',
    borderRadius: 10,
    padding: 15,
    maxWidth: '100%',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
    lineHeight: 20,
  },
}); 