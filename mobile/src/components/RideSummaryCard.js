import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Sürüş özeti kartı bileşeni
 * @param {Object} props Component props
 * @param {Object} props.ride Sürüş verileri
 * @param {function} props.onPress Karta tıklama işlevi
 */
const RideSummaryCard = ({ ride, onPress }) => {
  const theme = useTheme();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme?.card || '#FFFFFF',
          borderColor: theme?.border || '#E5E7EB',
          shadowColor: theme?.shadow?.color || '#000',
          shadowOpacity: theme?.shadow?.opacity || 0.1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Üst bölüm - tarih ve fiyat */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={16} color={theme?.text?.secondary || '#6B7280'} />
          <Text style={[styles.date, { color: theme?.text?.secondary || '#6B7280' }]}>
            {formatDate(ride.departureTime)}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme?.primary || '#FF7700' }]}>
            {ride.price} ₺
          </Text>
          <Text style={[styles.perPerson, { color: theme?.text?.secondary || '#6B7280' }]}>
            / kişi başı
          </Text>
        </View>
      </View>
      
      {/* Orta bölüm - başlangıç ve hedef */}
      <View style={styles.routeContainer}>
        <View style={styles.locationIndicators}>
          <View style={[styles.startDot, { backgroundColor: theme?.primary || '#FF7700' }]} />
          <View style={[styles.routeLine, { backgroundColor: theme?.border || '#E5E7EB' }]} />
          <View style={[styles.endDot, { borderColor: theme?.primary || '#FF7700' }]} />
        </View>
        
        <View style={styles.locationDetails}>
          <View style={styles.locationItem}>
            <Text style={[styles.time, { color: theme?.text?.secondary || '#6B7280' }]}>
              {formatTime(ride.departureTime)}
            </Text>
            <Text 
              style={[styles.locationText, { color: theme?.text?.primary || '#171A1F' }]}
              numberOfLines={1}
            >
              {ride.origin}
            </Text>
          </View>
          
          <View style={styles.locationItem}>
            <Text style={[styles.time, { color: theme?.text?.secondary || '#6B7280' }]}>
              {formatTime(ride.arrivalTime)}
            </Text>
            <Text 
              style={[styles.locationText, { color: theme?.text?.primary || '#171A1F' }]}
              numberOfLines={1}
            >
              {ride.destination}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Alt bölüm - sürücü ve araç bilgileri */}
      <View style={[styles.footer, { borderTopColor: theme?.divider || '#F0F2F5' }]}>
        <View style={styles.driverInfo}>
          <Ionicons 
            name="person-circle" 
            size={24} 
            color={theme?.text?.secondary || '#6B7280'} 
          />
          <Text style={[styles.driverName, { color: theme?.text?.primary || '#171A1F' }]}>
            {ride.driverName}
          </Text>
        </View>
        
        <View style={styles.carInfo}>
          <Ionicons name="car" size={20} color={theme?.text?.secondary || '#6B7280'} />
          <Text style={[styles.carName, { color: theme?.text?.secondary || '#6B7280' }]}>
            {ride.carModel}
          </Text>
        </View>
        
        <View style={styles.seatsInfo}>
          <Ionicons name="people" size={20} color={theme?.text?.secondary || '#6B7280'} />
          <Text style={[styles.seats, { color: theme?.text?.secondary || '#6B7280' }]}>
            {ride.availableSeats} koltuk
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  perPerson: {
    fontSize: 12,
    marginLeft: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationIndicators: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 30,
    marginVertical: 4,
  },
  endDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  locationDetails: {
    flex: 1,
  },
  locationItem: {
    marginBottom: 16,
  },
  time: {
    fontSize: 12,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  carName: {
    fontSize: 14,
    marginLeft: 4,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seats: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default RideSummaryCard;
