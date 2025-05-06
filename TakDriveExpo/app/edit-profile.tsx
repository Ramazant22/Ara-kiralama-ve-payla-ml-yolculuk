import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function EditProfileScreen() {
  const router = useRouter();
  
  // Kullanıcı bilgileri state'i
  const [user, setUser] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@mail.com',
    phone: '+90 555 123 4567',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Araç kiralama ve yolculuk paylaşımı konularına ilgi duyuyorum. Sık sık İstanbul-Ankara arası seyahat ediyorum.'
  });
  
  // Form değerlerini takip eden state'ler
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  
  // Değişiklikleri kaydetme işlemi
  const handleSave = () => {
    // Gerçek uygulamada API'ye kaydetme işlemi burada yapılır
    setUser({
      ...user,
      name,
      phone,
      bio
    });
    
    Alert.alert(
      "Başarılı",
      "Profil bilgileriniz güncellendi.",
      [
        { 
          text: "Tamam", 
          onPress: () => router.back() 
        }
      ]
    );
  };
  
  // Profil fotoğrafı değiştirme işlemi
  const handleChangePhoto = () => {
    // Gerçek uygulamada resim seçme ve yükleme işlemi burada yapılır
    Alert.alert(
      "Bilgi",
      "Resim seçme özelliği şu anda geliştirme aşamasındadır."
    );
  };
  
  // Kimlik doğrulama sayfasına yönlendirme
  const goToIdentityVerification = () => {
    router.push('/identity-verification' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Profil Düzenle',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Profil Fotoğrafı */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: user.photo }} style={styles.profilePhoto} />
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
          >
            <FontAwesome5 name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Alanları */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ad Soyad"
              placeholderTextColor="#757575"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={user.email}
              editable={false}
              placeholder="E-posta"
              placeholderTextColor="#757575"
            />
            <Text style={styles.helperText}>
              E-posta adresinizi değiştirmek için müşteri hizmetleriyle iletişime geçin.
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefon"
              placeholderTextColor="#757575"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hakkımda</Text>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendiniz hakkında kısa bir bilgi girin"
              placeholderTextColor="#757575"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Kimlik Doğrulama Butonu */}
        <TouchableOpacity 
          style={styles.verificationButton}
          onPress={goToIdentityVerification}
        >
          <FontAwesome5 name="id-card" size={18} color="#FFFFFF" />
          <Text style={styles.verificationButtonText}>
            Kimlik Bilgilerini Düzenle
          </Text>
        </TouchableOpacity>
        
        {/* Kaydetme Butonu */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  changePhotoText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 