import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from './_layout';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // Splash ekranları içeriği
  const splashScreens = [
    {
      title: "TakDrive'a Hoş Geldiniz",
      subtitle: "Araç Kiralama ve Yolculuk Paylaşımı",
      description: "Türkiye'nin en büyük araç kiralama ve yolculuk paylaşımı platformuna hoş geldiniz!",
      icon: "car"
    },
    {
      title: "Araç Kiralayın",
      subtitle: "veya Kendi Aracınızı Kiraya Verin",
      description: "Binlerce araç seçeneği arasından size uygun olanı seçin veya kendi aracınızı kiraya vererek para kazanın.",
      icon: "key"
    },
    {
      title: "Yolculuk Paylaşın",
      subtitle: "Ekonomik ve Çevreci Seyahat",
      description: "Gideceğiniz yere daha uygun fiyatlarla gidin veya kendi yolculuğunuzu paylaşarak masrafları azaltın.",
      icon: "users"
    }
  ];

  // Sonraki ekrana geçiş
  const goToNextScreen = () => {
    if (currentScreen < splashScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Son ekrandan sonra login sayfasına git
      router.replace('/login');
    }
  };

  // Doğrudan login sayfasına atla
  const skipToLogin = () => {
    router.replace('/login');
  };

  // İlerleme göstergesi
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {splashScreens.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              currentScreen === index ? styles.activeDot : styles.inactiveDot
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipToLogin}>
        <Text style={styles.skipButtonText}>Atla</Text>
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <FontAwesome5 
          name={splashScreens[currentScreen].icon} 
          size={80} 
          color={colors.primary} 
        />
      </View>
      
      <Text style={styles.title}>{splashScreens[currentScreen].title}</Text>
      <Text style={styles.subtitle}>{splashScreens[currentScreen].subtitle}</Text>
      <Text style={styles.description}>{splashScreens[currentScreen].description}</Text>
      
      {renderDots()}
      
      <TouchableOpacity style={styles.nextButton} onPress={goToNextScreen}>
        <Text style={styles.nextButtonText}>
          {currentScreen < splashScreens.length - 1 ? 'İleri' : 'Başla'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 