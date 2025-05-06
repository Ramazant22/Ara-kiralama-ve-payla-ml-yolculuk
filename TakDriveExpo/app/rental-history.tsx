import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Örnek veri modeli
interface RentalItem {
  id: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleImage: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'ongoing' | 'upcoming' | 'cancelled';
  totalPrice: number;
  ownerName: string;
}

export default function RentalHistoryPage() {
  const router = useRouter();
  
  // Sekme seçimi için state
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  
  // Örnek kiralama geçmişi verisi
  const rentalHistory: RentalItem[] = [
    {
      id: '1',
      vehicleBrand: 'BMW',
      vehicleModel: '3.20i',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '10 Nis 2023',
      endDate: '15 Nis 2023',
      status: 'completed',
      totalPrice: 3750,
      ownerName: 'Ahmet Yılmaz'
    },
    {
      id: '2',
      vehicleBrand: 'Mercedes',
      vehicleModel: 'C180',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '22 May 2023',
      endDate: '25 May 2023',
      status: 'completed',
      totalPrice: 2400,
      ownerName: 'Fatma Demir'
    },
    {
      id: '3',
      vehicleBrand: 'Volkswagen',
      vehicleModel: 'Golf',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '1 Haz 2023',
      endDate: '3 Haz 2023',
      status: 'completed',
      totalPrice: 1200,
      ownerName: 'Mehmet Kaya'
    },
    {
      id: '4',
      vehicleBrand: 'Audi',
      vehicleModel: 'A3',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '10 Tem 2023',
      endDate: '20 Tem 2023',
      status: 'ongoing',
      totalPrice: 5000,
      ownerName: 'Zeynep Şahin'
    },
    {
      id: '5',
      vehicleBrand: 'Renault',
      vehicleModel: 'Megane',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '15 Ağu 2023',
      endDate: '18 Ağu 2023',
      status: 'upcoming',
      totalPrice: 1800,
      ownerName: 'Ali Yıldız'
    }
  ];
  
  // Seçilen sekmeye göre kiralama verilerini filtrele
  const getFilteredData = () => {
    switch (activeTab) {
      case 'active':
        return rentalHistory.filter(item => 
          item.status === 'ongoing' || item.status === 'upcoming'
        );
      case 'completed':
        return rentalHistory.filter(item => 
          item.status === 'completed' || item.status === 'cancelled'
        );
      default:
        return rentalHistory;
    }
  };
  
  // Durum bilgisine göre stil ve metin döndüren yardımcı fonksiyon
  const getStatusInfo = (status: RentalItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          text: 'Tamamlandı',
          color: '#4CAF50',
          icon: 'check-circle'
        };
      case 'ongoing':
        return {
          text: 'Devam Ediyor',
          color: '#2196F3',
          icon: 'clock'
        };
      case 'upcoming':
        return {
          text: 'Yaklaşan',
          color: '#FF9800',
          icon: 'calendar'
        };
      case 'cancelled':
        return {
          text: 'İptal Edildi',
          color: '#F44336',
          icon: 'times-circle'
        };
    }
  };
  
  // Kiralama öğesi render fonksiyonu
  const renderRentalItem = ({ item }: { item: RentalItem }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.rentalItem}
        onPress={() => router.push(`/vehicle/${item.id}`)}
      >
        <Image 
          source={{ uri: item.vehicleImage }} 
          style={styles.vehicleImage} 
        />
        
        <View style={styles.rentalInfo}>
          <Text style={styles.vehicleName}>{item.vehicleBrand} {item.vehicleModel}</Text>
          
          <View style={styles.dateRow}>
            <FontAwesome5 name="calendar-alt" size={14} color={colors.primary} />
            <Text style={styles.dateText}>
              {item.startDate} - {item.endDate}
            </Text>
          </View>
          
          <View style={styles.ownerRow}>
            <FontAwesome5 name="user" size={14} color={colors.primary} />
            <Text style={styles.ownerText}>{item.ownerName}</Text>
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.priceText}>{item.totalPrice} ₺</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <FontAwesome5 name={statusInfo.icon} size={12} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Kiralama Geçmişim',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Filtre sekmeleri */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tümü
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Aktif
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Tamamlanan
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Kiralama listesi */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderRentalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="car" size={50} color={colors.secondary} />
            <Text style={styles.emptyText}>Kiralama geçmişiniz bulunmuyor</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/vehicles')}
            >
              <Text style={styles.browseButtonText}>Araçları Keşfedin</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  rentalItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  rentalInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 6,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 