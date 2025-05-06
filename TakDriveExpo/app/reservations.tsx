import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Örnek veri modeli
interface Reservation {
  id: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleImage: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  ownerName: string;
  location: string;
}

export default function ReservationsPage() {
  const router = useRouter();
  
  // Sekme seçimi için state
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  
  // Örnek rezervasyon verisi
  const reservations: Reservation[] = [
    {
      id: '1',
      vehicleBrand: 'BMW',
      vehicleModel: '3.20i',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '10 Tem 2023',
      endDate: '15 Tem 2023',
      status: 'active',
      totalPrice: 3750,
      ownerName: 'Ahmet Yılmaz',
      location: 'İstanbul, Kadıköy'
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
      ownerName: 'Fatma Demir',
      location: 'İstanbul, Beşiktaş'
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
      ownerName: 'Mehmet Kaya',
      location: 'Ankara, Çankaya'
    },
    {
      id: '4',
      vehicleBrand: 'Audi',
      vehicleModel: 'A3',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '20 Tem 2023',
      endDate: '30 Tem 2023',
      status: 'active',
      totalPrice: 5000,
      ownerName: 'Zeynep Şahin',
      location: 'İzmir, Karşıyaka'
    },
    {
      id: '5',
      vehicleBrand: 'Renault',
      vehicleModel: 'Megane',
      vehicleImage: 'https://via.placeholder.com/150',
      startDate: '5 May 2023',
      endDate: '8 May 2023',
      status: 'cancelled',
      totalPrice: 1800,
      ownerName: 'Ali Yıldız',
      location: 'Bursa, Nilüfer'
    }
  ];
  
  // Seçilen sekmeye göre rezervasyon verilerini filtrele
  const getFilteredData = () => {
    if (activeTab === 'active') {
      return reservations.filter(item => item.status === 'active');
    } else {
      return reservations.filter(item => item.status === 'completed' || item.status === 'cancelled');
    }
  };
  
  // Durum bilgisine göre stil ve metin döndüren yardımcı fonksiyon
  const getStatusInfo = (status: Reservation['status']) => {
    switch (status) {
      case 'active':
        return {
          text: 'Aktif',
          color: '#4CAF50',
          icon: 'check-circle'
        };
      case 'completed':
        return {
          text: 'Tamamlandı',
          color: '#2196F3',
          icon: 'flag-checkered'
        };
      case 'cancelled':
        return {
          text: 'İptal Edildi',
          color: '#F44336',
          icon: 'times-circle'
        };
    }
  };
  
  // Rezervasyon öğesi render fonksiyonu
  const renderReservationItem = ({ item }: { item: Reservation }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.reservationItem}
        onPress={() => router.push(`/vehicle/${item.id}` as any)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{item.vehicleBrand} {item.vehicleModel}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <FontAwesome5 name={statusInfo.icon} size={12} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
          <Image 
            source={{ uri: item.vehicleImage }} 
            style={styles.vehicleImage} 
          />
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="calendar-alt" size={14} color={colors.primary} />
            <Text style={styles.detailText}>
              {item.startDate} - {item.endDate}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.ownerInfo}>
            <FontAwesome5 name="user" size={14} color={colors.primary} />
            <Text style={styles.ownerText}>Araç Sahibi: {item.ownerName}</Text>
          </View>
          
          <Text style={styles.priceText}>{item.totalPrice} ₺</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Rezervasyonlarım',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Filtre sekmeleri */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Aktif
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]} 
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Rezervasyon listesi */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderReservationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="calendar-times" size={50} color={colors.secondary} />
            <Text style={styles.emptyText}>
              {activeTab === 'active' 
                ? 'Aktif rezervasyonunuz bulunmuyor'
                : 'Geçmiş rezervasyonunuz bulunmuyor'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/vehicles' as any)}
            >
              <Text style={styles.emptyButtonText}>Araçları Keşfedin</Text>
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
  reservationItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  detailsRow: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 