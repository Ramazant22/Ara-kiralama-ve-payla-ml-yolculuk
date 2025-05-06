import React, { useState, useEffect } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import paymentService from '../src/api/services/paymentService';

export default function WithdrawScreen() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [balance, setBalance] = useState({ amount: 0, currency: 'TRY' });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  // Verileri yükle
  const loadData = async () => {
    try {
      setIsInitialLoading(true);
      
      // Bakiye bilgisini al
      const balanceData = await paymentService.getBalance();
      setBalance(balanceData.balance || { amount: 0, currency: 'TRY' });
      
      // Ödeme yöntemlerini al
      const methodsData = await paymentService.getPaymentMethods();
      // Sadece banka hesaplarını filtrele
      const bankAccounts = methodsData.paymentMethods?.filter(
        (method: any) => method.type === 'BANK_ACCOUNT'
      ) || [];
      setPaymentMethods(bankAccounts);
      
      // Varsayılan banka hesabını seç
      const defaultMethod = bankAccounts.find((method: any) => method.isDefault);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod._id);
      } else if (bankAccounts.length > 0) {
        setSelectedMethod(bankAccounts[0]._id);
      }
    } catch (error) {
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Para çekme işlemi
  const handleWithdraw = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const withdrawData = {
        amount: parseFloat(amount),
        paymentMethodId: selectedMethod,
      };
      
      await paymentService.requestWithdrawal(withdrawData);
      
      Alert.alert(
        'Başarılı', 
        'Para çekme talebiniz alınmıştır. İşlem 1-3 iş günü içinde tamamlanacaktır.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Para çekme işlemi sırasında bir hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Girişleri doğrula
  const validateInputs = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar giriniz');
      return false;
    }

    if (parseFloat(amount) > balance.amount) {
      Alert.alert('Hata', 'Çekilecek miktar bakiyenizden fazla olamaz');
      return false;
    }

    if (!selectedMethod) {
      Alert.alert('Hata', 'Lütfen bir banka hesabı seçiniz');
      return false;
    }

    return true;
  };

  // Miktar girişini formatlama
  const formatAmount = (text: string) => {
    // Sadece sayılar ve tek bir nokta işaretine izin ver
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Birden fazla nokta varsa, sadece ilkini koru
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  // Banka hesabını göster
  const renderBankMethod = (method: any) => {
    const isSelected = method._id === selectedMethod;
    
    return (
      <TouchableOpacity
        key={method._id}
        style={[styles.methodItem, isSelected && styles.selectedMethodItem]}
        onPress={() => setSelectedMethod(method._id)}
      >
        <View style={styles.methodIcon}>
          <MaterialCommunityIcons name="bank" size={24} color="#5ac8fa" />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>{method.name}</Text>
          <Text style={styles.methodSubtitle}>
            {method.iban ? `${method.iban.substring(0, 4)}...${method.iban.substring(method.iban.length - 4)}` : method.accountNumber}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#34c759" />
        )}
      </TouchableOpacity>
    );
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Para Çek</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Bakiye Bilgisi */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
          <Text style={styles.balanceAmount}>
            {balance.amount.toFixed(2)} {balance.currency}
          </Text>
        </View>

        {/* Miktar Girişi */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Çekilecek Miktar</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{balance.currency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => setAmount(formatAmount(text))}
            />
          </View>

          <TouchableOpacity
            style={styles.maxButton}
            onPress={() => setAmount(balance.amount.toString())}
          >
            <Text style={styles.maxButtonText}>Tüm Bakiyeyi Çek</Text>
          </TouchableOpacity>
        </View>

        {/* Banka Hesabı Seçimi */}
        <View style={styles.methodsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Banka Hesabı Seçin</Text>
            <TouchableOpacity onPress={() => router.push('/add-payment-method')}>
              <Text style={styles.addMethodText}>+ Yeni Ekle</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length > 0 ? (
            paymentMethods.map(method => renderBankMethod(method))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={50} color="#8e8e93" />
              <Text style={styles.emptyStateText}>Kayıtlı banka hesabınız bulunmamaktadır.</Text>
              <TouchableOpacity 
                style={styles.addBankButton}
                onPress={() => router.push('/add-payment-method')}
              >
                <Text style={styles.addBankButtonText}>Banka Hesabı Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Para Çekme Butonu */}
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!selectedMethod || isLoading) && styles.disabledButton
          ]}
          onPress={handleWithdraw}
          disabled={!selectedMethod || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.withdrawButtonText}>Para Çek</Text>
          )}
        </TouchableOpacity>

        {/* Bilgi Notu */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#0066cc" />
          <Text style={styles.infoText}>
            Para çekme işlemleri genellikle 1-3 iş günü içerisinde tamamlanmaktadır. 
            Minimum çekim miktarı 50 TL'dir.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8e8e93',
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
  balanceContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8e8e93',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#000',
  },
  maxButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  maxButtonText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  methodsContainer: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMethodText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedMethodItem: {
    borderColor: '#34c759',
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  addBankButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBankButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  withdrawButton: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#0066cc',
    lineHeight: 20,
  },
}); 