import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../context/ThemeContext';

const ServiceButton = ({ icon, title, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground }
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Icon name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    aspectRatio: 0.9,
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ServiceButton; 