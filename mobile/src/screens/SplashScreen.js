import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  FlatList, 
  Animated
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 3 farklı onboarding ekranı
  const slides = [
    {
      id: '1',
      title: 'TAKDRIVE',
      description: 'GECE GİBİ HIZLI,\nIŞIK GİBİ TEMİZ.',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      dotColor: '#FFFFFF'
    },
    {
      id: '2',
      title: 'TAKDRIVE',
      description: 'SADELİKTE\nGÜÇ VAR.',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      dotColor: '#000000'
    },
    {
      id: '3',
      title: 'TAKDRIVE',
      description: 'IŞIĞIN\nPEŞİNDEN GİT.',
      backgroundColor: 'split',
      textColor: '#FFFFFF',
      dotColor: '#000000'
    }
  ];

  // İlk açılışta gösteriliyor mu kontrolünü temizle
  useEffect(() => {
    const resetOnboarding = async () => {
      try {
        await SecureStore.deleteItemAsync('hasSeenOnboarding');
        console.log("hasSeenOnboarding değeri silindi - onboarding gösterilecek");
      } catch (e) {
        console.log("SecureStore temizlenirken hata:", e);
      }
    };
    
    resetOnboarding();
  }, []);

  // Bir sonraki ekrana geçmek için fonksiyon
  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      slideRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Onboarding tamamlandığında devam et
      completeOnboarding();
    }
  };

  // Onboarding'i tamamla ve devam et
  const completeOnboarding = async () => {
    try {
      // Onboarding tamamlandı bayrağını kaydet
      await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
      console.log("Onboarding tamamlandı, hasSeenOnboarding = true olarak ayarlandı");
      
      // Token kontrolü yap
      const token = await SecureStore.getItemAsync('userToken');
      console.log("Token kontrolü: ", token ? "Token var" : "Token yok");
      
      // Çıkış yapılacak ekranı belirle
      const nextScreen = token ? 'Home' : 'Login';
      console.log(`${nextScreen} ekranına yönlendiriliyor`);
      
      // Yönlendirme yap
      navigation.reset({
        index: 0,
        routes: [{ name: nextScreen }]
      });
    } catch (error) {
      console.log('Onboarding tamamlama hatası:', error);
      // Hata olsa bile devam et
      navigation.replace('Login');
    }
  };

  // Atla butonu işlevi
  const skip = () => {
    completeOnboarding();
  };

  // Her bir slide itemı için bileşen
  const renderItem = ({ item }) => {
    let backgroundStyle = { backgroundColor: item.backgroundColor };
    let containerStyle = [styles.slide];
    
    if (item.backgroundColor === 'split') {
      // Siyah-beyaz bölünmüş arka plan
      containerStyle.push(styles.splitBackground);
      return (
        <View style={containerStyle}>
          {/* Sağ taraf beyaz panel */}
          <View style={styles.splitOverlay} />
          
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="location" size={80} color={item.textColor} />
            </View>
            
            <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
            
            <Text style={[styles.description, { color: item.textColor }]}>
              {item.description}
            </Text>
          </View>
          
          <View style={styles.indicatorContainer}>
            <View style={[styles.indicator, { backgroundColor: item.dotColor }]} />
          </View>
        </View>
      );
    } else {
      containerStyle.push(backgroundStyle);
      return (
        <View style={containerStyle}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="location" size={80} color={item.textColor} />
            </View>
            
            <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
            
            <Text style={[styles.description, { color: item.textColor }]}>
              {item.description}
            </Text>
          </View>
          
          <View style={styles.indicatorContainer}>
            <View style={[styles.indicator, { backgroundColor: item.dotColor }]} />
          </View>
        </View>
      );
    }
  };

  // Indicator dots için render fonksiyonu
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((slide, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          const dotWidth = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });
          
          // Noktanın rengi bulunduğumuz slide'a göre değişecek
          let dotColor = slides[currentIndex].dotColor;
          
          return (
            <Animated.View 
              key={index} 
              style={[
                styles.dot, 
                { 
                  width: dotWidth, 
                  opacity,
                  backgroundColor: dotColor 
                }
              ]} 
            />
          );
        })}
      </View>
    );
  };

  // Onboarding ekranlarını göster
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.skipButton, 
          { backgroundColor: 'transparent' }
        ]} 
        onPress={skip}
      >
        <Text style={[
          styles.skipText, 
          { color: slides[currentIndex].textColor }
        ]}>
          Atla
        </Text>
      </TouchableOpacity>
      
      <FlatList
        ref={slideRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />
      
      {renderDots()}
      
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: 'transparent' }
        ]}
        onPress={goToNextSlide}
      >
        <Text style={[
          styles.buttonText, 
          { color: slides[currentIndex].textColor }
        ]}>
          {currentIndex === slides.length - 1 ? 'Başla' : 'İlerle'}
        </Text>
        <MaterialCommunityIcons 
          name="arrow-right" 
          size={24} 
          color={slides[currentIndex].textColor} 
          style={styles.buttonIcon} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitBackground: {
    backgroundColor: '#000000',
    position: 'relative',
  },
  splitOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 36,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  indicator: {
    height: 4,
    width: 60,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 100,
    right: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default SplashScreen;