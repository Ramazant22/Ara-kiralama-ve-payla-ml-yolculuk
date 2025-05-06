import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import paymentService from '../src/api/services/paymentService';

export default function AddPaymentMethodScreen() {
  const [paymentType, setPaymentType] = useState('CREDIT_CARD');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Kart numarasını formatla (her 4 rakamda bir boşluk ekle)
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/\d{1,4}/g);
    if (match) {
      return match.join(' ');
    }
    return cleaned;
  };

  // Son kullanma tarihini formatla (MM/YY)
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      return cleaned;
    } else {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
  };

  // Kart ekle
  const handleAddCard = async () => {
    if (!validateCardInputs()) {
      return;
    }

    try {
      setIsLoading(true);

      // Kart verilerini hazırla
      const cardData = {
        type: paymentType,
        name: cardName,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expiryMonth: expiryDate.split('/')[0],
        expiryYear: `20${expiryDate.split('/')[1]}`,
        cvv: cvv,
      };

      await paymentService.addPaymentMethod(cardData);
      Alert.alert('Başarılı', 'Ödeme yönteminiz başarıyla eklendi', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Ödeme yöntemi eklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Banka hesabı ekle
  const handleAddBankAccount = async () => {
    if (!validateBankInputs()) {
      return;
    }

    try {
      setIsLoading(true);

      // Banka hesabı verilerini hazırla
      const bankData = {
        type: 'BANK_ACCOUNT',
        name: bankName,
        accountNumber: accountNumber,
        iban: iban,
      };

      await paymentService.addPaymentMethod(bankData);
      Alert.alert('Başarılı', 'Banka hesabınız başarıyla eklendi', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Banka hesabı eklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kart girişlerini doğrula
  const validateCardInputs = () => {
    if (!cardName) {
      Alert.alert('Hata', 'Kart üzerindeki isim boş olamaz');
      return false;
    }

    if (cardNumber.replace(/\s+/g, '').length !== 16) {
      Alert.alert('Hata', 'Geçerli bir kart numarası giriniz');
      return false;
    }

    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert('Hata', 'Geçerli bir son kullanma tarihi giriniz (AA/YY)');
      return false;
    }

    const month = parseInt(expiryDate.split('/')[0], 10);
    if (month < 1 || month > 12) {
      Alert.alert('Hata', 'Geçerli bir ay giriniz (01-12)');
      return false;
    }

    if (cvv.length < 3) {
      Alert.alert('Hata', 'Geçerli bir CVV giriniz');
      return false;
    }

    return true;
  };

  // Banka girişlerini doğrula
  const validateBankInputs = () => {
    if (!bankName) {
      Alert.alert('Hata', 'Banka adı boş olamaz');
      return false;
    }

    if (!accountNumber) {
      Alert.alert('Hata', 'Hesap numarası boş olamaz');
      return false;
    }

    if (!iban || iban.length < 5) {
      Alert.alert('Hata', 'Geçerli bir IBAN giriniz');
      return false;
    }

    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Geri butonu ve başlık */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Ödeme Yöntemi Ekle</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Ödeme yöntemi seçimi */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              paymentType === 'CREDIT_CARD' && styles.selectedSegment
            ]}
            onPress={() => setPaymentType('CREDIT_CARD')}
          >
            <FontAwesome 
              name="credit-card" 
              size={20} 
              color={paymentType === 'CREDIT_CARD' ? '#0066cc' : '#8e8e93'} 
            />
            <Text 
              style={[
                styles.segmentText, 
                paymentType === 'CREDIT_CARD' && styles.selectedSegmentText
              ]}
            >
              Kredi Kartı
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              paymentType === 'BANK_ACCOUNT' && styles.selectedSegment
            ]}
            onPress={() => setPaymentType('BANK_ACCOUNT')}
          >
            <FontAwesome 
              name="bank" 
              size={20} 
              color={paymentType === 'BANK_ACCOUNT' ? '#0066cc' : '#8e8e93'} 
            />
            <Text 
              style={[
                styles.segmentText, 
                paymentType === 'BANK_ACCOUNT' && styles.selectedSegmentText
              ]}
            >
              Banka Hesabı
            </Text>
          </TouchableOpacity>
        </View>

        {paymentType === 'CREDIT_CARD' ? (
          /* Kredi Kartı Formu */
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Üzerindeki İsim</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Son Kullanma Tarihi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA/YY"
                  keyboardType="number-pad"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="number-pad"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={4}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddCard}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Kartı Ekle</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Banka Hesabı Formu */
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Banka Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Banka Adı"
                value={bankName}
                onChangeText={setBankName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hesap Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="Hesap Numarası"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IBAN</Text>
              <TextInput
                style={styles.input}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                value={iban}
                onChangeText={setIban}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddBankAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Hesabı Ekle</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={24} color="#34c759" />
          <Text style={styles.securityText}>
            Ödeme bilgileriniz güvenli bir şekilde saklanmaktadır. Kartınızdan sizin onayınız olmadan ödeme alınmayacaktır.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 10,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  selectedSegment: {
    backgroundColor: 'white',
  },
  segmentText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
  },
  selectedSegmentText: {
    color: '#0066cc',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
}); 