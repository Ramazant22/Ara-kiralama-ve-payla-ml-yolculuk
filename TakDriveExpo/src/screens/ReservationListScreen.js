import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import reservationService from '../api/services/reservationService';

const ReservationListScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Tema renkleri
  const backgroundColor = darkMode ? '#121212' : '#F7F7F7';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const cardColor = darkMode ? '#1E1E1E' : '#FFFFFF';
  const secondaryTextColor = darkMode ? '#BBBBBB' : '#666666';
  
  // Rezervasyonları yükle
  const loadReservations = async () => {
    try {
      setLoading(true);
      // Gerçek API'den veri çekilecek
      const response = await reservationService.getUserReservations();
      setReservations(response.reservations || []);
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyonlar yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    loadReservations();
  }, []);
  
  // Yenileme işlemi
  const handleRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };
  
  // Filtreleme
  const getFilteredReservations = () => {
    if (activeFilter === 'all') {
      return reservations;
    }
    return reservations.filter(res => res.status === activeFilter);
  };
  
  // Rezervasyon durumuna göre stil ve text belirleme
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Onay Bekliyor', color: '#FFA500', icon: 'clock' };
      case 'confirmed':
        return { text: 'Onaylandı', color: '#4CAF50', icon: 'check-circle' };
      case 'ongoing':
        return { text: 'Devam Ediyor', color: '#2196F3', icon: 'car' };
      case 'completed':
        return { text: 'Tamamlandı', color: '#4CAF50', icon: 'check-double' };
      case 'cancelled':
        return { text: 'İptal Edildi', color: '#F44336', icon: 'times-circle' };
      default:
        return { text: 'Bilinmiyor', color: '#9E9E9E', icon: 'question-circle' };
    }
  };
  
  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  // Rezervasyon öğesi render
  const renderReservationItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.reservationCard, { backgroundColor: cardColor }]}
        onPress={() => navigation.navigate('ReservationDetail', { reservationId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.vehicle?.photos?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.vehicleImage}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.vehicleName, { color: textColor }]}>
              {item.vehicle?.brand} {item.vehicle?.model}
            </Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar-alt" size={12} color={secondaryTextColor} />
              <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Icon name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={[styles.priceText, { color: textColor }]}>
            {item.totalPrice} ₺
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Filtre butonları
  const renderFilterButtons = () => {
    const filters = [
      { id: 'all', label: 'Tümü' },
      { id: 'pending', label: 'Bekleyen' },
      { id: 'confirmed', label: 'Onaylanan' },
      { id: 'ongoing', label: 'Devam Eden' },
      { id: 'completed', label: 'Tamamlanan' },
      { id: 'cancelled', label: 'İptal Edilen' }
    ];
    
    return (
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && [
                  styles.activeFilterButton,
                  { borderColor: darkMode ? '#4CAF50' : '#4CAF50' }
                ]
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === filter.id ? '#4CAF50' : secondaryTextColor }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Boş durum
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar-times" size={50} color={secondaryTextColor} />
      <Text style={[styles.emptyText, { color: textColor }]}>
        Henüz rezervasyonunuz bulunmuyor
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Vehicles')}
      >
        <Text style={styles.browseButtonText}>Araçlara Göz At</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Rezervasyonlarım</Text>
        <View style={styles.headerRight} />
      </View>
      
      {renderFilterButtons()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Rezervasyonlar yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredReservations()}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
              tintColor={darkMode ? '#FFFFFF' : '#4CAF50'}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  activeFilterButton: {
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  reservationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ReservationListScreen; 