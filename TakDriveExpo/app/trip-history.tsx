import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Örnek veri modeli
interface TripItem {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driver: {
    name: string;
    avatar: string;
    rating: number;
  };
  status: 'completed' | 'ongoing' | 'upcoming' | 'cancelled';
  price: number;
  passengers: number;
  passengerCapacity: number;
}

export default function TripHistoryPage() {
  const router = useRouter();
  
  // Sekme seçimi için state
  const [activeTab, setActiveTab] = useState<'all' | 'asDriver' | 'asPassenger'>('all');
  
  // Örnek yolculuk geçmişi verisi
  const tripHistory: TripItem[] = [
    {
      id: '1',
      from: 'İstanbul, Kadıköy',
      to: 'İstanbul, Beşiktaş',
      date: '15 May 2023',
      time: '14:30',
      driver: {
        name: 'Mehmet Kaya',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.8
      },
      status: 'completed',
      price: 80,
      passengers: 3,
      passengerCapacity: 4
    },
    {
      id: '2',
      from: 'İstanbul, Ataşehir',
      to: 'İstanbul, Maslak',
      date: '10 Haz 2023',
      time: '08:15',
      driver: {
        name: 'Siz',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.9
      },
      status: 'completed',
      price: 120,
      passengers: 2,
      passengerCapacity: 4
    },
    {
      id: '3',
      from: 'İstanbul, Üsküdar',
      to: 'İstanbul, Levent',
      date: '22 Haz 2023',
      time: '17:45',
      driver: {
        name: 'Zeynep Demir',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.7
      },
      status: 'completed',
      price: 95,
      passengers: 2,
      passengerCapacity: 3
    },
    {
      id: '4',
      from: 'İstanbul, Beylikdüzü',
      to: 'İstanbul, Bakırköy',
      date: '5 Tem 2023',
      time: '09:00',
      driver: {
        name: 'Siz',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.9
      },
      status: 'ongoing',
      price: 150,
      passengers: 3,
      passengerCapacity: 4
    },
    {
      id: '5',
      from: 'İstanbul, Maltepe',
      to: 'İstanbul, Kartal',
      date: '15 Tem 2023',
      time: '18:30',
      driver: {
        name: 'Ali Yıldız',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.5
      },
      status: 'upcoming',
      price: 60,
      passengers: 1,
      passengerCapacity: 4
    }
  ];
  
  // Seçilen sekmeye göre yolculuk verilerini filtrele
  const getFilteredData = () => {
    switch (activeTab) {
      case 'asDriver':
        return tripHistory.filter(item => 
          item.driver.name === 'Siz'
        );
      case 'asPassenger':
        return tripHistory.filter(item => 
          item.driver.name !== 'Siz'
        );
      default:
        return tripHistory;
    }
  };
  
  // Durum bilgisine göre stil ve metin döndüren yardımcı fonksiyon
  const getStatusInfo = (status: TripItem['status']) => {
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
  
  // Yıldız rating oluşturan fonksiyon
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome5 key={`full-${i}`} name="star" size={12} color="#FFD700" solid style={{ marginRight: 2 }} />
        ))}
        
        {halfStar && (
          <FontAwesome5 key="half" name="star-half-alt" size={12} color="#FFD700" solid style={{ marginRight: 2 }} />
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome5 key={`empty-${i}`} name="star" size={12} color="#CCCCCC" style={{ marginRight: 2 }} />
        ))}
        
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };
  
  // Yolculuk öğesi render fonksiyonu
  const renderTripItem = ({ item }: { item: TripItem }) => {
    const statusInfo = getStatusInfo(item.status);
    const isDriver = item.driver.name === 'Siz';
    
    return (
      <TouchableOpacity 
        style={styles.tripItem}
        onPress={() => router.push(`/ride/${item.id}`)}
      >
        <View style={styles.tripHeader}>
          <View style={styles.locationInfo}>
            <View style={styles.iconContainer}>
              <View style={styles.startDot} />
              <View style={styles.connectingLine} />
              <View style={styles.endDot} />
            </View>
            
            <View style={styles.locationTexts}>
              <Text style={styles.locationText} numberOfLines={1}>{item.from}</Text>
              <Text style={styles.locationText} numberOfLines={1}>{item.to}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <FontAwesome5 name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.dateTimeContainer}>
            <FontAwesome5 name="calendar-alt" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <FontAwesome5 name="clock" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <FontAwesome5 name="money-bill-wave" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.priceText}>{item.price} ₺</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.driverRow}>
          <View style={styles.driverInfo}>
            <Image source={{ uri: item.driver.avatar }} style={styles.avatar} />
            <View>
              <View style={styles.driverNameContainer}>
                <Text style={styles.driverName}>{item.driver.name}</Text>
                {isDriver && (
                  <View style={styles.driverBadge}>
                    <Text style={styles.driverBadgeText}>Sürücü</Text>
                  </View>
                )}
              </View>
              {renderRating(item.driver.rating)}
            </View>
          </View>
          
          <View style={styles.passengerInfo}>
            <FontAwesome5 name="users" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.passengerText}>
              {item.passengers}/{item.passengerCapacity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Yolculuk Geçmişim',
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
          style={[styles.tab, activeTab === 'asDriver' && styles.activeTab]} 
          onPress={() => setActiveTab('asDriver')}
        >
          <Text style={[styles.tabText, activeTab === 'asDriver' && styles.activeTabText]}>
            Sürücü Olarak
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'asPassenger' && styles.activeTab]} 
          onPress={() => setActiveTab('asPassenger')}
        >
          <Text style={[styles.tabText, activeTab === 'asPassenger' && styles.activeTabText]}>
            Yolcu Olarak
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Yolculuk listesi */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="route" size={50} color={colors.secondary} />
            <Text style={styles.emptyText}>Yolculuk geçmişiniz bulunmuyor</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/createRide')}
            >
              <Text style={styles.browseButtonText}>Yolculuk Oluştur</Text>
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
  tripItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
    height: 44,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  endDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  locationTexts: {
    flex: 1,
    justifyContent: 'space-between',
    height: 44,
  },
  locationText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textDark,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 16,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  driverNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
    marginRight: 8,
  },
  driverBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  driverBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textDark,
    marginLeft: 4,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
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