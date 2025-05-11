import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Talep durumu için tip
type RequestStatus = 'pending' | 'approved' | 'rejected';

// Yolculuk talebi için arayüz
interface RideRequest {
  id: string;
  rideId: string;
  rideName: string;
  date: string;
  passenger: {
    id: string;
    name: string;
    photo: string;
    rating: number;
  };
  passengerCount: number;
  specialRequests?: string;
  contactNumber: string;
  paymentMethod: 'cash' | 'card';
  totalAmount: number;
  status: RequestStatus;
  requestDate: string;
}

export default function RideRequestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('pending');

  // Demo yolculuk talepleri - normalde API'den gelecek
  const demoRequests: RideRequest[] = [
    {
      id: '1',
      rideId: '101',
      rideName: 'İstanbul - Ankara',
      date: '15 Haziran 2023 09:30',
      passenger: {
        id: 'p1',
        name: 'Mehmet Yılmaz',
        photo: 'https://randomuser.me/api/portraits/men/55.jpg',
        rating: 4.7
      },
      passengerCount: 2,
      specialRequests: 'Bagajımız biraz fazla olabilir, yer var mı?',
      contactNumber: '0555 123 4567',
      paymentMethod: 'cash',
      totalAmount: 500,
      status: 'pending',
      requestDate: '10 Haziran 2023 14:22'
    },
    {
      id: '2',
      rideId: '101',
      rideName: 'İstanbul - Ankara',
      date: '15 Haziran 2023 09:30',
      passenger: {
        id: 'p2',
        name: 'Ayşe Demir',
        photo: 'https://randomuser.me/api/portraits/women/33.jpg',
        rating: 4.9
      },
      passengerCount: 1,
      contactNumber: '0532 987 6543',
      paymentMethod: 'card',
      totalAmount: 250,
      status: 'pending',
      requestDate: '11 Haziran 2023 09:15'
    },
    {
      id: '3',
      rideId: '102',
      rideName: 'İzmir - Antalya',
      date: '18 Haziran 2023 08:00',
      passenger: {
        id: 'p3',
        name: 'Ali Yıldız',
        photo: 'https://randomuser.me/api/portraits/men/22.jpg',
        rating: 4.5
      },
      passengerCount: 1,
      specialRequests: 'Koltuk tercihi: ön koltuk olabilir mi?',
      contactNumber: '0542 765 4321',
      paymentMethod: 'cash',
      totalAmount: 300,
      status: 'approved',
      requestDate: '9 Haziran 2023 18:45'
    },
    {
      id: '4',
      rideId: '103',
      rideName: 'Ankara - Bursa',
      date: '20 Haziran 2023 10:15',
      passenger: {
        id: 'p4',
        name: 'Zeynep Kara',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 4.2
      },
      passengerCount: 2,
      contactNumber: '0533 456 7890',
      paymentMethod: 'card',
      totalAmount: 480,
      status: 'rejected',
      requestDate: '8 Haziran 2023 22:10'
    }
  ];

  useEffect(() => {
    // API isteği simülasyonu
    setTimeout(() => {
      setRequests(demoRequests);
      setLoading(false);
    }, 1500);
  }, []);

  // Filtreli talep listesini al
  const getFilteredRequests = () => {
    if (filter === 'all') {
      return requests;
    }
    return requests.filter(request => request.status === filter);
  };

  // Talebi onayla
  const handleApprove = (requestId: string) => {
    Alert.alert(
      'Talebi Onayla',
      'Bu yolculuk talebini onaylamak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Onayla',
          onPress: () => {
            // Normalde API isteği gerçekleştirilir
            setRequests(prev => 
              prev.map(request => 
                request.id === requestId 
                  ? { ...request, status: 'approved' } 
                  : request
              )
            );
            
            Alert.alert(
              'Talep Onaylandı',
              'Yolculuk talebi başarıyla onaylandı. Yolcu bilgilendirilecek.'
            );
          }
        }
      ]
    );
  };

  // Talebi reddet
  const handleReject = (requestId: string) => {
    Alert.alert(
      'Talebi Reddet',
      'Bu yolculuk talebini reddetmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Reddet',
          onPress: () => {
            // Normalde API isteği gerçekleştirilir
            setRequests(prev => 
              prev.map(request => 
                request.id === requestId 
                  ? { ...request, status: 'rejected' } 
                  : request
              )
            );
            
            Alert.alert(
              'Talep Reddedildi',
              'Yolculuk talebi reddedildi. Yolcu bilgilendirilecek.'
            );
          }
        }
      ]
    );
  };

  // Her bir talep için bileşen
  const renderRequest = ({ item }: { item: RideRequest }) => {
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.rideName}>{item.rideName}</Text>
            <Text style={styles.rideDate}>{item.date}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              item.status === 'pending' && styles.statusPending,
              item.status === 'approved' && styles.statusApproved,
              item.status === 'rejected' && styles.statusRejected
            ]}>
              {item.status === 'pending' ? 'Bekliyor' : 
               item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
            </Text>
          </View>
        </View>
        
        <View style={styles.passengerInfo}>
          <Image source={{ uri: item.passenger.photo }} style={styles.passengerPhoto} />
          
          <View style={styles.passengerDetails}>
            <Text style={styles.passengerName}>{item.passenger.name}</Text>
            
            <View style={styles.ratingContainer}>
              <FontAwesome5 name="star" size={12} color="#FFD700" solid />
              <Text style={styles.ratingText}>{item.passenger.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <View style={styles.detailsRight}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="users" size={12} color={colors.primary} solid />
              <Text style={styles.detailText}>{item.passengerCount} Yolcu</Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 
                name={item.paymentMethod === 'cash' ? "money-bill-wave" : "credit-card"} 
                size={12} 
                color={colors.primary} 
                solid 
              />
              <Text style={styles.detailText}>
                {item.paymentMethod === 'cash' ? 'Nakit' : 'Kart'} - {item.totalAmount} TL
              </Text>
            </View>
          </View>
        </View>
        
        {item.specialRequests && (
          <View style={styles.specialRequestContainer}>
            <Text style={styles.specialRequestTitle}>Özel İstek:</Text>
            <Text style={styles.specialRequestText}>{item.specialRequests}</Text>
          </View>
        )}
        
        <View style={styles.requestDate}>
          <FontAwesome5 name="clock" size={12} color={colors.textDark} solid />
          <Text style={styles.requestDateText}>Talep: {item.requestDate}</Text>
        </View>
        
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]} 
              onPress={() => handleReject(item.id)}
            >
              <FontAwesome5 name="times" size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reddet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]} 
              onPress={() => handleApprove(item.id)}
            >
              <FontAwesome5 name="check" size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Onayla</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'approved' && (
          <View style={styles.contactContainer}>
            <View style={styles.contactInfo}>
              <FontAwesome5 name="phone-alt" size={14} color={colors.primary} solid />
              <Text style={styles.contactText}>{item.contactNumber}</Text>
            </View>
            
            <TouchableOpacity style={styles.messageButton}>
              <FontAwesome5 name="comment" size={14} color="#FFFFFF" solid />
              <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilterButton = (filterValue: RequestStatus | 'all', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterValue && styles.filterButtonActive]}
      onPress={() => setFilter(filterValue)}
    >
      <Text 
        style={[
          styles.filterButtonText, 
          filter === filterValue && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Yolculuk talepleri yükleniyor...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Yolculuk Talepleri',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={styles.filterContainer}>
        {renderFilterButton('pending', 'Bekleyenler')}
        {renderFilterButton('approved', 'Onaylananlar')}
        {renderFilterButton('rejected', 'Reddedilenler')}
        {renderFilterButton('all', 'Tümü')}
      </View>
      
      {getFilteredRequests().length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="calendar-times" size={50} color={colors.textDark} solid />
          <Text style={styles.emptyText}>Bu kategoride talep bulunmuyor</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredRequests()}
          renderItem={renderRequest}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  rideName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rideDate: {
    fontSize: 14,
    color: colors.textDark,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPending: {
    color: '#FFB800',
  },
  statusApproved: {
    color: '#00C853',
  },
  statusRejected: {
    color: '#FF3D00',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  passengerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  detailsRight: {
    alignItems: 'flex-end',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 6,
  },
  specialRequestContainer: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialRequestTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  specialRequestText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  requestDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDateText: {
    fontSize: 12,
    color: colors.textDark,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: '#FF3D00',
  },
  approveButton: {
    backgroundColor: '#00C853',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
});