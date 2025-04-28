import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({ 
  title, 
  onPress, 
  type = 'primary', 
  color,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {}
}) => {
  const theme = useTheme();
  
  // Buton rengi belirleme
  const buttonColor = color || (theme ? theme.primary : '#FF7700');
  const secondaryColor = theme ? theme.secondary : '#00BFFF';
  
  // Buton tıklama işlemi
  const handlePress = () => {
    console.log('CustomButton tıklandı:', title);
    
    // onPress fonksiyonu varsa çalıştır
    if (typeof onPress === 'function') {
      onPress();
    } else {
      console.error('onPress bir fonksiyon değildir veya tanımlanmamış');
    }
  };

  // Dışarıdan gelen stil nesneleri ile birleştir
  const buttonStyles = {
    ...styles.button,
    ...(type === 'primary' && { backgroundColor: buttonColor }),
    ...(type === 'secondary' && { 
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: buttonColor 
    }),
    ...(disabled && styles.disabledButton),
    ...style
  };

  const textStyles = {
    ...styles.text,
    ...(type === 'primary' && { color: '#000000' }),
    ...(type === 'secondary' && { color: buttonColor }),
    ...(type === 'tertiary' && { color: buttonColor }),
    ...(disabled && styles.disabledText),
    ...textStyle
  };

  // Pressable bileşeni kullanarak alternatif buton
  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles,
        pressed && styles.buttonPressed
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator color={type === 'primary' ? '#000000' : buttonColor} />
          ) : (
            <Text 
              style={[
                textStyles,
                pressed && styles.textPressed
              ]}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  textPressed: {
    opacity: 0.8,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  disabledText: {
    color: '#888888',
  }
});

export default CustomButton;