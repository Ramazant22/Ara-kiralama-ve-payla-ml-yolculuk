import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }
    
    // Gerçek uygulamada burası API'ye istek gönderecek
    Alert.alert(
      'Başarılı',
      'Mesajınız gönderildi. En kısa sürede size dönüş yapacağız.',
      [{ text: 'Tamam' }]
    );
    
    // Form alanlarını temizle
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'İletişim',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Bize Ulaşın</Text>
            <Text style={styles.subtitle}>
              Sorularınız, önerileriniz veya şikayetleriniz için formu doldurun, en kısa sürede size dönüş yapacağız.
            </Text>
          </View>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <FontAwesome5 name="envelope" size={18} color={colors.primary} style={styles.contactIcon} />
              <Text style={styles.contactText}>destek@takdrive.com</Text>
            </View>
            <View style={styles.contactItem}>
              <FontAwesome5 name="phone-alt" size={18} color={colors.primary} style={styles.contactIcon} />
              <Text style={styles.contactText}>+90 (212) 555 44 33</Text>
            </View>
            <View style={styles.contactItem}>
              <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} style={styles.contactIcon} />
              <Text style={styles.contactText}>Levent, İstanbul</Text>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="user" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adınız Soyadınız"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="envelope" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta Adresiniz"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome5 name="heading" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Konu"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
            
            <View style={styles.messageContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Mesajınız"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 22,
  },
  contactInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  contactIcon: {
    width: 25,
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 40,
    color: colors.text,
    fontSize: 16,
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  messageInput: {
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 