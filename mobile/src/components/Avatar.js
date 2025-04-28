import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Kullanıcı avatarı bileşeni
 * @param {Object} props Component props
 * @param {string} props.uri Avatar resim URL'si
 * @param {string} props.name Kullanıcı adı (resim yoksa inisyaller için)
 * @param {number} props.size Boyut (varsayılan 40)
 * @param {boolean} props.online Kullanıcı çevrimiçi durumu
 */
const Avatar = ({ 
  uri, 
  name = '', 
  size = 40, 
  online, 
  style 
}) => {
  // İnisyaller oluştur (ad yoksa boş string)
  const getInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {uri ? (
        <Image 
          source={{ uri }} 
          style={[styles.image, { width: size, height: size }]}
        />
      ) : (
        <View style={[
          styles.placeholder, 
          { 
            width: size, 
            height: size,
            backgroundColor: getRandomColor(name)
          }
        ]}>
          <Text style={[
            styles.initials,
            { fontSize: size * 0.4 }
          ]}>
            {getInitials()}
          </Text>
        </View>
      )}
      
      {online !== undefined && (
        <View style={[
          styles.statusIndicator,
          { 
            backgroundColor: online ? '#22C55E' : '#9CA3AF',
            width: size / 4,
            height: size / 4,
            borderWidth: size / 16
          }
        ]} />
      )}
    </View>
  );
};

// İsme göre tutarlı bir renk oluşturma
const getRandomColor = (name) => {
  if (!name) return '#2E5BFF';
  
  const colors = [
    '#2E5BFF', // Mavi
    '#FF9500', // Turuncu
    '#22C55E', // Yeşil
    '#EF4444', // Kırmızı
    '#8B5CF6', // Mor
    '#EC4899', // Pembe
  ];
  
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 100,
    borderColor: 'white',
  }
});

export default Avatar;
