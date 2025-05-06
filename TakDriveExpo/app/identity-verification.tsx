import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Doğrulama durumu türleri
type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';

// Doğrulama bilgisi arayüzü
interface VerificationInfo {
  identityNumber: string;
  drivingLicenseNumber: string;
  drivingLicenseClass: string;
  drivingLicenseIssueDate: string;
  drivingLicenseExpireDate: string;
  birthDate: string;
  birthPlace: string;
  status: VerificationStatus;
  consentToDataUse: boolean;
}

export default function IdentityVerificationScreen() {
  const router = useRouter();
  
  // Doğrulama bilgileri state'i
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo>({
    identityNumber: '',
    drivingLicenseNumber: '',
    drivingLicenseClass: '',
    drivingLicenseIssueDate: '',
    drivingLicenseExpireDate: '',
    birthDate: '',
    birthPlace: '',
    status: 'not_submitted',
    consentToDataUse: false
  });
  
  // Alanları güncelleyen fonksiyon
  const updateField = (field: keyof VerificationInfo, value: string | boolean) => {
    setVerificationInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Doğrulama durumuna göre renkler
  const getStatusColors = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'pending':
        return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      case 'rejected':
        return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      default:
        return { color: '#757575', backgroundColor: 'rgba(117, 117, 117, 0.1)' };
    }
  };
  
  // Doğrulama durum metinleri
  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return 'Doğrulandı';
      case 'pending':
        return 'İnceleniyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Gönderilmedi';
    }
  };
  
  // Doğrulama bilgilerini gönderme
  const handleSubmit = () => {
    // Validasyon kontrolleri
    if (verificationInfo.identityNumber.length !== 11) {
      return Alert.alert("Hata", "TC Kimlik Numarası 11 haneli olmalıdır.");
    }
    
    if (verificationInfo.drivingLicenseNumber.trim() === '') {
      return Alert.alert("Hata", "Ehliyet numarası zorunludur.");
    }
    
    if (verificationInfo.drivingLicenseClass.trim() === '') {
      return Alert.alert("Hata", "Ehliyet sınıfı zorunludur.");
    }
    
    if (!verificationInfo.consentToDataUse) {
      return Alert.alert("Hata", "Devam etmek için kişisel verilerin işlenmesine izin vermeniz gerekmektedir.");
    }
    
    // Gerçek uygulamada API'ye gönderme işlemi burada yapılır
    setVerificationInfo(prev => ({
      ...prev,
      status: 'pending'
    }));
    
    Alert.alert(
      "Başarılı",
      "Kimlik doğrulama bilgileriniz incelenmek üzere gönderildi. Doğrulama durumunuzu profil sayfanızdan takip edebilirsiniz.",
      [
        { 
          text: "Tamam", 
          onPress: () => router.back() 
        }
      ]
    );
  };
  
  // Doküman yükleme
  const handleUploadDocument = (documentType: string) => {
    // Gerçek uygulamada doküman seçme ve yükleme işlemi burada yapılır
    Alert.alert(
      "Bilgi",
      `${documentType} yükleme özelliği şu anda geliştirme aşamasındadır.`
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Kimlik Doğrulama',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Durum Göstergesi */}
        {verificationInfo.status !== 'not_submitted' && (
          <View 
            style={[
              styles.statusContainer, 
              { backgroundColor: getStatusColors(verificationInfo.status).backgroundColor }
            ]}
          >
            <FontAwesome5 
              name={verificationInfo.status === 'verified' ? 'check-circle' : 
                   verificationInfo.status === 'pending' ? 'clock' : 'times-circle'} 
              size={20} 
              color={getStatusColors(verificationInfo.status).color} 
            />
            <Text 
              style={[
                styles.statusText, 
                { color: getStatusColors(verificationInfo.status).color }
              ]}
            >
              {getStatusText(verificationInfo.status)}
            </Text>
          </View>
        )}
        
        {/* Bilgilendirme Metni */}
        <View style={styles.infoBox}>
          <FontAwesome5 name="info-circle" size={20} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Araç kiralamak veya yolculuk paylaşımı yapabilmek için kimlik ve ehliyet 
            bilgilerinizi doğrulamanız gerekmektedir. Bilgileriniz güvenli şekilde saklanacak ve sadece doğrulama amacıyla kullanılacaktır.
          </Text>
        </View>
        
        {/* TC Kimlik Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>TC Kimlik Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TC Kimlik No</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.identityNumber}
              onChangeText={(text) => updateField('identityNumber', text)}
              placeholder="TC Kimlik No"
              placeholderTextColor="#757575"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doğum Tarihi</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.birthDate}
              onChangeText={(text) => updateField('birthDate', text)}
              placeholder="GG/AA/YYYY"
              placeholderTextColor="#757575"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doğum Yeri</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.birthPlace}
              onChangeText={(text) => updateField('birthPlace', text)}
              placeholder="Doğum Yeri"
              placeholderTextColor="#757575"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Kimlik Fotokopisi')}
          >
            <FontAwesome5 name="upload" size={16} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Kimlik Fotokopisi Yükle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Ehliyet Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ehliyet Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ehliyet No</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.drivingLicenseNumber}
              onChangeText={(text) => updateField('drivingLicenseNumber', text)}
              placeholder="Ehliyet No"
              placeholderTextColor="#757575"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ehliyet Sınıfı</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.drivingLicenseClass}
              onChangeText={(text) => updateField('drivingLicenseClass', text)}
              placeholder="B, BE, A2, vb."
              placeholderTextColor="#757575"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Verilme Tarihi</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.drivingLicenseIssueDate}
              onChangeText={(text) => updateField('drivingLicenseIssueDate', text)}
              placeholder="GG/AA/YYYY"
              placeholderTextColor="#757575"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Geçerlilik Tarihi</Text>
            <TextInput
              style={styles.textInput}
              value={verificationInfo.drivingLicenseExpireDate}
              onChangeText={(text) => updateField('drivingLicenseExpireDate', text)}
              placeholder="GG/AA/YYYY"
              placeholderTextColor="#757575"
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Ehliyet Fotokopisi')}
          >
            <FontAwesome5 name="upload" size={16} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Ehliyet Fotokopisi Yükle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Kişisel Verilerin İşlenmesine İzin */}
        <View style={styles.consentContainer}>
          <Switch
            value={verificationInfo.consentToDataUse}
            onValueChange={(value) => updateField('consentToDataUse', value)}
            trackColor={{ false: '#767577', true: `${colors.primary}80` }}
            thumbColor={verificationInfo.consentToDataUse ? colors.primary : '#f4f3f4'}
          />
          <Text style={styles.consentText}>
            Kişisel verilerimin TakDrive tarafından işlenmesine ve üçüncü taraf doğrulama hizmetleriyle paylaşılmasına izin veriyorum.
          </Text>
        </View>
        
        {/* Gönderme Butonu */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Doğrulama İsteği Gönder</Text>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  consentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 