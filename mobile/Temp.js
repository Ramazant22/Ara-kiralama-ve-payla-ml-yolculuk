import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const Temp = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>TakDrive</Text>
      <Text style={styles.subtitle}>Araç Paylaşım ve Kiralama Platformu</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={() => {}}
      >
        <Text style={styles.outlineButtonText}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#4982F3',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#4982F3',
    borderWidth: 1
  },
  outlineButtonText: {
    color: '#4982F3',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default Temp; 