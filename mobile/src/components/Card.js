import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Genel amaçlı kart bileşeni
 * @param {Object} props Component props
 * @param {string} props.title Kart başlığı
 * @param {string} props.subtitle Kart alt başlığı (opsiyonel)
 * @param {string} props.image Kart resmi URL (opsiyonel)
 * @param {function} props.onPress Karta tıklama işlevi
 * @param {boolean} props.shadow Gölge eklemek için (varsayılan true)
 * @param {React.ReactNode} props.children Kart içeriği (opsiyonel)
 * @param {Object} props.style Ek stil özellikleri (opsiyonel)
 */
const Card = ({ 
  title, 
  subtitle, 
  image, 
  onPress, 
  shadow = true, 
  children,
  style,
  rightIcon,
  leftIcon
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        shadow && styles.shadow,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image && (
        <Image 
          source={{ uri: image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      
      <View style={styles.contentContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={24} color="#2E5BFF" />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
        
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            <Ionicons name={rightIcon} size={24} color="#2E5BFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F2F5'
  },
  contentContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171A1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  rightIconContainer: {
    marginLeft: 8,
  }
});

export default Card;
