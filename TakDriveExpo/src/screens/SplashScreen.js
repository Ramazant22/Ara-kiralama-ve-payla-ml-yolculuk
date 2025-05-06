import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Api kontrolleri, otomatik login veya diğer başlangıç işlemleri
    const timer = setTimeout(() => {
      // Auth durumuna göre yönlendirme
      // Henüz auth context kurulu olmadığı için direkt Login'e yönlendiriyoruz
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Uygulama İsmi */}
      <Text style={styles.title}>TakDrive</Text>
      
      {/* Alt Başlık */}
      <Text style={styles.subtitle}>Araç Kiralama ve Yolculuk Paylaşımı</Text>
      
      {/* Yükleniyor Göstergesi */}
      <ActivityIndicator style={styles.loader} size="large" color="#FF4500" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 30,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen; 