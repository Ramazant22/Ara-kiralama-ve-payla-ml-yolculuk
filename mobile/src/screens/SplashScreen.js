import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LogoPlaceholder } from '../components/PlaceholderImages';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Burada uygulama başlangıç işlemleri yapılabilir
    // Örneğin: veri önbelleğe alma, yerel ayarları yükleme vb.
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LogoPlaceholder size={150} />
      <Text style={styles.title}>TakDrive</Text>
      <Text style={styles.subtitle}>Araç Paylaşım ve Kiralama Platformu</Text>
      <ActivityIndicator 
        style={styles.loader} 
        size="large" 
        color="#4982F3" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen; 