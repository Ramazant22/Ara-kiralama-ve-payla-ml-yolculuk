import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Carousel = ({ data, renderItem, onChangeSlide }) => {
  const { theme } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      onChangeSlide && onChangeSlide(newIndex);
    }
  };

  useEffect(() => {
    // Otomatik slide değiştirme (opsiyonel)
    const timer = setInterval(() => {
      if (data.length > 1) {
        const nextIndex = (currentIndex + 1) % data.length;
        
        flatListRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        
        setCurrentIndex(nextIndex);
        onChangeSlide && onChangeSlide(nextIndex);
      }
    }, 5000); // 5 saniyede bir değiştir
    
    return () => clearInterval(timer);
  }, [currentIndex, data.length, onChangeSlide]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        ref={flatListRef}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
      
      {/* Indicators */}
      {data.length > 1 && (
        <View style={styles.indicatorContainer}>
          {data.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: 'clamp',
            });
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: theme.primary,
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#FF4500',
  },
});

export default Carousel; 