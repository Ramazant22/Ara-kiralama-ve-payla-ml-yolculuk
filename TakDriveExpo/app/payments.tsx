import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Ödeme geçmişi için veri modeli
interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  type: 'rent' | 'deposit' | 'withdrawal' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

// Ödeme yöntemleri için veri modeli
interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

export default function PaymentsScreen() {
  const router = useRouter();
  
  // Sekme seçimi için state
  const [activeTab, setActiveTab] = useState<'history' | 'methods'>('history');
  
  // Ödeme geçmişi verileri
  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '15 Tem 2023',
      amount: -1250,
      type: 'rent',
      status: 'completed',
      description: 'BMW 3.20i Kiralama'
    },
    {
      id: '2',
      date: '05 Tem 2023',
      amount: 850,
      type: 'deposit',
      status: 'completed',
      description: 'Bakiye Yükleme'
    },
    {
      id: '3',
      date: '28 Haz 2023',
      amount: 1500,
      type: 'withdrawal',
      status: 'completed',
      description: 'Bakiye Çekme'
    },
    {
      id: '4',
      date: '20 Haz 2023',
      amount: 3200,
      type: 'deposit',
      status: 'completed',
      description: 'Bakiye Yükleme'
    },
    {
      id: '5',
      date: '15 Haz 2023',
      amount: 300,
      type: 'refund',
      status: 'completed',
      description: 'İade - Honda Civic Kiralama'
    }
  ];
  
  // Ödeme yöntemleri
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'credit_card',
      name: 'Ziraat Bankası',
      last4: '4242',
      expiry: '06/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit_card',
      name: 'Garanti BBVA',
      last4: '1234',
      expiry: '12/24',
      isDefault: false
    },
    {
      id: '3',
      type: 'bank_account',
      name: 'İş Bankası',
      last4: '9876',
      isDefault: false
    }
  ];
  
  // İşlem tipine göre ikon ve renk döndüren yardımcı fonksiyon
  const getTransactionInfo = (type: PaymentHistory['type']) => {
    switch (type) {
      case 'rent':
        return {
          icon: 'car',
          color: '#F44336' // Kırmızı - Para çıkışı
        };
      case 'deposit':
        return {
          icon: 'arrow-down',
          color: '#4CAF50' // Yeşil - Para girişi
        };
      case 'withdrawal':
        return {
          icon: 'arrow-up',
          color: '#F44336' // Kırmızı - Para çıkışı
        };
      case 'refund':
        return {
          icon: 'undo',
          color: '#4CAF50' // Yeşil - Para girişi
        };
    }
  };
  
  // Ödeme yöntemi tipine göre ikon döndüren yardımcı fonksiyon
  const getMethodIcon = (type: PaymentMethod['type']) => {
    return type === 'credit_card' ? 'credit-card' : 'university';
  };
  
  // Yeni ödeme yöntemi ekleme
  const addPaymentMethod = () => {
    router.push('/add-payment-method' as any);
  };
  
  // Ödeme geçmişi öğesi render fonksiyonu
  const renderHistoryItem = ({ item }: { item: PaymentHistory }) => {
    const transactionInfo = getTransactionInfo(item.type);
    const isPositive = item.amount > 0;
    
    return (
      <View style={styles.historyItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${transactionInfo.color}20` }]}>
          <FontAwesome5 name={transactionInfo.icon} size={16} color={transactionInfo.color} />
        </View>
        
        <View style={styles.historyDetails}>
          <Text style={styles.historyDescription}>{item.description}</Text>
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>
        
        <Text style={[
          styles.historyAmount, 
          { color: isPositive ? '#4CAF50' : '#F44336' }
        ]}>
          {isPositive ? '+' : ''}{item.amount} ₺
        </Text>
      </View>
    );
  };
  
  // Ödeme yöntemi render fonksiyonu
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    return (
      <View style={styles.methodItem}>
        <View style={styles.methodHeader}>
          <View style={styles.methodIconContainer}>
            <FontAwesome5 name={getMethodIcon(item.type)} size={20} color={colors.primary} />
          </View>
          
          <View style={styles.methodDetails}>
            <Text style={styles.methodName}>{item.name}</Text>
            <Text style={styles.methodInfo}>
              {item.type === 'credit_card' 
                ? `**** **** **** ${item.last4} | ${item.expiry}` 
                : `**** ${item.last4}`
              }
            </Text>
          </View>
          
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
        </View>
        
        <View style={styles.methodActions}>
          <TouchableOpacity style={styles.methodAction}>
            <FontAwesome5 name="pencil-alt" size={14} color={colors.primary} />
            <Text style={styles.methodActionText}>Düzenle</Text>
          </TouchableOpacity>
          
          {!item.isDefault && (
            <TouchableOpacity style={styles.methodAction}>
              <FontAwesome5 name="star" size={14} color={colors.primary} />
              <Text style={styles.methodActionText}>Varsayılan Yap</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.methodAction}>
            <FontAwesome5 name="trash-alt" size={14} color="#F44336" />
            <Text style={[styles.methodActionText, { color: '#F44336' }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ödemelerim',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Bakiye Gösterimi */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Bakiye</Text>
          <Text style={styles.balanceAmount}>1,250.00 ₺</Text>
        </View>
        
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceAction}>
            <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.actionText}>Yükle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.balanceAction}>
            <FontAwesome5 name="money-bill-wave" size={14} color="#FFFFFF" />
            <Text style={styles.actionText}>Çek</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Sekme Başlıkları */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'methods' && styles.activeTab]} 
          onPress={() => setActiveTab('methods')}
        >
          <Text style={[styles.tabText, activeTab === 'methods' && styles.activeTabText]}>
            Ödeme Yöntemleri
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sekme İçerikleri */}
      {activeTab === 'history' ? (
        <FlatList
          data={paymentHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView style={styles.methodsContainer}>
          <TouchableOpacity 
            style={styles.addMethodButton}
            onPress={addPaymentMethod}
          >
            <FontAwesome5 name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addMethodText}>Yeni Ödeme Yöntemi Ekle</Text>
          </TouchableOpacity>
          
          {paymentMethods.map(method => renderPaymentMethod({ item: method }))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  balanceContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceActions: {
    flexDirection: 'row',
  },
  balanceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 8,
    margin: 16,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textDark,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.card,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#757575',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  methodsContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addMethodText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  methodItem: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  methodInfo: {
    fontSize: 14,
    color: '#757575',
  },
  defaultBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  methodActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  methodAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  methodActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
}); 