import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RideCard from '../components/RideCard';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock veri - gerçek uygulamada API'den gelecek
const RIDES = [
  {
    id: '1',
    from: 'İstanbul, Beşiktaş',
    to: 'Ankara, Kızılay',
    date: '15 Haz 2023',
    time: '08:30',
    vehicleName: 'Mercedes E200',
    price: 350,
    availableSeats: 3,
    driverName: 'Ahmet Yılmaz',
    driverRating: 4.8,
  },
  {
    id: '2',
    from: 'İstanbul, Kadıköy',
    to: 'İzmir, Konak',
    date: '16 Haz 2023',
    time: '09:15',
    vehicleName: 'BMW 3.20',
    price: 400,
    availableSeats: 2,
    driverName: 'Ayşe Demir',
    driverRating: 4.7,
  },
  {
    id: '3',
    from: 'İstanbul, Üsküdar',
    to: 'Bursa, Osmangazi',
    date: '17 Haz 2023',
    time: '10:00',
    vehicleName: 'Volkswagen Passat',
    price: 250,
    availableSeats: 4,
    driverName: 'Mehmet Kaya',
    driverRating: 4.9,
  },
  {
    id: '4',
    from: 'İstanbul, Maslak',
    to: 'Eskişehir, Merkez',
    date: '18 Haz 2023',
    time: '07:45',
    vehicleName: 'Audi A4',
    price: 320,
    availableSeats: 3,
    driverName: 'Zeynep Aydın',
    driverRating: 4.6,
  },
  {
    id: '5',
    from: 'İstanbul, Bakırköy',
    to: 'Antalya, Merkez',
    date: '19 Haz 2023',
    time: '06:30',
    vehicleName: 'Toyota Corolla',
    price: 450,
    availableSeats: 3,
    driverName: 'Ali Öztürk',
    driverRating: 4.5,
  },
];

const RideShareListScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [rides, setRides] = useState(RIDES);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Filtre state'leri
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  
  const handleSearch = (text) => {
    setSearchText(text);
    
    if (text.trim() === '') {
      setRides(RIDES);
      return;
    }
    
    const filtered = RIDES.filter(ride => 
      ride.from.toLowerCase().includes(text.toLowerCase()) ||
      ride.to.toLowerCase().includes(text.toLowerCase()) ||
      ride.vehicleName.toLowerCase().includes(text.toLowerCase())
    );
    
    setRides(filtered);
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDateFilter(formatDate(selectedDate));
    }
  };
  
  const applyFilters = () => {
    let filtered = [...RIDES];
    
    if (fromFilter.trim() !== '') {
      filtered = filtered.filter(ride => 
        ride.from.toLowerCase().includes(fromFilter.toLowerCase())
      );
    }
    
    if (toFilter.trim() !== '') {
      filtered = filtered.filter(ride => 
        ride.to.toLowerCase().includes(toFilter.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(ride => 
        ride.date === dateFilter
      );
    }
    
    if (minPriceFilter.trim() !== '') {
      const minPrice = parseInt(minPriceFilter);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(ride => ride.price >= minPrice);
      }
    }
    
    if (maxPriceFilter.trim() !== '') {
      const maxPrice = parseInt(maxPriceFilter);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(ride => ride.price <= maxPrice);
      }
    }
    
    setRides(filtered);
    setShowFilterModal(false);
  };
  
  const clearFilters = () => {
    setFromFilter('');
    setToFilter('');
    setDateFilter(null);
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setRides(RIDES);
    setShowFilterModal(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={18} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yolculuk Paylaşımları</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="sliders-h" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir veya araç ara..."
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
        </View>
        
        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {rides.length} yolculuk bulundu
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Icon name="sort-amount-down" size={14} color="#666666" />
            <Text style={styles.sortText}>Sırala</Text>
          </TouchableOpacity>
        </View>
        
        {/* Ride List */}
        {rides.length > 0 ? (
          <FlatList
            data={rides}
            renderItem={({ item }) => (
              <RideCard 
                ride={item} 
                onPress={() => navigation.navigate('RideDetail', { ride: item })} 
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.rideList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="route" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>Yolculuk bulunamadı</Text>
            <Text style={styles.emptySubText}>Lütfen farklı bir arama yapın</Text>
          </View>
        )}
        
        {/* Add Ride Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateRide')}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filtreler</Text>
                    <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                      <Icon name="times" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.filterForm}>
                    <View style={styles.filterInput}>
                      <Text style={styles.filterLabel}>Nereden</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Hareket şehri"
                        value={fromFilter}
                        onChangeText={setFromFilter}
                      />
                    </View>
                    
                    <View style={styles.filterInput}>
                      <Text style={styles.filterLabel}>Nereye</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Varış şehri"
                        value={toFilter}
                        onChangeText={setToFilter}
                      />
                    </View>
                    
                    <View style={styles.filterInput}>
                      <Text style={styles.filterLabel}>Tarih</Text>
                      <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={dateFilter ? styles.dateText : styles.datePlaceholder}>
                          {dateFilter || 'Tarih seçin'}
                        </Text>
                        <Icon name="calendar-alt" size={16} color="#666666" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <View style={[styles.filterInput, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.filterLabel}>Min Fiyat</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="₺"
                          keyboardType="numeric"
                          value={minPriceFilter}
                          onChangeText={setMinPriceFilter}
                        />
                      </View>
                      
                      <View style={[styles.filterInput, { flex: 1 }]}>
                        <Text style={styles.filterLabel}>Max Fiyat</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="₺"
                          keyboardType="numeric"
                          value={maxPriceFilter}
                          onChangeText={setMaxPriceFilter}
                        />
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={clearFilters}
                    >
                      <Text style={styles.clearButtonText}>Temizle</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.applyButton}
                      onPress={applyFilters}
                    >
                      <Text style={styles.applyButtonText}>Uygula</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000000',
    fontSize: 14,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  rideList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterForm: {
    marginTop: 16,
  },
  filterInput: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000000',
  },
  dateInput: {
    height: 44,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#000000',
  },
  datePlaceholder: {
    fontSize: 14,
    color: '#999999',
  },
  priceContainer: {
    flexDirection: 'row',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#FF4500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4500',
  },
  applyButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FF4500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default RideShareListScreen; 