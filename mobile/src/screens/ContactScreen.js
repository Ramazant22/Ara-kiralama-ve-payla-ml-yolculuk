import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const ContactScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { userInfo } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Konu gereklidir';
    if (!message.trim()) newErrors.message = 'Mesaj gereklidir';
    if (message.trim().length < 10) newErrors.message = 'Mesaj en az 10 karakter olmalıdır';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/contact`,
        {
          userId: userInfo?._id,
          subject,
          message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      
      setLoading(false);
      if (response.status === 201) {
        Alert.alert(
          'Başarılı',
          'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
          [{ text: 'Tamam', onPress: () => {
            setSubject('');
            setMessage('');
          }}]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Mesajınız gönderilirken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+905551234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:iletisim@takdrive.com');
  };

  const handleLocation = () => {
    Linking.openURL('https://maps.google.com/?q=40.9909,29.0213');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Bize Ulaşın</Text>
      
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Konu</Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: errors.subject ? 'red' : theme.colors.border
            }
          ]}
          placeholder="Konunuz"
          placeholderTextColor={theme.colors.placeholder}
          value={subject}
          onChangeText={setSubject}
        />
        {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
        
        <Text style={[styles.label, { color: theme.colors.text }]}>Mesajınız</Text>
        <TextInput
          style={[
            styles.messageInput,
            { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: errors.message ? 'red' : theme.colors.border 
            }
          ]}
          placeholder="Mesajınız..."
          placeholderTextColor={theme.colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
        {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contactInfoContainer}>
        <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
          İletişim Bilgilerimiz
        </Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
          <FontAwesome name="phone" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.text }]}>
            +90 555 123 45 67
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
          <Ionicons name="mail" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.text }]}>
            iletisim@takdrive.com
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleLocation}>
          <Ionicons name="location" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.text }]}>
            İstanbul, Türkiye
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    marginTop: -8,
  },
  contactInfoContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ContactScreen;