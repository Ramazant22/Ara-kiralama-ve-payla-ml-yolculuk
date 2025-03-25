import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  keyboardType = 'default',
  error = null,
  style = {},
  icon = null,
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  onBlur
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled
        ]}
      >
        {icon && (
          <Icon name={icon} size={20} color="#888" style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          maxLength={maxLength}
          placeholderTextColor="#888"
        />
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#4982F3',
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  }
});

export default CustomInput; 