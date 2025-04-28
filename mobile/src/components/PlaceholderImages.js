import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Logo placeholder
export const LogoPlaceholder = ({ size = 100 }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={styles.logoText}>TakDrive</Text>
  </View>
);

// Araba görseli placeholder
export const CarPlaceholder = ({ width = 240, height = 120 }) => (
  <View style={[styles.carContainer, { width, height }]}>
    <Text style={styles.placeholderText}>Araç Görseli</Text>
  </View>
);

// Avatar placeholder
export const AvatarPlaceholder = ({ size = 40, name = "Kullanıcı" }) => {
  // İsmin baş harflerini alma
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: '#4982F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  carContainer: {
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#4982F3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default {
  LogoPlaceholder,
  CarPlaceholder,
  AvatarPlaceholder
}; 