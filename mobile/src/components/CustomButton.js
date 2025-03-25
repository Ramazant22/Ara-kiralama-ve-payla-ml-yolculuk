import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false,
  loading = false,
  style = {},
  textStyle = {}
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`${type}Button`],
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={type === 'primary' ? '#FFFFFF' : '#4982F3'} />
      ) : (
        <Text 
          style={[
            styles.text, 
            styles[`${type}Text`],
            disabled && styles.disabledText,
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
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
  primaryButton: {
    backgroundColor: '#4982F3',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4982F3',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#4982F3',
  },
  tertiaryText: {
    color: '#4982F3',
  },
  disabledText: {
    color: '#888888',
  },
});

export default CustomButton; 